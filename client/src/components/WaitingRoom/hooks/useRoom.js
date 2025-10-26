import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabaseClient';

export function useRoom(code) {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(
          'id, code, status, host_player_id, name, options, letters, categories, game_time, is_password_protected'
        )
        .eq('code', code)
        .single();

      if (cancelled) return;

      if (error || !data) {
        navigate('/');
        return;
      }
      setRoom(data);
      setLoading(false);

      if (data.status === 'started') navigate(`/game/${code}`);
    })();

    return () => {
      cancelled = true;
    };
  }, [code, navigate]);

  useEffect(() => {
    if (!code) return;
    const ch = supabase
      .channel(`room-status:${code}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${code}`,
        },
        (payload) => {
          if (payload?.new?.status === 'started') navigate(`/game/${code}`);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [code, navigate]);

  return { room, loading, setRoom };
}
