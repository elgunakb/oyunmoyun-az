// Header, Nav options

export const LANGUAGE_OPTIONS = [
  {
    code: 'az',
    label: 'Azərbaycan',
    flag: '🇦🇿',
    lang: 'AZ',
  },
  {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
    lang: 'ENG',
  },
];

export const NAV_LINKS = [
  {
    href: '#',
    label: 'Ana səhifə',
  },
  {
    href: '#',
    label: 'İkinci səhifə',
  },
  {
    href: '#',
    label: 'Üçüncü səhifə',
  },
];

// Game AD SEHER options

export const GAME_AD_SEHER_OPTİONS = Object.freeze([
  { key: 'ad', label: 'Ad' },
  { key: 'soyad', label: 'Soyad' },
  { key: 'seher', label: 'Şəhər' },
  { key: 'esya', label: 'Əşya' },
  { key: 'avto', label: 'Avtomobil markası' },
  { key: 'film', label: 'Film/serial' },
  { key: 'bitki', label: 'Bitki' },
  { key: '3herf', label: '3 hərfli söz' },
  { key: 'idman', label: 'İdman növü' },
]);

export const LETTERS_A_Z = Object.freeze(
  Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
);

export const GAME_TIMES = Object.freeze([60, 90, 120, 150, 180]);
