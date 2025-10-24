import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';

export default function ProfileDropDownMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // klik kənara olanda bağlanır
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // adın ilk hərfini götürmək üçün
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-3.5 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-gray-500/50"
      >
        {user?.image ? (
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-orange-500/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-orange-500/20">
            {initial}
          </div>
        )}
        <ChevronDown
          size={16}
          className={`transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <ul className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-lg">
          <li
            onClick={() => {
              setOpen(false);
              // məsələn, "Profilə bax" səhifəsinə yönləndirmək istəsən burda router ilə aça bilərsən
            }}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition"
          >
            <User size={16} className="opacity-90" />
            <span>View Profile</span>
          </li>

          <li
            onClick={() => {
              setOpen(false);
              logout(); // 🔹 logout funksiyasını çağırırıq
            }}
            className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition"
          >
            <LogOut size={16} className="opacity-90" />
            <span>Logout</span>
          </li>
        </ul>
      )}
    </div>
  );
}
