// bottomnav.js — barre d'onglets fixée en bas d'écran
import { icons } from '../icons.js';

const TABS = [
  { id: 'accueil', label: 'Accueil', icon: icons.home },
  { id: 'ajouter', label: 'Ajouter', icon: icons.plusCircle },
  { id: 'recettes', label: 'Recettes', icon: icons.list },
];

export function renderBottomNav(current) {
  return `
    <nav class="bottom-nav safe-bottom">
      <div class="mx-auto max-w-md flex items-stretch justify-around px-2">
        ${TABS.map(
          (t) => `
          <button class="nav-btn ${t.id === current ? 'nav-btn-active' : ''}" data-tab="${t.id}">
            ${t.id === current ? '<span class="nav-indicator"></span>' : ''}
            <span class="nav-icon">${t.icon}</span>
            <span class="nav-label">${t.label}</span>
          </button>`
        ).join('')}
      </div>
    </nav>`;
}
