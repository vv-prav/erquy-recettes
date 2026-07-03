// author.js — "recettes de {auteur}", accessible en tapant un nom d'auteur n'importe où
import { icons } from '../icons.js';
import { escapeHtml, averageRating } from '../utils.js';
import { cardRow } from '../components/card.js';

export function renderAuthor(authorName, recipes) {
  const mine = recipes
    .filter((r) => r.author === authorName)
    .sort((a, b) => b.createdAt - a.createdAt);

  const totalReviews = mine.reduce((acc, r) => acc + (r.reviews?.length || 0), 0);
  const ratings = mine.map((r) => averageRating(r.reviews)).filter((n) => n !== null);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  return `
    <div class="detail-overlay" id="author-overlay">
      <div class="author-header">
        <button id="author-back" class="detail-round-btn author-back-btn">${icons.arrowLeft}</button>
        <span class="author-avatar-lg">${icons.user}</span>
        <h1 class="font-display font-semibold text-[24px] text-white mt-2">${escapeHtml(authorName)}</h1>
        <p class="text-white-85 text-[13px] mt-1">
          ${mine.length} recette${mine.length > 1 ? 's' : ''}
          ${avg !== null ? ` · ${icons.star} ${avg.toFixed(1)} de moyenne` : ''}
          ${totalReviews ? ` · ${totalReviews} avis reçu${totalReviews > 1 ? 's' : ''}` : ''}
        </p>
      </div>

      <div class="px-5 pt-5 pb-28 space-y-3">
        ${
          mine.length
            ? mine.map(cardRow).join('')
            : `<div class="empty-box"><p class="font-display font-semibold text-ink text-[15px]">Aucune recette</p></div>`
        }
      </div>
    </div>`;
}

export function mountAuthor(container, { onBack, onOpenRecipe, recipes }) {
  container.querySelector('#author-back').addEventListener('click', onBack);
  container.addEventListener('click', (e) => {
    const el = e.target.closest('[data-open]');
    if (!el) return;
    const r = recipes.find((x) => x.id === el.dataset.open);
    if (r) onOpenRecipe(r);
  });
}
