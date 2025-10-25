// supabase/functions/create-room/index.ts

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs'; // Deno npm shim

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function code5() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 5; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const {
      roomName,
      roomPassword,
      options = {},
      letters = [],
      categories = [],
      gameTime,
      host,
    } = body || {};

    if (!roomName || !host?.playerId || !host?.name || !gameTime) {
      return new Response(JSON.stringify({ message: 'Missing fields' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // unikal 5-lik kod
    let code = code5();
    for (let i = 0; i < 5; i++) {
      const { data: exists, error: exErr } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (exErr) break; // seçimin: səhv olsa, loopu kəs
      if (!exists) break; // boşdursa kod uyğundur
      code = code5(); // doludursa yenisini yarat
    }

    // otağı yaz
    const { data: room, error } = await supabase
      .from('rooms')
      .insert({
        code,
        name: roomName,
        options,
        letters,
        categories,
        game_time: Number(gameTime),
        host_player_id: host.playerId,
        host_name: host.name,
        host_avatar: host.avatar ?? null,
        is_password_protected: !!(
          roomPassword && String(roomPassword).length > 0
        ), // <-- YENİ
      })
      .select('id, code, status')
      .single();

    if (error) throw error;

    // şifrə varsa hash saxla
    if (roomPassword && String(roomPassword).length > 0) {
      const saltRounds = Number(Deno.env.get('BCRYPT_SALT_ROUNDS') || '10');
      const hash = await bcrypt.hash(String(roomPassword), saltRounds);
      const { error: secErr } = await supabase.from('room_secrets').insert({
        room_id: room.id,
        password_hash: hash,
      });
      if (secErr) throw secErr;
    }

    // host-u üzv kimi qeyd et
    const { error: memErr } = await supabase.from('room_members').insert({
      room_id: room.id,
      player_id: host.playerId,
      name: host.name,
      avatar: host.avatar ?? null,
      is_host: true,
    });
    if (memErr) throw memErr;

    return new Response(
      JSON.stringify({
        room,
        redirectUrl: `/waiting-room/${room.code}`,
      }),
      { status: 201, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ message: e?.message ?? 'Internal error' }),
      {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      }
    );
  }
});
