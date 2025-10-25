import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs';

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
    const { code, roomPassword } = body;

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing code' }),
        {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: room, error } = await supabase
      .from('rooms')
      .select('id, is_password_protected')
      .eq('code', code)
      .single();

    if (error || !room) {
      return new Response(
        JSON.stringify({ success: false, message: 'Room not found' }),
        {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!room.is_password_protected) {
      return new Response(
        JSON.stringify({ success: true, not_required: true }),
        {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!roomPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Password required' }),
        {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: secret } = await supabase
      .from('room_secrets')
      .select('password_hash')
      .eq('room_id', room.id)
      .maybeSingle();

    if (!secret?.password_hash) {
      return new Response(
        JSON.stringify({ success: false, message: 'No password set' }),
        {
          status: 200,
          headers: { ...cors, 'Content-Type': 'application/json' },
        }
      );
    }

    const ok = await bcrypt.compare(String(roomPassword), secret.password_hash);
    return new Response(JSON.stringify({ success: !!ok }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, message: e.message }),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
