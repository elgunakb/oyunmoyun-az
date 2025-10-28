import React, {
  useCallback,
  useId,
  useMemo,
  useReducer,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Zap, X, Check, Hash, EyeOff, Eye } from 'lucide-react';
import Modal from '../Modal/Modal';
import AccessibleButton from '../AccessibleButton/AccessibleButton';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  GAME_AD_SEHER_OPTİONS,
  LETTERS_A_Z,
  GAME_TIMES,
} from '../../utils/Options.js';
import socket from '../../lib/socket.js';

function setToggle(prev, value) {
  const next = new Set(prev);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}
function ensureAtLeastOne(set, fallbackValue) {
  return set.size > 0 ? set : new Set([fallbackValue]);
}

const initialState = {
  roomName: '',
  roomPassword: '',
  showPass: false,
  gameTime: 60,
  options: new Set(['ad']),
  letters: new Set(['A']),
  errors: { options: '', letters: '' },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROOM_NAME':
      return { ...state, roomName: action.value };
    case 'SET_ROOM_PASSWORD':
      return { ...state, roomPassword: action.value };
    case 'TOGGLE_SHOW_PASS':
      return { ...state, showPass: !state.showPass };
    case 'SET_GAME_TIME':
      return { ...state, gameTime: action.value };
    case 'TOGGLE_OPTION': {
      const options = setToggle(state.options, action.value);
      return {
        ...state,
        options,
        errors: {
          ...state.errors,
          options: options.size ? '' : 'Ən azı 1 opsiyon seçməlisiniz.',
        },
      };
    }
    case 'TOGGLE_LETTER': {
      const letters = setToggle(state.letters, action.value);
      return {
        ...state,
        letters,
        errors: {
          ...state.errors,
          letters: letters.size ? '' : 'Ən azı 1 hərf seçməlisiniz.',
        },
      };
    }
    case 'SELECT_ALL_LETTERS':
      return {
        ...state,
        letters: new Set(LETTERS_A_Z),
        errors: { ...state.errors, letters: '' },
      };
    case 'CLEAR_LETTERS':
      return {
        ...state,
        letters: new Set(),
        errors: { ...state.errors, letters: 'Ən azı 1 hərf seçməlisiniz.' },
      };
    case 'VALIDATE': {
      const errors = {
        options: state.options.size ? '' : 'Ən azı 1 opsiyon seçməlisiniz.',
        letters: state.letters.size ? '' : 'Ən azı 1 hərf seçməlisiniz.',
      };
      return { ...state, errors };
    }
    case 'RESET':
      return { ...initialState, gameTime: state.gameTime };
    default:
      return state;
  }
}

function Section({ title, aside, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        {title ? (
          <div className="text-base font-semibold text-white/90">{title}</div>
        ) : (
          <span />
        )}
        {aside}
      </div>
      {children}
    </section>
  );
}
function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-base font-semibold text-white/90"
    >
      {children}{' '}
      {hint && <span className="text-white/50 font-normal">{hint}</span>}
    </label>
  );
}
function PillOption({ active, children, onClick }) {
  return (
    <AccessibleButton
      onClick={onClick}
      aria-pressed={active}
      className={[
        'px-3 py-2 rounded-full border text-xs font-semibold transition',
        active
          ? 'bg-orange-500 text-white border-orange-500'
          : 'bg-white/5 border-white/10 hover:bg-white/10',
      ].join(' ')}
    >
      {children}
    </AccessibleButton>
  );
}
function LetterBtn({ active, children, onClick }) {
  return (
    <AccessibleButton
      onClick={onClick}
      aria-pressed={active}
      className={[
        'h-9 min-w-9 px-0 rounded-lg border text-sm sm:text-base font-bold tracking-wide',
        active
          ? 'bg-orange-500 text-white border-orange-500'
          : 'bg-white/5 border-white/10 hover:bg-white/10',
      ].join(' ')}
    >
      {children}
    </AccessibleButton>
  );
}

export default function GameDetailsModal({
  open,
  onClose,
  game,
  categories = [],
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitErr, setSubmitErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const titleId = useId();
  const navigate = useNavigate();
  const { user } = useAuth(); // { name, playerId, image, provider }

  const selectedCategories = useMemo(
    () => (categories.length ? categories : [game?.title].filter(Boolean)),
    [categories, game?.title]
  );

  const canCreate =
    state.options.size >= 1 && state.letters.size >= 1 && state?.roomName;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitErr('');
      dispatch({ type: 'VALIDATE' });
      if (!canCreate) return;

      if (!user?.playerId) {
        setSubmitErr('Giriş edilməyib. Zəhmət olmasa əvvəlcə daxil olun.');
        return;
      }

      setSubmitting(true);
      try {
        const payload = {
          roomName: state.roomName.trim() || '',
          roomPassword: state.roomPassword.trim() || '',
          options: Array.from(ensureAtLeastOne(state.options, 'ad')),
          letters: Array.from(ensureAtLeastOne(state.letters, 'A')),
          categories: selectedCategories,
          gameTime: Number(state.gameTime),
          host: {
            playerId: user.playerId,
            name: user.name,
            avatar: user.image || '',
          },
        };

        // Supabase Edge Function: create-room
        const { data, error } = await supabase.functions.invoke('create-room', {
          body: payload,
        });

        if (error) {
          setSubmitErr(error.message || 'Otaq yaradılmadı.');
          return;
        }

        // Uğurlu — waiting-room/:code
        if (data?.redirectUrl) {
          navigate(data.redirectUrl);
        } else if (data?.room?.code) {
          navigate(`/waiting-room/${data.room.code}`);
        }
        onClose?.(); // modal bağlansın
      } catch (err) {
        setSubmitErr(err?.message || 'Gözlənilməyən xəta baş verdi.');
      } finally {
        setSubmitting(false);
      }
    },
    [canCreate, navigate, onClose, selectedCategories, state, user]
  );

  return (
    <Modal open={open} onClose={onClose} titleId={titleId}>
      {/* Header */}
      <header className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          {/* <div className="w-9 h-9 rounded-xl bg-orange-500/90 flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div> */}
          <div>
            <h3 id={titleId} className="text-lg font-extrabold tracking-tight">
              Oyun Otağı Yarat
            </h3>
            <p className="text-base text-white/70 -mt-0.5">
              Otaq yaratdıqdan sonra URL-i dostunla bölüşə bilərsən
            </p>
            <div className="rounded-xl mt-2 flex flex-wrap gap-2">
              {selectedCategories.length ? (
                selectedCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/90 text-white text-xs font-semibold"
                  >
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-white/50">
                  Kateqoriya seçilməyib
                </span>
              )}
            </div>
          </div>
        </div>

        <AccessibleButton
          onClick={() => onClose?.()}
          aria-label="Modaldan çıx"
          className="rounded-xl p-2 bg-orange-500 hover:bg-orange-400 text-white"
        >
          <X className="w-5 h-5" />
        </AccessibleButton>
      </header>

      {/* Form body */}
      <form
        onSubmit={handleSubmit}
        className="p-4 sm:p-5 space-y-5 overflow-y-auto"
      >
        {/* Otaq adı */}
        <Section>
          <FieldLabel htmlFor="roomName" hint="(mütləq)">
            Otaq adı
          </FieldLabel>
          <div className="relative">
            <input
              id="roomName"
              autoComplete="room-name"
              type="text"
              value={state.roomName}
              onChange={(e) =>
                dispatch({ type: 'SET_ROOM_NAME', value: e.target.value })
              }
              placeholder="Məs: Dostlarla axşam oyunu"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base outline-none focus:border-orange-400/60 placeholder:text-white/40"
            />
            <Hash className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          </div>
        </Section>

        {/* Otaq şifrəsi */}
        <Section>
          <FieldLabel htmlFor="roomPassword" hint="(opsional)">
            Otaq şifrəsi
          </FieldLabel>
          <div className="relative">
            <input
              id="roomPassword"
              autoComplete="new-password"
              type={state.showPass ? 'text' : 'password'}
              value={state.roomPassword}
              onChange={(e) =>
                dispatch({ type: 'SET_ROOM_PASSWORD', value: e.target.value })
              }
              placeholder="Şifrə təyin etməsəniz otaq hər kəsə açıq olacaq"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-11 text-base outline-none focus:border-orange-400/60 placeholder:text-white/40"
            />
            <AccessibleButton
              type="button"
              aria-label={state.showPass ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
              onClick={() => dispatch({ type: 'TOGGLE_SHOW_PASS' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10"
              title={state.showPass ? 'Gizlət' : 'Göstər'}
            >
              {state.showPass ? (
                <EyeOff className="w-4 h-4 text-white/70" />
              ) : (
                <Eye className="w-4 h-4 text-white/70" />
              )}
            </AccessibleButton>
          </div>
          <p className="text-xs text-white/50">
            Şifrə qoyaraq otağınızı qoruya bilərsiniz.
          </p>
        </Section>

        {/* Oyun vaxtı */}
        <Section title="Oyun vaxtı">
          <select
            id="gameTime"
            value={state.gameTime}
            onChange={(e) =>
              dispatch({ type: 'SET_GAME_TIME', value: Number(e.target.value) })
            }
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-base outline-none focus:border-orange-400/60 text-white"
          >
            {GAME_TIMES.map((t) => (
              <option key={t} value={t} className="bg-gray-800 text-white">
                {t} saniyə
              </option>
            ))}
          </select>
        </Section>

        {/* Opsiyonlar */}
        <Section>
          <FieldLabel htmlFor="roomName" hint="(minimum 1 seçim)">
            Opsiyonlar
          </FieldLabel>
          <div className="flex flex-wrap gap-2">
            {GAME_AD_SEHER_OPTİONS.map((o) => (
              <PillOption
                key={o.key}
                active={state.options.has(o.key)}
                onClick={() =>
                  dispatch({ type: 'TOGGLE_OPTION', value: o.key })
                }
              >
                {o.label}
              </PillOption>
            ))}
          </div>
          <div aria-live="polite" className="min-h-4">
            {state.errors.options && (
              <p className="text-xs text-red-400">{state.errors.options}</p>
            )}
          </div>
        </Section>

        {/* Hərf seçimi */}
        <Section
          title="Hərf seçimi"
          aside={
            <div className="flex items-center gap-2">
              <AccessibleButton
                type="button"
                onClick={() => dispatch({ type: 'SELECT_ALL_LETTERS' })}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 border border-white/10"
              >
                Hamısını seç
              </AccessibleButton>
              <AccessibleButton
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_LETTERS' })}
                className="px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/15 border border-white/10"
              >
                Təmizlə
              </AccessibleButton>
            </div>
          }
        >
          <div className="grid grid-cols-13 max-md:grid-cols-9 [@media(max-width:440px)]:grid-cols-8 gap-2">
            {LETTERS_A_Z.map((ch) => (
              <LetterBtn
                key={ch}
                active={state.letters.has(ch)}
                onClick={() => dispatch({ type: 'TOGGLE_LETTER', value: ch })}
              >
                {ch}
              </LetterBtn>
            ))}
          </div>
          <div aria-live="polite" className="min-h-4">
            {state.errors.letters && (
              <p className="text-xs text-red-400">{state.errors.letters}</p>
            )}
          </div>
        </Section>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10">
          {submitErr && (
            <p className="mb-2 text-xs text-red-400">{submitErr}</p>
          )}
          <AccessibleButton
            type="submit"
            aria-disabled={!canCreate || submitting}
            disabled={!canCreate || submitting}
            title={
              !canCreate ? 'Ən azı 1 opsiyon və 1 hərf seçin' : 'Otaq yarat'
            }
            className={[
              'w-full mt-5 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2',
              canCreate && !submitting
                ? 'bg-orange-500 hover:bg-orange-400 text-white'
                : 'bg-white/10 text-white/50 cursor-not-allowed',
            ].join(' ')}
          >
            <Zap className="w-5 h-5" />
            {submitting ? 'Yaradılır...' : 'Otaq Yarat'}
          </AccessibleButton>
        </div>
      </form>
    </Modal>
  );
}

GameDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  game: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  }),
  categories: PropTypes.arrayOf(PropTypes.string),
};
