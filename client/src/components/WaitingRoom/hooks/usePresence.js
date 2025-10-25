import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export function usePresence({ code, joined, user, isHost }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!joined || !user?.playerId) return;

    const channel = supabase.channel(`waiting-room:${code}`, {
      config: { presence: { key: user.playerId } },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const list = Object.values(state).flat();
      setPlayers(list);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          playerId: user.playerId,
          name: user.name,
          avatar: user.image || '',
          isHost: !!isHost,
          joinedAt: Date.now(),
        });
      }
    });

    return () => supabase.removeChannel(channel);
  }, [code, user, isHost, joined]);

  return players;
}
