import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { code, hostPlayerId } = body;

    if (!code || !hostPlayerId) {
      return new Response(JSON.stringify({ message: 'Missing fields' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { data: room, error } = await supabase
      .from('rooms')
      .select('id, host_player_id, status')
      .eq('code', code)
      .single();

    if (error || !room) {
      return new Response(JSON.stringify({ message: 'Room not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (room.host_player_id !== hostPlayerId) {
      return new Response(JSON.stringify({ message: 'Only host can start' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (room.status !== 'waiting') {
      return new Response(
        JSON.stringify({ message: 'Room already started or ended' }),
        {
          status: 409,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      );
    }

    const { error: upErr } = await supabase
      .from('rooms')
      .update({ status: 'started' })
      .eq('id', room.id);

    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: e.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
