import React from 'react';
import PropTypes from 'prop-types';
import { Users } from 'lucide-react';
import PlayerRow from './PlayerRow';

export default function PlayersPanel({ players, room }) {
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
  players: PropTypes.array.isRequired,
  room: PropTypes.object,
};
