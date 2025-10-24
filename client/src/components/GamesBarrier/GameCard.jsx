import React from 'react';
import PropTypes from 'prop-types';
import AccessibleButton from '../AccessibleButton/AccessibleButton';

const GameCard = React.memo(function GameCard({ title, image, Icon, onClick }) {
  const IconCmp = Icon;

  return (
    <AccessibleButton
      onClick={onClick}
      className="group/card relative w-full cursor-pointer select-none rounded-2xl border-2 border-gray-600/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 transition-transform duration-300 hover:scale-105 hover:border-gray-500 hover:shadow-2xl hover:shadow-gray-500/10 text-left"
      aria-label={`${title} oyununu aç`}
    >
      <div className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-gray-500 bg-transparent flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110">
        {IconCmp ? <IconCmp className="w-4 h-4" aria-hidden="true" /> : null}
      </div>

      <div className="p-6 flex flex-col items-center justify-between w-full aspect-[3/2]">
        <div className="flex-1 flex items-center justify-center w-full mb-4">
          <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center relative z-10 transition-transform group-hover/card:scale-110 drop-shadow-md">
            <img
              src={image}
              loading="lazy"
              alt={`${title} oyunu posteri`}
              className="w-full h-full object-contain transition-all duration-200"
            />
          </div>
        </div>
        <div className="flex items-center justify-center w-full min-h-[2.2rem] px-2">
          <p className="font-semibold text-center text-base leading-tight break-words tracking-wide text-white">
            {title}
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-600/25 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
    </AccessibleButton>
  );
});

GameCard.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  Icon: PropTypes.elementType,
  onClick: PropTypes.func, // MODAL açılışı üçün
};

export default GameCard;
