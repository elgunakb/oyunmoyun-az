import React from 'react';
import PropTypes from 'prop-types';
import { Users } from 'lucide-react';
import PlayerRow from './PlayerRow';
import BuyMeACoffeeButton from '../../BuyMeACoffee/BuyMeACoffeeButton';
export default function PlayersPanel({ players, room, isLoading }) {
  // skeleton
  if (isLoading || !players || players.length === 0) {
    return (
      <section className="bg-[#0c161e] backdrop-blur-sm rounded-xl p-2 sm:p-6 shadow-md mb-4">
        <h2 className="text-base sm:text-xl font-semibold text-gray-400 mb-2 sm:mb-4 flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="w-24 h-4 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
        </h2>

        <ul className="space-y-1.5 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="w-full h-4 bg-gray-700 rounded animate-pulse mb-1"></div>
                <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="bg-[#0c161e] backdrop-blur-sm rounded-xl p-2 sm:p-6 shadow-md mb-4">
      <h2 className="text-base sm:text-xl font-semibold text-gray-400 mb-2 sm:mb-4 flex items-center gap-2">
        <Users />
        Oyunçular
        <span className="text-gray-300 font-normal">{`(${players.length})`}</span>
      </h2>

      <ul className="space-y-1.5 sm:space-y-3">
        {players.map((p) => (
          <PlayerRow
            key={p.playerId}
            player={p}
            isHost={p.playerId === room?.host_player_id}
          />
        ))}
      </ul>
    </section>
  );
}

PlayersPanel.propTypes = {
  players: PropTypes.array,
  room: PropTypes.object,
  isLoading: PropTypes.bool,
};
