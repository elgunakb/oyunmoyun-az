import React from 'react';
import PropTypes from 'prop-types';
import { Crown } from 'lucide-react';

export default function PlayerRow({ player, isHost }) {
  const initial = (player.name?.[0] || 'U').toUpperCase();

  return (
    <li className="flex items-center justify-between p-2 sm:p-4 rounded-xl transition-all duration-300 bg-white/90 dark:bg-gray-800/50 border-2 border-gray-200/70 dark:border-gray-600/50 hover:bg-gray-50/90 dark:hover:bg-gray-700/50">
      <div className="mr-2 sm:mr-4">
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.name}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs sm:text-base shadow-sm">
            {initial}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
        <span className="font-medium text-xs sm:text-lg text-gray-700 dark:text-gray-200 truncate">
          {player.name}
        </span>
        {isHost && (
          <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-300/40 text-yellow-900 dark:text-yellow-100 inline-flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            HOST
          </span>
        )}
      </div>

      <div className="text-center font-bold text-[10px] sm:text-lg">
        <div className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-yellow-50 text-gray-900 dark:text-white dark:bg-yellow-500/20">
          <span className="text-xs sm:text-sm">31</span>
        </div>
      </div>
    </li>
  );
}

PlayerRow.propTypes = {
  player: PropTypes.object.isRequired,
  isHost: PropTypes.bool,
};
