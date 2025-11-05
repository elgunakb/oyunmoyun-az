import AdSeherModal from './AdSeherModal';
import GuessTheSinger from './GuessTheSinger';

export const GAME_MODAL_REGISTRY = {
  'ad-seher': AdSeherModal,
  'x-o-x': GuessTheSinger, // Oxuyanı tap
};

export const DEFAULT_GAME_MODAL = AdSeherModal;
