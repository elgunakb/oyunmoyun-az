import AdSeherModal from './AdSeherModal';
import GuessTheSingerModal from './GuessTheSingerModal';

export const GAME_MODAL_REGISTRY = {
  'ad-seher': AdSeherModal,
  guessTheSinger: GuessTheSingerModal,
};

export const DEFAULT_GAME_MODAL = AdSeherModal;
