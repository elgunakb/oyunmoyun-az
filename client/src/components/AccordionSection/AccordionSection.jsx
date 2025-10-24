import React, { useId } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import AccessibleButton from '../AccessibleButton/AccessibleButton';
import AccordionPanel from '../AccordionPanel/AccordionPanel';
import GameGrid from '../GamesBarrier/GameGrid';

export default function AccordionSection({ section, open, onToggle }) {
  const headerId = useId();
  const panelId = `${headerId}-panel`;

  return (
    <section
      aria-labelledby={headerId}
      className="mb-6 rounded-2xl border border-gray-500/20 bg-linear-to-r from-gray-800/50 to-gray-900/60 overflow-hidden"
    >
      <header className="border-b border-gray-600/30">
        <div className="flex items-center justify-between p-4 bg-linear-to-r from-gray-700/30 to-gray-800/30">
          <div className="flex items-center gap-3">
            <AccessibleButton
              aria-controls={panelId}
              aria-expanded={open}
              onClick={onToggle}
              className="inline-flex items-center gap-2 text-white/90"
            >
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  open ? '-rotate-90' : ''
                }`}
                aria-hidden="true"
              />
              <h2
                id={headerId}
                className="font-oxanium text-lg font-bold text-white"
              >
                {section.title}
              </h2>
            </AccessibleButton>
          </div>

          <div className="flex items-center gap-3">
            <AccessibleButton className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-all">
              {section.ctaText}
            </AccessibleButton>
          </div>
        </div>
      </header>

      <AccordionPanel id={panelId} open={open}>
        <GameGrid games={section.games} />
      </AccordionPanel>
    </section>
  );
}

AccordionSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    ctaText: PropTypes.string,
    games: PropTypes.array,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
