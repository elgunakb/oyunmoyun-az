import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

serve(async (req) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { code, roomPassword, player } = body || {};

    if (!code || !player?.playerId || !player?.name) {
      return new Response(JSON.stringify({ message: 'Missing fields' }), {
        status: 400,
        headers: cors,
      });
    }

    // Otağı oxu (flag ilə)
    const { data: room, error } = await supabase
      .from('rooms')
      .select('id, code, status, host_player_id, is_password_protected')
      .eq('code', code)
      .single();

    if (error || !room) {
      return new Response(JSON.stringify({ message: 'Room not found' }), {
        status: 404,
        headers: cors,
      });
    }

    const incomingId = String(player.playerId).trim();
    const isHost =
      room.host_player_id && String(room.host_player_id).trim() === incomingId;

    // QONAQ + parol qorunursa → parol yoxla
    if (!isHost && room.is_password_protected) {
      // Hash-i götür
      const { data: secret } = await supabase
        .from('room_secrets')
        .select('password_hash')
        .eq('room_id', room.id)
        .maybeSingle();

      if (secret?.password_hash) {
        if (!roomPassword) {
          return new Response(
            JSON.stringify({ message: 'Password required' }),
            { status: 401, headers: cors }
          );
        }
        // Dinamik import – səhv olsa da catch-ə düşəcək və CORS qorunacaq
        const bcrypt = (await import('npm:bcryptjs@2.4.3')).default;
        const ok = await bcrypt.compare(
          String(roomPassword),
          secret.password_hash
        );
        if (!ok) {
          return new Response(JSON.stringify({ message: 'Invalid password' }), {
            status: 403,
            headers: cors,
          });
        }
      }
    }

    // Üzv kimi idempotent yaz
    await supabase.from('room_members').upsert(
      {
        room_id: room.id,
        player_id: incomingId,
        name: player.name,
        avatar: player.avatar ?? null,
        is_host: isHost,
      },
      { onConflict: 'room_id,player_id' }
    );

    return new Response(
      JSON.stringify({ ok: true, roomId: room.id, status: room.status }),
      { status: 200, headers: cors }
    );
  } catch (e) {
    // HƏR HALDA CORS BAŞLIQLARI QAYTAR
    return new Response(JSON.stringify({ message: e?.message || 'Error' }), {
      status: 500,
      headers: cors,
    });
  }
});
