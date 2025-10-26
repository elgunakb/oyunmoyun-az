import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import CopyToClipboard from '../../components/CopyButton/CopyButton';

import { useRoom } from '../../components/WaitingRoom/hooks/useRoom';
import { useAutoJoin } from '../../components/WaitingRoom/hooks/useAuthJoin';
import { usePresence } from '../../components/WaitingRoom/hooks/usePresence';

import WaitingHeader from '../../components/WaitingRoom/components/WaitingHeader';
import RoomMeta from '../../components/WaitingRoom/components/RoomMeta';
import PlayersPanel from '../../components/WaitingRoom/components/PlayersPanel';
import PasswordModal from '../../components/WaitingRoom/components/PasswordModal';

export default function WaitingRoom() {
  const { code } = useParams();
  const [search] = useSearchParams();
  const urlPwd = search.get('pwd') || '';

  const { user } = useAuth();
  const { room, loading } = useRoom(code);

  const isHost = useMemo(
    () => room && user?.playerId === room.host_player_id,
    [room, user]
  );
  const {
    joined,
    needPassword,
    setNeedPassword,
    joinError,
    setJoinError,
    tryJoin,
  } = useAutoJoin({
    code,
    room,
    user,
    urlPwd,
    isHost,
  });
  const players = usePresence({ code, joined, user, isHost });

  const [pw, setPw] = useState(urlPwd);

  const startGame = useCallback(async () => {
    if (!isHost) return;
    await supabase.functions.invoke('start-room', {
      body: { code, hostPlayerId: user.playerId },
    });
  }, [code, isHost, user?.playerId]);

  const submitPassword = useCallback(
    async (e) => {
      e.preventDefault();
      setJoinError('');
      const verify = await supabase.functions.invoke('verify-password', {
        body: { code, roomPassword: pw },
      });
      if (verify.error || !verify.data?.success) {
        setJoinError('Şifrə yalnışdır');
        return;
      }
      const ok = await tryJoin(pw);
      if (ok) setPw('');
    },
    [code, pw, tryJoin, setJoinError]
  );

  const roomLink = useMemo(
    () => `${window.location.origin}/waiting-room/${code}`,
    [code]
  );

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto w-full mt-8 p-6 text-center text-white/80">
        <div className="min-h-screen flex items-center justify-center px-4">
          {/* loading spin */}
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto w-full mt-8">
      <section className="bg-[#0c161e] rounded-xl shadow-md p-6 text-center mb-4">
        <WaitingHeader code={code} room={room} />
        <RoomMeta room={room} />
        <div className="p-3 rounded-lg mb-6 max-w-lg mx-auto">
          <CopyToClipboard textToCopy={roomLink} />
        </div>

        <div className="flex flex-col items-center gap-3 max-w-lg mx-auto w-full">
          <button
            onClick={startGame}
            disabled={!isHost || players.length < 2}
            className="w-full px-6 py-4 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-lg transition-all duration-200 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed"
            title={
              !isHost
                ? 'Yalnız host başlada bilər'
                : players.length < 2
                ? 'Minimum 2 oyunçu lazımdır'
                : 'Oyunu başlat'
            }
          >
            Oyunu başlat
          </button>
        </div>
      </section>

      <PlayersPanel players={players} room={room} />

      <PasswordModal
        open={needPassword}
        onClose={() => {
          setNeedPassword(false);
          setPw('');
        }}
        onSubmit={submitPassword}
        value={pw}
        error={joinError}
        onChange={setPw}
      />
    </main>
  );
}
