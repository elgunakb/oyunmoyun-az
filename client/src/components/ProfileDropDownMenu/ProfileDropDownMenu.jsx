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
      {/* Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 transition"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-5 h-5 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold">
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
