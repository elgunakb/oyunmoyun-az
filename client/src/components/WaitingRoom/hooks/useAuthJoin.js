import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

async function joinRoomRequest({ code, user, password }) {
  return supabase.functions.invoke('join-room', {
    body: {
      code,
      ...(password ? { roomPassword: password } : {}),
      player: {
        playerId: user.playerId,
        name: user.name,
        avatar: user.image || '',
      },
    },
  });
}

export function useAutoJoin({ code, room, user, urlPwd, isHost }) {
  const [joined, setJoined] = useState(false);
  const [needPassword, setNeedPassword] = useState(false);
  const [joinError, setJoinError] = useState('');
  const triedRef = useRef(false);

  const tryJoin = useCallback(
    async (password) => {
      setJoinError('');
      const resp = await joinRoomRequest({ code, user, password });
      if (resp.error) {
        const status =
          resp.error?.context?.response?.status ?? resp.error?.status ?? 0;
        if (status === 401 || status === 403) {
          setNeedPassword(true);
          setJoined(false);
          setJoinError(status === 403 ? 'Şifrə yalnışdır' : '');
          return false;
        }
        setJoinError(resp.error.message || 'Otağa qoşulmaq alınmadı');
        return false;
      }
      setJoined(true);
      setNeedPassword(false);
      return true;
    },
    [code, user]
  );

  useEffect(() => {
    (async () => {
      if (triedRef.current) return;
      if (!user?.playerId || !room) return;
      triedRef.current = true;

      if (isHost) {
        await tryJoin(); // host parolsuz
        return;
      }
      if (room.is_password_protected && !urlPwd) {
        setNeedPassword(true);
        return;
      }
      await tryJoin(urlPwd);
    })();
  }, [room, user, isHost, urlPwd, tryJoin]);

  return {
    joined,
    needPassword,
    setNeedPassword,
    joinError,
    setJoinError,
    tryJoin,
  };
}
