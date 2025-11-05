// client/src/components/GamesBarrier/GameGrid.jsx
import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import GameCard from './GameCard';
import { GAME_MODAL_REGISTRY, DEFAULT_GAME_MODAL } from './modalRegistry';

export default function GameGrid({ games, categories }) {
  const items = useMemo(() => games ?? [], [games]);
  const [selected, setSelected] = useState(null);

  const onOpen = useCallback((game) => setSelected(game), []);
  const onClose = useCallback(() => setSelected(null), []);

  const ModalComp = selected
    ? GAME_MODAL_REGISTRY[selected.id] || DEFAULT_GAME_MODAL
    : null;

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {items.map((g) => (
          <li key={g.id}>
            <GameCard
              title={g.title}
              image={g.image}
              Icon={g.icon}
              onClick={() => onOpen(g)}
            />
          </li>
        ))}
      </ul>

      {ModalComp && (
        <ModalComp
          open={!!selected}
          onClose={onClose}
          game={selected}
          categories={categories}
        />
      )}
    </>
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
  categories: PropTypes.arrayOf(PropTypes.string),
};
