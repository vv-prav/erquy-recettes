// detail.js — fiche recette détaillée (ingrédients cochables, portions ajustables)
import { getCategory, getDifficultyLabel, getTagLabel } from '../presets.js';
import { icons } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { api } from '../api.js';

export function renderDetail(recipe) {
  const cat = getCategory(recipe.category);
  const media = recipe.image
    ? `<div class="h-64 w-full relative">
        <img src="${recipe.image}" alt="" class="h-full w-full object-cover" />
        <div class="detail-gradient"></div>
      </div>`
    : `<div class="h-44 w-full flex items-center justify-center" style="background:${cat.color}">${icons.chefHat}</div>`;

  return `
    <div class="detail-overlay" id="detail-overlay">
      <div class="relative">
        ${media}
        <button id="detail-back" class="detail-round-btn" style="left:16px">${icons.arrowLeft}</button>
        <button id="detail-delete" class="detail-round-btn" style="right:16px" aria-label="Supprimer la recette">
          <span style="color:#B24545">${icons.trash}</span>
        </button>
      </div>

      <div class="px-5 -mt-6 relative">
        <div class="detail-sheet">
          <span class="cat-badge static-badge" style="background:${cat.color};color:${cat.text}">${escapeHtml(cat.label)}</span>
          <h1 class="font-display font-semibold text-[24px] text-ink mt-2.5 leading-tight">${escapeHtml(recipe.title)}</h1>
          <p class="text-ink-soft text-[13px] mt-1">Par ${escapeHtml(recipe.author)}</p>

          <div class="flex gap-4 mt-4 border-y border-line py-3.5">
            <div class="meta-item">${icons.clock} ${recipe.prepTime} min</div>
            <div class="meta-item">${icons.chefHat} ${getDifficultyLabel(recipe.difficulty)}</div>
            <div class="meta-item">${icons.users} <span id="servings-label">${recipe.servings}</span> pers.</div>
          </div>

          ${
            recipe.tags?.length
              ? `<div class="flex gap-2 flex-wrap mt-3.5">${recipe.tags.map((t) => `<span class="chip chip-inactive">${getTagLabel(t)}</span>`).join('')}</div>`
              : ''
          }

          <div class="mt-6 flex items-center justify-between">
            <h2 class="font-display font-semibold text-[17px] text-ink">Ingrédients</h2>
            <div class="flex items-center bg-primary-pale rounded-xl overflow-hidden">
              <button id="servings-minus" class="p-2 text-primary">${icons.minus}</button>
              <span class="px-2 text-[13px] font-semibold text-primary min-w-68 text-center" id="servings-display">${recipe.servings} pers.</span>
              <button id="servings-plus" class="p-2 text-primary">${icons.plus}</button>
            </div>
          </div>

          <ul class="mt-3 space-y-1" id="ingredients-checklist">
            ${
              recipe.ingredients?.length
                ? recipe.ingredients
                    .map(
                      (ing, idx) => `
                    <li>
                      <button type="button" class="ing-item" data-idx="${idx}" data-qty="${escapeHtml(ing.qty)}" data-unit="${escapeHtml(ing.unit)}" data-name="${escapeHtml(ing.name)}">
                        <span class="check-box"></span>
                        <span class="ing-text">${ing.qty ? `<span class="font-semibold ing-qty-label">${escapeHtml(ing.qty)} ${escapeHtml(ing.unit)}</span> ` : ''}${escapeHtml(ing.name)}</span>
                      </button>
                    </li>`
                    )
                    .join('')
                : `<p class="text-ink-faint text-[13.5px] italic">Aucun ingrédient renseigné.</p>`
            }
          </ul>

          <h2 class="font-display font-semibold text-[17px] text-ink mt-7">Étapes</h2>
          <ol class="mt-3 space-y-4">
            ${
              recipe.steps?.length
                ? recipe.steps
                    .map(
                      (s, idx) => `
                    <li class="flex gap-3">
                      <span class="step-badge">${idx + 1}</span>
                      <p class="text-[14.5px] text-ink leading-relaxed pt-0.5">${escapeHtml(s)}</p>
                    </li>`
                    )
                    .join('')
                : `<p class="text-ink-faint text-[13.5px] italic">Aucune étape renseignée.</p>`
            }
          </ol>
        </div>
      </div>
    </div>`;
}

export function mountDetail(container, recipe, { onBack, onDeleted }) {
  const $ = (sel) => container.querySelector(sel);
  let servings = recipe.servings || 1;
  const baseServings = recipe.servings || 1;

  $('#detail-back').addEventListener('click', onBack);

  $('#detail-delete').addEventListener('click', async () => {
    if (!confirm('Supprimer cette recette pour tout le monde ?')) return;
    const res = await api.deleteRecipe(recipe.id);
    if (res?.ok) onDeleted();
  });

  function refreshQuantities() {
    const ratio = servings / baseServings;
    $('#servings-display').textContent = `${servings} pers.`;
    $('#servings-label').textContent = servings;
    container.querySelectorAll('.ing-item').forEach((item) => {
      const qty = item.dataset.qty;
      const unit = item.dataset.unit;
      if (!qty) return;
      const n = parseFloat(qty.replace(',', '.'));
      if (Number.isNaN(n)) return;
      const scaled = n * ratio;
      const display = Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
      item.querySelector('.ing-qty-label').textContent = `${display} ${unit}`;
    });
  }

  $('#servings-minus').addEventListener('click', () => {
    servings = Math.max(1, servings - 1);
    refreshQuantities();
  });
  $('#servings-plus').addEventListener('click', () => {
    servings += 1;
    refreshQuantities();
  });

  container.querySelectorAll('.ing-item').forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('ing-checked');
    });
  });
}
