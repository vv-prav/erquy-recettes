// icons.js — petites icônes SVG inline (traits, style cohérent, pas de dépendance)
const stroke = (paths, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const icons = {
  home: stroke('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-9"/><path d="M9.5 20v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V20"/>'),
  plusCircle: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>'),
  list: stroke('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  plus: stroke('<path d="M12 5v14M5 12h14"/>', 16),
  minus: stroke('<path d="M5 12h14"/>', 16),
  camera: stroke('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.5" r="3.3"/>'),
  x: stroke('<path d="M6 6l12 12M18 6 6 18"/>', 16),
  trash: stroke('<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/>', 17),
  search: stroke('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/>', 18),
  sliders: stroke('<path d="M5 5v3M5 11v8M12 5v10M12 18v1M19 5v6M19 14v5M3 8h4M10 11h4M17 11h4"/>', 13),
  arrowLeft: stroke('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  chefHat: stroke('<path d="M6 13a4 4 0 0 1-1-7.8A4.5 4.5 0 0 1 12 3a4.5 4.5 0 0 1 7 2.2A4 4 0 0 1 18 13H6Z"/><path d="M7 13v6h10v-6"/>'),
  clock: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>', 15),
  users: stroke('<circle cx="9" cy="8" r="3"/><path d="M2.5 19a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M18.5 19a6 6 0 0 0-3.3-5.4"/>', 15),
  check: stroke('<path d="M4 12l5 5L20 6"/>', 16),
  wand: stroke('<path d="M4 20 15 9M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM4 4l.7 1.3L6 6l-1.3.7L4 8l-.7-1.3L2 6l1.3-.7z"/>', 15),
};
