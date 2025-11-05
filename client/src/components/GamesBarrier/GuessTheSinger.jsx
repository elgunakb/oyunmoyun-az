// client/src/components/GuessTheSinger/GuessTheSinger.jsx
import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal/Modal';
import AccessibleButton from '../AccessibleButton/AccessibleButton';
import { X, Zap, Music, Timer, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from '../../lib/socket';

export default function GuessTheSinger({ open, onClose, game }) {
  const titleId = useId();
  const navigate = useNavigate();

  const [rounds, setRounds] = useState(10);
  const [roundTime, setRoundTime] = useState(15);
  const [category, setCategory] = useState('azerbaijani');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const canCreate = nickname.trim().length > 0;

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    if (!canCreate) return;

    socket.emit(
      'solo:create',
      { rounds, roundTime, category, nickname: nickname.trim() },
      (resp) => {
        if (!resp?.ok) {
          setError(resp?.error || 'Xəta baş verdi.');
          return;
        }
        onClose?.();
        navigate(`/game/singer/${resp.roomId}`, { state: { nickname } });
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} titleId={titleId}>
      <header className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Music className="w-5 h-5 text-white/80" />
          </div>
          <div>
            <h3 id={titleId} className="text-lg font-extrabold tracking-tight">
              {game?.title} — Oyun qur
            </h3>
            <p className="text-base text-white/70 -mt-0.5">
              Janrı, round sayını və vaxtı seç — başlayırıq!
            </p>
          </div>
        </div>

        <AccessibleButton
          onClick={() => onClose?.()}
          aria-label="Modaldan çıx"
          className="rounded-xl p-2 bg-white/10 hover:bg-white/15 text-white"
        >
          <X className="w-5 h-5" />
        </AccessibleButton>
      </header>

      <form
        onSubmit={handleCreate}
        className="p-4 sm:p-5 space-y-5 overflow-y-auto"
      >
        {/* Nickname */}
        <section>
          <label className="mb-2 block text-base font-semibold text-white/90">
            Ad (nickname){' '}
            <span className="text-white/50 font-normal">(mütləq)</span>
          </label>
          <div className="relative">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Məs: DJ Aylin"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base outline-none focus:border-orange-400/60 pr-10"
            />
            <User className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
        </section>

        {/* Round sayı və vaxtı */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-base font-semibold text-white/90">
              Round sayı
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base outline-none focus:border-orange-400/60"
            />
          </div>
          <div>
            <label className="mb-2 block text-base font-semibold text-white/90">
              Round vaxtı (saniyə)
            </label>
            <div className="relative">
              <input
                type="number"
                min={10}
                max={120}
                step={5}
                value={roundTime}
                onChange={(e) => setRoundTime(Number(e.target.value))}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base outline-none focus:border-orange-400/60 pr-10"
              />
              <Timer className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            </div>
          </div>
        </section>

        {/* Kateqoriya */}
        <section>
          <label className="mb-2 block text-base font-semibold text-white/90">
            Musiqi kateqoriyası
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base outline-none focus:border-orange-400/60 text-white"
          >
            <option value="azerbaijani" className="bg-gray-800">
              Azərbaycan mahnıları
            </option>
            <option value="turkish" className="bg-gray-800">
              Türk mahnıları
            </option>
            <option value="pop" className="bg-gray-800">
              Pop
            </option>
            <option value="rock" className="bg-gray-800">
              Rock
            </option>
            <option value="rap" className="bg-gray-800">
              Rap
            </option>
            <option value="mix" className="bg-gray-800">
              Qarışıq
            </option>
          </select>
        </section>

        <div className="pt-2 border-t border-white/10">
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
          <AccessibleButton
            type="submit"
            aria-disabled={!canCreate}
            disabled={!canCreate}
            className={[
              'w-full mt-5 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2',
              canCreate
                ? 'bg-orange-500 hover:bg-orange-400 text-white'
                : 'bg-white/10 text-white/50 cursor-not-allowed',
            ].join(' ')}
          >
            <Zap className="w-5 h-5" />
            Oyuna başla
          </AccessibleButton>
        </div>
      </form>
    </Modal>
  );
}

GuessTheSinger.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  game: PropTypes.shape({ id: PropTypes.string, title: PropTypes.string }),
};
