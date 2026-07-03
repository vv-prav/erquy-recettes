// card.js — construit le HTML d'une carte recette (grille ou format large)
import { getCategory } from '../presets.js';
import { icons } from '../icons.js';
import { escapeHtml, averageRating } from '../utils.js';

export function cardWide(recipe) {
  const cat = getCategory(recipe.category);
  const media = recipe.image
    ? `<img src="${recipe.image}" alt="" class="h-full w-full object-cover" />`
    : `<div class="h-full w-full flex items-center justify-center" style="background:${cat.color}">${icons.chefHat}</div>`;
  const avg = averageRating(recipe.reviews);

  return `
    <button class="card-wide" data-open="${recipe.id}">
      <div class="card-media-wide">
        ${media}
        <span class="cat-badge" style="background:${cat.color};color:${cat.text}">${escapeHtml(cat.label)}</span>
        ${avg !== null ? `<span class="mini-rating mini-rating-media">${icons.star} ${avg.toFixed(1)}</span>` : ''}
      </div>
      <div class="p-2.5">
        <p class="font-display font-semibold text-[13.5px] leading-tight text-ink line-clamp-2">${escapeHtml(recipe.title)}</p>
        <div class="flex items-center gap-1 mt-1.5 text-ink-faint text-[11px]">
          ${icons.clock}<span>${recipe.prepTime ?? '?'} min</span>
        </div>
      </div>
    </button>`;
}

export function cardRow(recipe) {
  const cat = getCategory(recipe.category);
  const media = recipe.image
    ? `<img src="${recipe.image}" alt="" class="h-full w-full object-cover" />`
    : `<div class="h-full w-full flex items-center justify-center" style="background:${cat.color}">${icons.chefHat}</div>`;
  const avg = averageRating(recipe.reviews);

  return `
    <div class="card-row-wrap">
      <button class="card-row" data-open="${recipe.id}">
        <div class="relative w-24 h-24 flex-shrink-0 overflow-hidden">${media}</div>
        <div class="flex-1 p-3 min-w-0 text-left">
          <div class="flex items-center gap-2">
            <span class="cat-badge static-badge" style="background:${cat.color};color:${cat.text}">${escapeHtml(cat.label)}</span>
            ${avg !== null ? `<span class="mini-rating">${icons.star} ${avg.toFixed(1)}</span>` : ''}
          </div>
          <p class="font-display font-semibold text-[15px] mt-1.5 text-ink leading-tight truncate">${escapeHtml(recipe.title)}</p>
          <div class="flex items-center gap-3 mt-1.5 text-ink-faint text-[11.5px]">
            <span class="flex items-center gap-1">${icons.clock} ${recipe.prepTime ?? '?'} min</span>
          </div>
        </div>
      </button>
      <button class="author-tag" data-author="${escapeHtml(recipe.author || 'Anonyme')}">${icons.user} Par ${escapeHtml(recipe.author || 'Anonyme')}</button>
    </div>`;
}
