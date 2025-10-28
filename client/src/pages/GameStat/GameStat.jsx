// client/src/pages/GameStat/GameStat.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../../lib/socket';

export default function GameStat() {
  const { code: roomId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const me = state?.nickname ?? 'Anon';

  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState({});
  const [votes, setVotes] = useState({});
  const [scores, setScores] = useState({});
  const [myChoice, setMyChoice] = useState({}); // {'target::cat': 'positive'|'negative'}

  useEffect(() => {
    socket.emit('room:join', {
      code: roomId,
      roomId,
      player: { playerId: state?.playerId ?? 'anon', name: me },
    });
    socket.emit('state:sync', { roomId });

    const onInitial = (arr) => {
      const payload = Array.isArray(arr) ? arr[1] : arr;
      setPlayers(payload.players || []);
      setAnswers(payload.answers || {});
      setVotes(payload.votes || {});
    };
    const onRoomUpdate = (payload) => {
      if (Array.isArray(payload)) return;
      const list = payload?.connectedPlayers?.length
        ? payload.connectedPlayers
        : payload?.players || [];
      if (list?.length) setPlayers(list);
    };
    const onUpdateVotes = (arr) => {
      const payload = Array.isArray(arr) ? arr[1] : arr;
      setVotes((prev) => {
        const copy = { ...prev };
        copy[payload.player] ??= {};
        copy[payload.player][payload.category] = payload.votes;
        return copy;
      });
    };
    const onDone = ({ scores }) => setScores(scores || {});

    socket.on('initialData', onInitial);
    socket.on('room:update', onRoomUpdate);
    socket.on('updateVotes', onUpdateVotes);
    socket.on('review:done', onDone);

    return () => {
      socket.off('initialData', onInitial);
      socket.off('room:update', onRoomUpdate);
      socket.off('updateVotes', onUpdateVotes);
      socket.off('review:done', onDone);
    };
  }, [roomId, me, state?.playerId]);

  const allCategories = useMemo(() => {
    const set = new Set();
    Object.values(answers).forEach((m) =>
      Object.keys(m || {}).forEach((c) => set.add(c))
    );
    return Array.from(set);
  }, [answers]);

  const cast = useCallback(
    (target, category, voteType) => {
      const key = `${target}::${category}`;
      // UI səviyyəsində eyni düyməyə ikinci dəfə allow etməyək
      if (myChoice[key] === voteType) return;

      socket.emit('castVote', {
        roomId,
        voter: me,
        target,
        category,
        voteType, // 'positive' | 'negative'
      });

      setMyChoice((prev) => ({ ...prev, [key]: voteType }));
    },
    [roomId, me, myChoice]
  );

  const finishReview = useCallback(() => {
    socket.emit('review:finish', { roomId });
  }, [roomId]);

  const nextRound = useCallback(() => {
    socket.emit('round:next', { roomId });
    navigate(`/waiting-room/${roomId}`, { replace: true });
  }, [navigate, roomId]);

  return (
    <main className="p-6 max-w-4xl mx-auto text-white space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Səsvermə</h1>
        <div className="flex gap-2">
          <button
            onClick={finishReview}
            className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700"
          >
            Review-u bitir
          </button>
          <button
            onClick={nextRound}
            className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
          >
            Növbəti tur
          </button>
        </div>
      </header>

      <section className="space-y-4">
        {players.map((name) => (
          <div key={name} className="bg-white/5 rounded-lg p-4">
            <div className="font-semibold mb-2">{name}</div>
            <div className="space-y-2">
              {allCategories.map((cat) => {
                const text = (answers?.[name]?.[cat] || '').trim();
                const v = votes?.[name]?.[cat] || { positive: 0, negative: 0 };
                const key = `${name}::${cat}`;
                const choice = myChoice[key]; // 'positive' | 'negative' | undefined

                // Boş cavab — hər iki düymə deaktiv
                const isBlank = text.length === 0;

                const disablePos = isBlank || choice === 'positive';
                const disableNeg = isBlank || choice === 'negative';

                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 text-white/80">{cat}</div>
                    <div className="flex-1">
                      {text || <span className="text-white/40">— boş —</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={disablePos}
                        onClick={() => cast(name, cat, 'positive')}
                        className={`px-2 py-1 rounded ${
                          disablePos
                            ? 'bg-emerald-900/40 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        ✓ {v.positive || 0}
                      </button>
                      <button
                        disabled={disableNeg}
                        onClick={() => cast(name, cat, 'negative')}
                        className={`px-2 py-1 rounded ${
                          disableNeg
                            ? 'bg-rose-900/40 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        ✗ {v.negative || 0}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {Object.keys(scores).length > 0 && (
        <section className="bg-white/5 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Xallar</h2>
          <ul className="grid md:grid-cols-2 gap-2">
            {Object.entries(scores).map(([n, s]) => (
              <li
                key={n}
                className="flex items-center justify-between bg-black/30 rounded px-3 py-2 border border-white/10"
              >
                <span className="font-semibold">{n}</span>
                <span className="text-emerald-300 font-bold">{s}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
