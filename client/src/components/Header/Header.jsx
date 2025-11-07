import React from 'react';
import { Link } from 'react-router-dom';

import Navbar from '../Navbar/Navbar';
import Logo from '../../assets/img/quisor_logo.svg';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import ProfileDropDownMenu from '../ProfileDropDownMenu/ProfileDropDownMenu';

export default function Header() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  return (
    <>
      <header className="relative z-60 overflow-visible">
        <div className="pointer-events-none absolute inset-0 bg-slate-900/40 backdrop-blur-xl border-b border-white/10" />

        <div className="relative z-10 grid items-center h-[100px] px-4 sm:px-6 grid-cols-2 md:grid-cols-[1fr_auto_1fr]">
          {/* Logo */}
          <Link
            to="/"
            className="justify-self-start md:justify-self-center md:col-start-2 block"
          >
            <div className="h-[76px] sm:h-[84px] w-auto relative transform hover:-rotate-1 hover:scale-105 transition-all duration-300">
              <img
                src={Logo}
                alt="logo"
                className="h-full w-auto object-contain block"
              />
            </div>
          </Link>

          <div className="justify-self-end md:col-start-3 relative z-50 overflow-visible">
            <div className="flex items-center gap-3">
              {/* Nickname / user info */}
              {isAuthenticated ? (
                <ProfileDropDownMenu user={user} logout={logout} />
              ) : (
                ''
              )}

              {/* Language switcher */}
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>
      {/* if login */}
      {isAuthenticated && <Navbar />}
    </>
  );
}
