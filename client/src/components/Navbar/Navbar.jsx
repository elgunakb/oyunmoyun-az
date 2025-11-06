import React from 'react';

import { NAV_LINKS } from '../../utils/Options';

export default function Navbar() {
  return (
    <nav className="relative bg-slate-900/40 backdrop-blur-xl border-b border-white/5">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center py-1">
          <div className="flex items-center gap-1 text-[#EEEEEE]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-all duration-200 py-0.5 px-1.5 text-sm font-mono rounded hover:bg-white/5 hover:text-white/80"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
