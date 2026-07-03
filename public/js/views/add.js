// add.js — écran "Ajouter une recette", pensé pour aller vite sur mobile
import { CATEGORIES, DIFFICULTIES, UNITS, COMMON_INGREDIENTS, TAGS, QUICK_TEMPLATES } from '../presets.js';
import { icons } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { api } from '../api.js';

function ingredientRow(name = '', qty = '', unit = 'g') {
  return `
    <div class="ing-row flex gap-2 items-center">
      <input list="ingredient-suggestions" value="${escapeHtml(name)}" placeholder="Ingrédient" class="field flex-1 min-w-0 ing-name" />
      <input value="${escapeHtml(qty)}" placeholder="Qté" inputmode="decimal" class="field w-16 text-center ing-qty" />
      <select class="field w-74 text-[13px] ing-unit">
        ${UNITS.map((u) => `<option value="${u}" ${u === unit ? 'selected' : ''}>${u}</option>`).join('')}
      </select>
      <button type="button" class="p-2 text-ink-faint flex-shrink-0 remove-ing" aria-label="Supprimer">${icons.trash}</button>
    </div>`;
}

function stepRow(idx, value = '') {
  return `
    <div class="step-row flex gap-2 items-start">
      <span class="step-num">${idx}</span>
      <textarea rows="2" placeholder="Décris cette étape..." class="field flex-1 resize-none step-text">${escapeHtml(value)}</textarea>
      <button type="button" class="p-2 text-ink-faint flex-shrink-0 mt-1 remove-step" aria-label="Supprimer">${icons.trash}</button>
    </div>`;
}

function renumberSteps(container) {
  container.querySelectorAll('.step-row').forEach((row, i) => {
    row.querySelector('.step-num').textContent = i + 1;
  });
}

export function renderAdd() {
  return `
    <div class="pb-32 px-5 pt-8">
      <h1 class="font-display font-semibold text-[26px] text-ink">Nouvelle recette</h1>
      <p class="text-ink-soft text-[13px] mt-1">Remplis le strict nécessaire, le reste peut attendre.</p>

      <div class="mt-5">
        <p class="label-sm flex items-center gap-1.5">${icons.wand} Démarrer d'un modèle</p>
        <div class="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          ${QUICK_TEMPLATES.map((t, i) => `<button type="button" class="chip chip-inactive flex-shrink-0 tpl-btn" data-tpl="${i}">${escapeHtml(t.label)}</button>`).join('')}
        </div>
      </div>

      <div class="mt-6">
        <input type="file" accept="image/*" capture="environment" id="image-input" class="hidden" />
        <div id="image-zone">
          <button type="button" id="image-btn" class="photo-dropzone h-32">
            <span class="text-primary">${icons.camera}</span>
            <span class="text-primary text-[13px] font-semibold">Ajouter une photo</span>
          </button>
        </div>
      </div>

      <div class="mt-6">
        <label class="label-sm" for="recipe-title">Nom de la recette</label>
        <input id="recipe-title" placeholder="Ex. Tarte aux pommes de Mamie" class="field mt-2 font-display font-medium text-[15px]" />
      </div>

      <div class="mt-5">
        <p class="label-sm">Catégorie</p>
        <div class="flex gap-2 flex-wrap mt-2" id="category-group">
          ${CATEGORIES.map(
            (c, i) => `
            <button type="button" class="chip cat-chip ${i === 1 ? 'chip-selected' : ''}" data-cat="${c.id}" data-color="${c.color}" data-text="${c.text}"
              style="${i === 1 ? `background:${c.color};color:${c.text};border-color:${c.color}` : ''}">${escapeHtml(c.label)}</button>`
          ).join('')}
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 gap-4">
        <div>
          <p class="label-sm">Difficulté</p>
          <div class="flex gap-2 mt-2" id="difficulty-group">
            ${DIFFICULTIES.map(
              (d, i) => `<button type="button" class="chip flex-1 justify-center diff-chip ${i === 0 ? 'chip-active' : 'chip-inactive'}" data-diff="${d.id}">${d.label}</button>`
            ).join('')}
          </div>
        </div>

        <div class="flex gap-4">
          ${stepper('prep-time', 'Préparation (min)', 20, 5)}
          ${stepper('servings', 'Portions', 4, 1)}
        </div>
      </div>

      <div class="mt-5">
        <p class="label-sm">Étiquettes</p>
        <div class="flex gap-2 flex-wrap mt-2" id="tags-group">
          ${TAGS.map((t) => `<button type="button" class="chip chip-inactive tag-chip" data-tag="${t.id}">${t.label}</button>`).join('')}
        </div>
      </div>

      <div class="mt-6">
        <p class="label-sm">Ingrédients</p>
        <datalist id="ingredient-suggestions">
          ${COMMON_INGREDIENTS.map((i) => `<option value="${escapeHtml(i)}"></option>`).join('')}
        </datalist>
        <div class="mt-2 space-y-2" id="ingredients-list">${ingredientRow()}</div>
        <button type="button" id="add-ingredient" class="mt-2 flex items-center gap-1.5 text-primary text-[13.5px] font-semibold">
          ${icons.plus} Ajouter un ingrédient
        </button>
      </div>

      <div class="mt-6">
        <p class="label-sm">Étapes</p>
        <div class="mt-2 space-y-2" id="steps-list">${stepRow(1)}</div>
        <button type="button" id="add-step" class="mt-2 flex items-center gap-1.5 text-primary text-[13.5px] font-semibold">
          ${icons.plus} Ajouter une étape
        </button>
      </div>

      <div class="mt-6">
        <label class="label-sm" for="recipe-author">Ton prénom</label>
        <input id="recipe-author" placeholder="Qui partage cette recette ?" class="field mt-2" />
      </div>

      <div class="save-bar">
        <div class="mx-auto max-w-md pointer-events-auto px-5">
          <button type="button" id="save-recipe" class="save-btn" disabled>Enregistrer la recette</button>
        </div>
      </div>
    </div>`;
}

function stepper(id, label, value, step) {
  return `
    <div class="flex-1">
      <p class="label-sm">${label}</p>
      <div class="mt-2 flex items-center bg-surface border border-line rounded-xl overflow-hidden">
        <button type="button" class="p-3 text-primary stepper-minus" data-target="${id}" data-step="${step}">${icons.minus}</button>
        <span class="flex-1 text-center font-display font-semibold text-[15px]" id="${id}-value">${value}</span>
        <button type="button" class="p-3 text-primary stepper-plus" data-target="${id}" data-step="${step}">${icons.plus}</button>
      </div>
    </div>`;
}

export function mountAdd(container, { defaultAuthor, onSaved }) {
  const $ = (sel) => container.querySelector(sel);
  const $$ = (sel) => container.querySelectorAll(sel);

  if (defaultAuthor) $('#recipe-author').value = defaultAuthor;

  // Photo
  const imageInput = $('#image-input');
  const imageZone = $('#image-zone');
  $('#image-btn').addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imageZone.innerHTML = `
        <div class="relative rounded-xl2 overflow-hidden h-40">
          <img src="${reader.result}" alt="" class="w-full h-full object-cover" id="preview-img" />
          <button type="button" id="remove-image" class="absolute top-2 right-2 bg-white-90 rounded-full p-1.5">${icons.x}</button>
        </div>`;
      $('#remove-image').addEventListener('click', resetImageZone);
    };
    reader.readAsDataURL(file);
  });
  function resetImageZone() {
    imageZone.innerHTML = `
      <button type="button" id="image-btn" class="photo-dropzone h-32">
        <span class="text-primary">${icons.camera}</span>
        <span class="text-primary text-[13px] font-semibold">Ajouter une photo</span>
      </button>`;
    $('#image-btn').addEventListener('click', () => imageInput.click());
    imageInput.value = '';
  }

  // Titre -> active/désactive le bouton d'enregistrement
  const saveBtn = $('#save-recipe');
  const titleInput = $('#recipe-title');
  titleInput.addEventListener('input', () => {
    saveBtn.disabled = titleInput.value.trim().length === 0;
  });

  // Catégorie
  $$('.cat-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.cat-chip').forEach((b) => {
        b.classList.remove('chip-selected');
        b.removeAttribute('style');
      });
      btn.classList.add('chip-selected');
      btn.style.background = btn.dataset.color;
      btn.style.color = btn.dataset.text;
      btn.style.borderColor = btn.dataset.color;
    });
  });

  // Difficulté
  $$('.diff-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.diff-chip').forEach((b) => {
        b.classList.remove('chip-active');
        b.classList.add('chip-inactive');
      });
      btn.classList.remove('chip-inactive');
      btn.classList.add('chip-active');
    });
  });

  // Tags multi-sélection
  $$('.tag-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('chip-active');
      btn.classList.toggle('chip-inactive');
    });
  });

  // Steppers
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.stepper-minus, .stepper-plus');
    if (!btn) return;
    const target = $(`#${btn.dataset.target}-value`);
    const step = Number(btn.dataset.step);
    const min = btn.dataset.target === 'servings' ? 1 : 0;
    let val = Number(target.textContent) + (btn.classList.contains('stepper-plus') ? step : -step);
    target.textContent = Math.max(min, val);
  });

  // Ingrédients dynamiques
  const ingList = $('#ingredients-list');
  $('#add-ingredient').addEventListener('click', () => {
    ingList.insertAdjacentHTML('beforeend', ingredientRow());
  });
  ingList.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-ing');
    if (!btn) return;
    if (ingList.children.length > 1) btn.closest('.ing-row').remove();
  });

  // Étapes dynamiques
  const stepsList = $('#steps-list');
  $('#add-step').addEventListener('click', () => {
    stepsList.insertAdjacentHTML('beforeend', stepRow(stepsList.children.length + 1));
  });
  stepsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-step');
    if (!btn) return;
    if (stepsList.children.length > 1) {
      btn.closest('.step-row').remove();
      renumberSteps(stepsList);
    }
  });

  // Modèles rapides
  $$('.tpl-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = QUICK_TEMPLATES[Number(btn.dataset.tpl)];
      ingList.innerHTML = tpl.ingredients.map((i) => ingredientRow(i.name, i.qty, i.unit)).join('');
      stepsList.innerHTML = tpl.steps.map((s, i) => stepRow(i + 1, s)).join('');
    });
  });

  // Enregistrement
  saveBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) return;

    const category = $('.cat-chip.chip-selected')?.dataset.cat || 'plat';
    const difficulty = $('.diff-chip.chip-active')?.dataset.diff || 'facile';
    const prepTime = Number($('#prep-time-value').textContent) || 0;
    const servings = Number($('#servings-value').textContent) || 1;
    const author = $('#recipe-author').value.trim() || 'Anonyme';
    const tags = [...$$('.tag-chip.chip-active')].map((b) => b.dataset.tag);
    const image = $('#preview-img')?.src || null;

    const ingredients = [...ingList.querySelectorAll('.ing-row')]
      .map((row) => ({
        name: row.querySelector('.ing-name').value.trim(),
        qty: row.querySelector('.ing-qty').value.trim(),
        unit: row.querySelector('.ing-unit').value,
      }))
      .filter((i) => i.name);

    const steps = [...stepsList.querySelectorAll('.step-text')]
      .map((t) => t.value.trim())
      .filter(Boolean);

    saveBtn.disabled = true;
    saveBtn.textContent = 'Envoi...';

    const res = await api.addRecipe({
      title, category, difficulty, prepTime, servings, author, tags, ingredients, steps, image,
    });

    if (res?.ok) {
      saveBtn.innerHTML = `${icons.check} Recette enregistrée !`;
      if (author) localStorage.setItem('mes-recettes-author', author);
      setTimeout(() => onSaved?.(), 700);
    } else {
      saveBtn.textContent = 'Erreur — réessaie';
      saveBtn.disabled = false;
    }
  });
}
