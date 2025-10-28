import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
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
import socket from '../../lib/socket';

export default function WaitingRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const urlPwd = search.get('pwd') || '';

  const { user } = useAuth();
  const { room, loading } = useRoom(code);

  // Yeni backend strukturunu normalize edirik
  const normalizedRoom = useMemo(() => {
    if (!room) return null;
    return {
      ...room,
      roomName: room.name ?? room.roomName ?? '',
      // Səndə oyun içi kateqoriyalar OPTIONS-dur
      categories: Array.isArray(room.options)
        ? room.options
        : room.categories || [],
      // Oyun adını ayrıca saxla (RoomMeta üçündür)
      gameTitle: Array.isArray(room.categories)
        ? room.categories[0]
        : undefined,
      timer: room.game_time ?? room.timer ?? 60,
    };
  }, [room]);

  const isHost = useMemo(
    () => !!normalizedRoom && user?.playerId === normalizedRoom.host_player_id,
    [normalizedRoom, user?.playerId]
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
    room: normalizedRoom,
    user,
    urlPwd,
    isHost,
  });

  const players = usePresence({ code, joined, user, isHost });
  const [pw, setPw] = useState(urlPwd);

  // Oyunu başlat – Socket ilə (roomId kimi CODE istifadə edirik)
  const startGame = useCallback(() => {
    if (!isHost) return;
    socket.emit('game:start', {
      code, // eyni açar kimi istifadə
      roomId: code, // server rooms.get(roomId||code) üçün
      hostPlayerId: user.playerId,
      duration: normalizedRoom?.timer ?? 60,
    });
  }, [code, isHost, user?.playerId, normalizedRoom?.timer]);

  // Otağı server RAM-ına hydrate et — _id = code
  useEffect(() => {
    if (!normalizedRoom) return;
    socket.emit('room:hydrate', [
      {
        _id: code, // <-- AÇAR = CODE
        code, // ayrıca saxlayırıq
        roomName: normalizedRoom.roomName,
        host: '',
        visibility: normalizedRoom.status || 'waiting',
        passwordHash: null,
        encryptedPassword: null,
        passwordIV: null,
        categories: normalizedRoom.categories || [], // OPTIONS
        letters: normalizedRoom.letters || [],
        selectedLetter: null,
        playerCount: 0,
        timer: normalizedRoom.timer ?? 60,
        connectedPlayers: [],
        players: [],
        stage: normalizedRoom.status || 'waiting',
        currentRound: 0,
        roundScores: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }, [normalizedRoom, code]);

  // Auto-join uğurlu olanda socket otağına qoşul və üzvləri yenilə
  useEffect(() => {
    if (!joined || !user?.playerId || !code) return;

    socket.emit('room:join', {
      code, // join üçün də CODE istifadə edirik
      roomId: code,
      player: {
        playerId: user.playerId,
        name: user.name,
        avatar: user.image || '',
      },
    });

    return () => {
      socket.emit('room:leave', {
        code,
        roomId: code,
        playerId: user.playerId,
      });
    };
  }, [joined, user?.playerId, user?.name, user?.image, code]);

  // Oyun başlayanda GameRoom-a yönləndir
  useEffect(() => {
    const onStarted = (payload) => {
      const letter = payload?.letter ?? null;
      const roundIndex =
        typeof payload?.roundIndex === 'number'
          ? payload.roundIndex
          : typeof payload?.round === 'number'
          ? payload.round - 1
          : 0;
      const duration =
        typeof payload?.duration === 'number'
          ? payload.duration
          : normalizedRoom?.timer ?? 60;
      const categories = Array.isArray(payload?.categories)
        ? payload.categories
        : normalizedRoom?.categories || [];

      navigate(`/game/${code}`, {
        state: {
          code,
          roundIndex,
          letter,
          duration,
          options: categories,
          players,
          playerId: user.playerId,
          nickname: user.name,
          isHost,
        },
        replace: true,
      });
    };

    socket.on('game:started', onStarted);
    return () => socket.off('game:started', onStarted);
  }, [
    navigate,
    code,
    normalizedRoom?.categories,
    normalizedRoom?.timer,
    players,
    user?.playerId,
    user?.name,
  ]);

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

  if (loading || !normalizedRoom) {
    return (
      <main className="max-w-4xl mx-auto w-full mt-8 p-6 text-center text-white/80">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto w-full mt-8">
      <section className="bg-[#0c161e] rounded-xl shadow-md p-6 text-center mb-4">
        <WaitingHeader code={code} room={normalizedRoom} />
        <RoomMeta room={normalizedRoom} />

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

          {joinError && (
            <p className="text-red-400 text-sm mt-1">{joinError}</p>
          )}
        </div>
      </section>

      <PlayersPanel players={players} room={normalizedRoom} />

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
