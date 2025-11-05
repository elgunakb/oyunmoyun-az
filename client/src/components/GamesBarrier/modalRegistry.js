import AdSeherModal from './AdSeherModal';
import MusicFindModal from './MusicFindModal';

export const GAME_MODAL_REGISTRY = {
  'ad-seher': AdSeherModal,
  'x-o-x': MusicFindModal, // Oxuyanı tap
};

export const DEFAULT_GAME_MODAL = AdSeherModal;
