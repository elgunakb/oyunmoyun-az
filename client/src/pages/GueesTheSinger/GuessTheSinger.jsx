import socket from '../../lib/socket';
import { Timer, Volume2, Crown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import wrongSfx from '../../assets/sounds/wrong-answer.mp3';
import correctSfx from '../../assets/sounds/correct-answer.wav';
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer';
import usePageTitle from '../../components/PageTitle';

export default function GameSingerSolo() {
  usePageTitle('Quisor — Guess the Singer');

  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const nickname = state?.nickname ?? 'Player';
  const audioRef = useRef(null);

  const correctRef = useRef(null);
  const wrongRef = useRef(null);

  const [phase, setPhase] = useState('loading');
  const [roundIndex, setRoundIndex] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [question, setQuestion] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);

  useEffect(() => {
    correctRef.current = new Audio(correctSfx);
    wrongRef.current = new Audio(wrongSfx);
    correctRef.current.volume = 0.5;
    wrongRef.current.volume = 0.5;

    const unlock = () => {
      correctRef.current
        .play()
        .then(() => {
          correctRef.current.pause();
          correctRef.current.currentTime = 0;
        })
        .catch(() => {});
      wrongRef.current
        .play()
        .then(() => {
          wrongRef.current.pause();
          wrongRef.current.currentTime = 0;
        })
        .catch(() => {});

      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      [correctRef.current, wrongRef.current].forEach((a) => {
        try {
          a && a.pause();
        } catch {}
      });
    };
  }, []);

  useEffect(() => {
    if (question?.audio && audioRef.current) {
      const el = audioRef.current;
      try {
        el.pause();
      } catch {}
      el.src = question.audio;
      el.load();

      const tryPlay = () => el.play().catch(() => {});
      el.oncanplay = tryPlay;
      const t = setTimeout(tryPlay, 150);

      return () => {
        el.oncanplay = null;
        clearTimeout(t);
      };
    }
  }, [question?.audio]);

  useEffect(() => {
    if (!roomId) return;
    socket.emit('solo:sync', { roomId }, (resp) => {
      if (resp?.ok && resp.payload) {
        const msg = resp.payload;
        setPhase('playing');
        setRoundIndex(msg.roundIndex);
        setTotalRounds(msg.totalRounds);
        setTimeLeft(msg.timeLeft);
        setQuestion(msg.question);
        setScore(msg.score);
        setReveal(null);
        setLocked(false);
        setMyAnswer(null);
      }
    });
  }, [roomId]);

  useEffect(() => {
    function onState(msg) {
      setPhase('playing');
      setRoundIndex(msg.roundIndex);
      setTotalRounds(msg.totalRounds);
      setTimeLeft(msg.timeLeft);
      setQuestion(msg.question);
      setScore(msg.score);
      setReveal(null);
      setLocked(false);
      setMyAnswer(null);
    }

    function onTick(msg) {
      setTimeLeft(msg.timeLeft);
    }

    function onReveal(msg) {
      setReveal({ correctArtist: msg.correctArtist, title: msg.title });
      setLocked(true);

      const isCorrect = myAnswer && msg.correctArtist === myAnswer;

      const sfx = isCorrect ? correctRef.current : wrongRef.current;
      if (sfx) {
        try {
          sfx.currentTime = 0;
          sfx.play().catch(() => {});
        } catch {}
      }
    }

    function onFinished(msg) {
      setPhase('finished');
      setScore(msg.score);
      setTotalRounds(msg.totalRounds);
    }

    socket.on('solo:state', onState);
    socket.on('solo:tick', onTick);
    socket.on('solo:reveal', onReveal);
    socket.on('solo:finished', onFinished);

    return () => {
      socket.off('solo:state', onState);
      socket.off('solo:tick', onTick);
      socket.off('solo:reveal', onReveal);
      socket.off('solo:finished', onFinished);
    };
  }, [myAnswer]);

  const answer = (artist) => {
    if (locked || !question) return;
    setLocked(true);
    setMyAnswer(artist);
    socket.emit('solo:answer', { roomId, artist });
  };

  if (phase === 'finished') {
    return (
      <div className="max-w-xl mx-auto p-6">
        {/* <div className="flex items-center gap-3 mb-6">
          <Crown className="w-6 h-6" />
          {/* <h1 className="text-xl font-extrabold">Leaderboard</h1> */}
        {/* </div> */}
        <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
          <div className="flex items-center justify-between text-lg mb-3">
            <p className="text-white/70 ">Oynanan roundlar: {totalRounds}</p>
            <span className=" text-white/70">Toplam xal : {score} </span>
          </div>
          <span></span>
        </div>

        <button
          className="mt-6 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-400 font-bold"
          onClick={() => navigate('/')}
        >
          Ana səhifə
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full mt-6">
      <div className="bg-[#0c161e] backdrop-blur-sm rounded-xl shadow-md flex flex-col min-h-[500px] p-4 sm:p-8 overflow-hidden">
        {/* Header */}
        <div className="hidden sm:flex flex-col sm:flex-row items-center gap-2 mb-4 rounded-2xl border border-white/10 bg-white/5 p-2 sm:p-4">
          {/* round sayi */}
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-2">
              {/* roundun sayi */}
              <div className="border-white/10 bg-white/5 border text-white font-bold px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 min-w-[80px] sm:min-w-[100px]">
                <b>{roundIndex + 1}</b>/<b>{totalRounds}</b>
              </div>
              {/* <span className="text-lg text-gray-500 hidden sm:inline">
                Round
              </span> */}
            </div>
          </div>

          {/* saniye */}
          <div className="hidden sm:flex items-center justify-center grow">
            <div className="border-white/10 bg-white/5 border px-6 py-2 rounded-lg shadow-sm flex items-center gap-2">
              <Timer className="w-4 h-4 text-white" />
              <span className="font-medium text-lg text-white">{timeLeft}</span>
              <span className="font-medium text-white">s</span>
            </div>
          </div>

          {/* kateqoriya */}
          <div className="sm:flex items-center justify-center">
            <div className="border-white/10 bg-white/5 border px-6 py-2 rounded-lg shadow-sm flex items-center gap-2">
              <img src="" alt="" />
              <span className="truncate max-w-[120px] text-white">
                Xal: <b>{score}</b>
              </span>
            </div>
          </div>

          {/* <div className="text-lg text-white ">Oyun: Oxuyanı tap</div> */}
          <div className="flex items-center gap-2">
            {/* <Timer className="w-4 h-4" />
            <span className="font-bold">{timeLeft}s</span> */}
          </div>
        </div>
        <div className="hidden sm:flex h-[120px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 relative">
          <div className="text-lg text-white ">Oxuyanı tap</div>
        </div>

        {/* Round & Score */}
        <div className="flex items-center justify-between">
          <div className="text-base text-white">
            {/* Round <b>{roundIndex + 1}</b>/<b>{totalRounds}</b> */}
          </div>
          <div className="text-base">{/* Xal: <b>{score}</b> */}</div>
        </div>

        {/* Audio + artwork */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-white/70 ">
                Dinlə və müğənnini seç
              </div>
              {reveal?.title && (
                <div className="text-xs text-white/60">
                  Mahnı: {reveal.title}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AudioPlayer key={question?.id} src={question?.audio} autoPlay />
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-white">
          {question?.options?.map((opt) => {
            const isCorrect = reveal?.correctArtist === opt;
            const isWrong =
              reveal &&
              isCorrect === false &&
              locked &&
              opt !== reveal.correctArtist;

            return (
              <button
                key={opt}
                disabled={locked}
                onClick={() => answer(opt)}
                className={[
                  'px-6 py-4 rounded-xl border text-left',
                  locked
                    ? isCorrect
                      ? 'border-green-500/50 bg-green-500/15'
                      : isWrong
                      ? 'border-red-500/40 bg-red-500/10'
                      : 'border-white/10 bg-white/5'
                    : 'border-white/10 bg-white/5 hover:bg-white/10',
                ].join(' ')}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
