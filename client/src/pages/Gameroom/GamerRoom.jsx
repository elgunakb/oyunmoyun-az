// client/src/pages/GameRoom/GameRoom.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import socket from '../../lib/socket';
import usePageTitle from '../../components/PageTitle';

export default function GameRoom() {
  usePageTitle('Quisor — Ad, şəhər oyunu');

  const { code: roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [letter, setLetter] = useState(state?.letter ?? null);
  const [t, setT] = useState(state?.duration ?? 60);
  const categories = useMemo(() => state?.options ?? [], [state]);
  const [answers, setAnswers] = useState({});

  // son vəziyyəti submit etmək üçün ref
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // double-submit & double-navigate qoruması
  const submittedRef = useRef(false);
  const navigatedRef = useRef(false);

  const handleChange = useCallback((k, v) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    socket.emit('submitAnswers', {
      roomId,
      playerId: state?.playerId ?? state?.userId ?? 'me',
      answers: answersRef.current, // həmişə ən son cavablar
    });
  }, [roomId, state?.playerId, state?.userId]);

  useEffect(() => {
    const onStarted = (payload) => {
      if (payload?.letter) setLetter(payload.letter);
      if (typeof payload?.duration === 'number') setT(payload.duration);
      submittedRef.current = false;
      navigatedRef.current = false;
    };
    socket.on('game:started', onStarted);

    const onTick = ({ t }) => {
      setT(t);
      // ✅ server hələ "running" ikən cavabları göndərək
      if (t <= 1) {
        handleSubmit(); // yalnız 1 dəfə işləyəcək (submittedRef ilə qorunur)
      }
    };
    socket.on('round:timer', onTick);

    const onReview = () => {
      handleSubmit();
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigate(`/game-stat/${roomId}`, {
          state: {
            roomId,
            nickname: state?.nickname,
            playerId: state?.playerId,
            isHost: state?.isHost,
          },
          replace: true,
        });
      }
    };
    socket.on('round:review', onReview);

    return () => {
      socket.off('game:started', onStarted);
      socket.off('round:timer', onTick);
      socket.off('round:review', onReview);
    };
  }, [handleSubmit, navigate, roomId, state?.nickname, state?.playerId]);

  // (istəyə bağlı) səhifədən çıxarkən də submit et
  useEffect(() => {
    const onBeforeUnload = () => handleSubmit();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [handleSubmit]);

  return (
    <main className="p-6 max-w-3xl mx-auto text-white space-y-4">
      <header className="flex items-center justify-between">
        <div className="text-xl">
          Hərf: <span className="font-black">{letter || '—'}</span>
        </div>
        <div className="text-lg">
          Vaxt: <span className="font-semibold">{t}s</span>
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="grid gap-3">
          {categories.map((k) => (
            <div key={k} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-white/80">{k}</span>
              <input
                value={answers[k] ?? ''}
                onChange={(e) => handleChange(k, e.target.value)}
                placeholder={`"${k}" üçün söz…`}
                className="flex-1 px-4 py-2 rounded-lg bg-black/30 border text-white border-white/10 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Göndər düyməsini gizlədirik – vaxt bitəndə auto-submit */}
        {/* <div className="pt-4"><button type="submit" ...>Göndər</button></div> */}
        <p className="text-xs text-white/50 pt-2">
          Vaxt bitəndə cavablar avtomatik göndəriləcək.
        </p>
      </form>
    </main>
  );
}
