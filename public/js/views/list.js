// list.js — liste complète avec recherche et filtres
import { CATEGORIES } from '../presets.js';
import { icons } from '../icons.js';
import { cardRow } from '../components/card.js';
import { escapeAttr } from '../utils.js';

export function renderList(recipes) {
  return `
    <div class="pb-28 px-5 pt-8">
      <h1 class="font-display font-semibold text-[26px] text-ink">Toutes les recettes</h1>
      <p class="text-ink-soft text-[13px] mt-1">${recipes.length} recette${recipes.length > 1 ? 's' : ''} de la bande</p>

      <div class="mt-5 relative">
        <span class="search-icon">${icons.search}</span>
        <input id="search-input" placeholder="Rechercher une recette..." class="field pl-10" />
      </div>

      <div class="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-5 px-5 pb-1" id="cat-filters">
        <button type="button" class="chip flex-shrink-0 chip-active filter-chip" data-cat="tous">${icons.sliders} Tous</button>
        ${CATEGORIES.map(
          (c) => `<button type="button" class="chip flex-shrink-0 chip-inactive filter-chip" data-cat="${c.id}" data-color="${c.color}" data-text="${c.text}">${c.label}</button>`
        ).join('')}
      </div>

      <div class="mt-5 space-y-3" id="results">
        ${recipes.length ? recipes.slice().sort((a, b) => b.createdAt - a.createdAt).map(cardRow).join('') : emptyState()}
      </div>
    </div>`;
}

function emptyState() {
  return `<div class="empty-box mt-4">
    <p class="font-display font-semibold text-ink text-[15px]">Aucune recette trouvée</p>
    <p class="text-ink-soft text-[13px] mt-1">Essaie un autre mot-clé ou une autre catégorie.</p>
  </div>`;
}

export function mountList(container, recipes) {
  const $ = (sel) => container.querySelector(sel);
  const results = $('#results');
  const searchInput = $('#search-input');
  let activeCat = 'tous';

  function apply() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = recipes
      .filter((r) => (activeCat === 'tous' ? true : r.category === activeCat))
      .filter((r) => r.title.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt - a.createdAt);
    results.innerHTML = filtered.length ? filtered.map(cardRow).join('') : emptyState();
  }

  searchInput.addEventListener('input', apply);

  container.querySelectorAll('.filter-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip').forEach((b) => {
        b.classList.remove('chip-active');
        b.classList.add('chip-inactive');
        b.removeAttribute('style');
      });
      btn.classList.remove('chip-inactive');
      if (btn.dataset.cat === 'tous') {
        btn.classList.add('chip-active');
      } else {
        btn.style.background = btn.dataset.color;
        btn.style.color = btn.dataset.text;
        btn.style.borderColor = btn.dataset.color;
      }
      activeCat = btn.dataset.cat;
      apply();
    });
  });
}
