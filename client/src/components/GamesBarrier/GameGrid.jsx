import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import GameCard from './GameCard';

export default function GameGrid({ games }) {
  const items = useMemo(() => games ?? [], [games]);

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
      {items.map((g) => (
        <li key={g.id}>
          <GameCard title={g.title} image={g.image} Icon={g.icon} />
        </li>
      ))}
    </ul>
  );
}

GameGrid.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ),
};
