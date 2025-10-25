import React from 'react';
import PropTypes from 'prop-types';

export default function WaitingHeader({ code, room }) {
  const badge = room?.is_password_protected ? 'Şifrəli' : 'Şifrəsiz';
  return (
    <header className="bg-[#0c161e] backdrop-blur-sm rounded-xl shadow-md p-6 text-center mb-4">
      <h1 className="text-2xl font-bold text-orange-600 mb-3">
        Otaq: {code}
        <span className="inline-flex items-center px-2 py-1 ml-3 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          {badge}
        </span>
      </h1>
      <p className="text-gray-300 text-sm">
        URL-i dostlarınla paylaş — eyni linklə qoşulsunlar. Bütün oyunçular
        daxil olandan sonra oyunu başlada bilərsən.
      </p>
    </header>
  );
}

WaitingHeader.propTypes = {
  code: PropTypes.string.isRequired,
  room: PropTypes.object,
};
