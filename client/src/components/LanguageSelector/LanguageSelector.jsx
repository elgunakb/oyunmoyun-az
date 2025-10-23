import React, { useEffect, useRef, useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../../utils/Options';

export default function LanguageSelector({ onChange }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });
  const ref = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('lang', current);
    localStorage.setItem('app_lang', current);
    window.dispatchEvent(
      new CustomEvent('langchange', {
        detail: current,
      })
    );
    if (typeof onChange === 'function') onChange(current);
  }, [current, onChange]);

  // click outside to close
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const active =
    LANGUAGE_OPTIONS.find((l) => l.code === current) || LANGUAGE_OPTIONS[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white hover:bg-white/10 transition"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe size={18} className="opacity-90" />
        <span className="hidden sm:inline">{active.lang}</span>
        <span className="sm:hidden">{active.flag}</span>
        <ChevronDown
          size={16}
          className={`transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-lg"
          role="listbox"
          tabIndex={-1}
        >
          {LANGUAGE_OPTIONS.map((lang) => {
            const isActive = lang.code === current;
            return (
              <li
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setCurrent(lang.code);
                  setOpen(false);
                }}
                className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 ${
                  isActive ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isActive && <Check size={16} className="opacity-90" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
