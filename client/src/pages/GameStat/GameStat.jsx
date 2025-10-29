// client/src/pages/GameStat/GameStat.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../../lib/socket';

export default function GameStat() {
  const { code: roomId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const me = state?.nickname ?? 'Anon';
  const isHost = !!state?.isHost;

  const [players, setPlayers] = useState([]);
  const [answers, setAnswers] = useState({}); // {name:{cat:text}}
  const [votes, setVotes] = useState({}); // {name:{cat:{positive,negative}}}
  const [scores, setScores] = useState({}); // cari raundun xalları
  const [roundHistory, setRoundHistory] = useState([]); // [{round, scores, _id}]
  const [myChoice, setMyChoice] = useState({}); // {'target::cat': 'positive'|'negative'}
  const [showTotals, setShowTotals] = useState(false);

  // answersRef – listeners üçün
  const answersRef = useRef({});
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // ❶ MOUNT-da: join + sync
  useEffect(() => {
    socket.emit('room:join', {
      code: roomId,
      roomId,
      player: { playerId: state?.playerId ?? 'anon', name: me },
    });
    socket.emit('state:sync', { roomId });
    return () => {};
  }, [roomId, me, state?.playerId]);

  // ❷ Listener-lar
  useEffect(() => {
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

      // server roundScores-u göndərirsə tarixçəni saxla
      if (Array.isArray(payload?.roundScores)) {
        setRoundHistory(payload.roundScores);
      }
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

    // cari raund bitəndə — round tarixinə əlavə et (server göndərirsə)
    const onDone = ({ scores, round }) => {
      setScores(scores || {});
      setRoundHistory((prev) => {
        // eyni round təkrar gəlməsin
        const next = [...prev];
        if (!next.some((r) => r.round === round)) {
          next.push({ round, scores });
        }
        return next;
      });
    };

    const onStarted = (payload) => {
      const duration =
        typeof payload?.duration === 'number' ? payload.duration : 60;
      const letter = payload?.letter ?? null;
      let options = Array.isArray(payload?.categories)
        ? payload.categories
        : null;
      if (!options) {
        const set = new Set();
        Object.values(answersRef.current).forEach((m) =>
          Object.keys(m || {}).forEach((c) => set.add(c))
        );
        options = Array.from(set);
      }
      navigate(`/game/${roomId}`, {
        state: {
          code: roomId,
          letter,
          duration,
          options,
          playerId: state?.playerId,
          nickname: me,
          isHost,
        },
        replace: true,
      });
    };

    const onOver = () => navigate(`/waiting-room/${roomId}`, { replace: true });

    socket.on('initialData', onInitial);
    socket.on('room:update', onRoomUpdate);
    socket.on('updateVotes', onUpdateVotes);
    socket.on('review:done', onDone);
    socket.on('game:started', onStarted);
    socket.on('game:over', onOver);

    return () => {
      socket.off('initialData', onInitial);
      socket.off('room:update', onRoomUpdate);
      socket.off('updateVotes', onUpdateVotes);
      socket.off('review:done', onDone);
      socket.off('game:started', onStarted);
      socket.off('game:over', onOver);
    };
  }, [navigate, roomId, me, isHost, state?.playerId]);

  // Bütün kateqoriyalar
  const allCategories = useMemo(() => {
    const set = new Set();
    Object.values(answers).forEach((m) =>
      Object.keys(m || {}).forEach((c) => set.add(c))
    );
    return Array.from(set);
  }, [answers]);

  // ❸ Review tamamdırmı? (bütün boş olmayan cavablar üçün səs sayı = oyunçu sayı)
  const reviewComplete = useMemo(() => {
    const votersRequired = players.length;
    if (votersRequired === 0) return false;

    for (const playerName of players) {
      const a = answers?.[playerName] || {};
      for (const cat of allCategories) {
        const txt = (a?.[cat] || '').trim();
        if (!txt) continue; // boş cavablar sayılır (disabled, auto-negativ ola bilər)
        const v = votes?.[playerName]?.[cat] || { positive: 0, negative: 0 };
        const total = (v.positive || 0) + (v.negative || 0);
        if (total < votersRequired) return false;
      }
    }
    return true;
  }, [players, answers, votes, allCategories]);

  // ❹ Bütün raundların CƏMİ
  const totals = useMemo(() => {
    const out = {};
    // tarixçədən
    for (const r of roundHistory) {
      const sc = r?.scores || {};
      for (const [name, val] of Object.entries(sc)) {
        out[name] = (out[name] || 0) + (val || 0);
      }
    }
    // ehtiyat: cari raund (tarixçəyə düşməyibsə)
    for (const [name, val] of Object.entries(scores || {})) {
      out[name] = (out[name] || 0) + (val || 0);
    }
    return out;
  }, [roundHistory, scores]);

  const cast = useCallback(
    (target, category, voteType) => {
      const key = `${target}::${category}`;
      if (myChoice[key] === voteType) return;
      socket.emit('castVote', {
        roomId,
        voter: me,
        target,
        category,
        voteType,
      });
      setMyChoice((prev) => ({ ...prev, [key]: voteType }));
    },
    [roomId, me, myChoice]
  );

  // ❺ Review-u bitir — yalnız host və reviewComplete olduqda aktiv.
  const finishReview = useCallback(() => {
    if (!isHost || !reviewComplete) return;
    socket.emit('review:finish', { roomId });
    setShowTotals(true); // cəmləri göstər
  }, [roomId, isHost, reviewComplete]);

  const nextRound = useCallback(() => {
    if (!isHost) return;
    setShowTotals(false);
    socket.emit('round:next', { roomId });
  }, [roomId, isHost]);

  return (
    <main className="p-6 max-w-4xl mx-auto text-white space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Səsvermə</h1>
        <div className="flex gap-2">
          <button
            onClick={finishReview}
            disabled={!isHost || !reviewComplete}
            className={`px-3 py-2 rounded ${
              !isHost || !reviewComplete
                ? 'bg-emerald-900/40 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            title={
              !isHost
                ? 'Yalnız host bitirə bilər'
                : !reviewComplete
                ? 'Hamı bütün cavablara səs verməyib'
                : 'Review-u bitir'
            }
          >
            Review-u bitir
          </button>

          <button
            onClick={nextRound}
            disabled={!isHost}
            className={`px-3 py-2 rounded ${
              isHost
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-900/40 cursor-not-allowed'
            }`}
            title={isHost ? 'Növbəti tur' : 'Yalnız host keçə bilər'}
          >
            Növbəti tur
          </button>
        </div>
      </header>

      {/* SƏSVERMƏ BLOKU */}
      <section className="space-y-4">
        {players.map((name) => (
          <div key={name} className="bg-white/5 rounded-lg p-4">
            <div className="font-semibold mb-2">{name}</div>
            <div className="space-y-2">
              {allCategories.map((cat) => {
                const text = (answers?.[name]?.[cat] || '').trim();
                const v = votes?.[name]?.[cat] || { positive: 0, negative: 0 };
                const key = `${name}::${cat}`;
                const choice = myChoice[key];
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

      {/* CƏMLƏR – yalnız Review bitəndən sonra görünür */}
      {showTotals && Object.keys(totals).length > 0 && (
        <section className="bg-white/5 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Ümumi xallar (bütün raundlar)</h2>
          <ul className="grid md:grid-cols-2 gap-2">
            {Object.entries(totals)
              .sort((a, b) => b[1] - a[1])
              .map(([n, s]) => (
                <li
                  key={n}
                  className="flex items-center justify-between bg-black/30 rounded px-3 py-2 border border-white/10"
                >
                  <span className="font-semibold">{n}</span>
                  <span className="text-emerald-300 font-bold">{s}</span>
                </li>
              ))}
          </ul>
          <p className="text-white/60 text-sm mt-2">
            Qeyd: Bu cədvəl oynanmış bütün raundların cəmini göstərir. “Növbəti
            tur” ilə oyuna davam edə bilərsiniz.
          </p>
        </section>
      )}
    </main>
  );
}
