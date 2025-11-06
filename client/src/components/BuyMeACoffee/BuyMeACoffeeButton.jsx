import React from 'react';
import { Link } from 'react-router-dom';
import KofeAl from '../../assets/img/kofe-al-logo.png';

const BuyMeACoffeeButton = () => {
  return (
    <Link
      to={'https://kofe.al/@akbarli'}
      target="_blank"
      class="inline-flex items-center gap-2 rounded-lg border border-yellow-700 bg-yellow-500 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95"
    >
      <img
        src={KofeAl}
        alt="kofe.al"
        class="h-10 w-auto select-none"
        draggable="false"
      />
    </Link>
  );
};

export default BuyMeACoffeeButton;
