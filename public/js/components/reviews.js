// reviews.js — avis sur une recette : note, commentaire, photo du plat réalisé
import { icons } from '../icons.js';
import { escapeHtml, formatDate, averageRating } from '../utils.js';
import { api } from '../api.js';

function starRow(rating, size = 14) {
  let html = '<span class="star-row">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? 'star-filled' : ''}" style="width:${size}px;height:${size}px">${icons.star}</span>`;
  }
  html += '</span>';
  return html;
}

function reviewCard(review, recipeId) {
  return `
    <div class="review-card" data-review-id="${review.id}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="review-avatar">${icons.user}</span>
          <div>
            <p class="text-[13.5px] font-semibold text-ink">${escapeHtml(review.author)}</p>
            <p class="text-[11px] text-ink-faint">${formatDate(review.createdAt)}</p>
          </div>
        </div>
        ${starRow(review.rating)}
      </div>
      ${review.comment ? `<p class="text-[13.5px] text-ink mt-2 leading-relaxed">${escapeHtml(review.comment)}</p>` : ''}
      ${review.image ? `<img src="${review.image}" alt="" class="review-photo" />` : ''}
      <button type="button" class="review-delete" data-review-id="${review.id}" data-recipe-id="${recipeId}">${icons.trash}</button>
    </div>`;
}

export function renderReviews(recipe) {
  const reviews = recipe.reviews || [];
  const avg = averageRating(reviews);

  return `
    <div class="mt-8" id="reviews-section">
      <div class="flex items-center justify-between">
        <h2 class="font-display font-semibold text-[17px] text-ink">Avis</h2>
        ${
          avg !== null
            ? `<div class="flex items-center gap-1.5">${starRow(avg, 15)}<span class="text-[13px] font-semibold text-ink-soft">${avg.toFixed(1)} · ${reviews.length}</span></div>`
            : ''
        }
      </div>

      <div id="reviews-list" class="mt-3 space-y-3">
        ${
          reviews.length
            ? reviews.map((r) => reviewCard(r, recipe.id)).join('')
            : `<p class="text-ink-faint text-[13.5px] italic">Personne n'a encore testé cette recette — sois le premier !</p>`
        }
      </div>

      <div class="review-form mt-5">
        <p class="label-sm">Toi aussi tu l'as testée ?</p>

        <div class="mt-2 flex items-center gap-1" id="rating-picker">
          ${[1, 2, 3, 4, 5]
            .map(
              (n) =>
                `<button type="button" class="rating-star" data-value="${n}">${icons.star}</button>`
            )
            .join('')}
        </div>

        <textarea id="review-comment" rows="2" placeholder="Qu'en as-tu pensé ?" class="field mt-2.5 resize-none"></textarea>

        <div class="mt-2.5">
          <input type="file" accept="image/*" capture="environment" id="review-image-input" class="hidden" />
          <div id="review-image-zone">
            <button type="button" id="review-image-btn" class="review-photo-btn">
              ${icons.camera} <span>Photo du plat réalisé</span>
            </button>
          </div>
        </div>

        <input id="review-author" placeholder="Ton prénom" class="field mt-2.5" />

        <button type="button" id="submit-review" class="review-submit mt-3" disabled>
          ${icons.comment} Publier mon avis
        </button>
      </div>
    </div>`;
}

export function mountReviews(container, recipe, { defaultAuthor }) {
  const $ = (sel) => container.querySelector(sel);
  const $$ = (sel) => container.querySelectorAll(sel);

  if (defaultAuthor) $('#review-author').value = defaultAuthor;

  let rating = 0;
  $$('.rating-star').forEach((btn) => {
    btn.addEventListener('click', () => {
      rating = Number(btn.dataset.value);
      $$('.rating-star').forEach((b) => b.classList.toggle('rating-star-active', Number(b.dataset.value) <= rating));
      checkReady();
    });
  });

  const imageInput = $('#review-image-input');
  const imageZone = $('#review-image-zone');
  $('#review-image-btn').addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imageZone.innerHTML = `
        <div class="review-photo-preview">
          <img src="${reader.result}" alt="" id="review-preview-img" />
          <button type="button" id="review-remove-image">${icons.x}</button>
        </div>`;
      $('#review-remove-image').addEventListener('click', resetImageZone);
    };
    reader.readAsDataURL(file);
  });
  function resetImageZone() {
    imageZone.innerHTML = `<button type="button" id="review-image-btn" class="review-photo-btn">${icons.camera} <span>Photo du plat réalisé</span></button>`;
    $('#review-image-btn').addEventListener('click', () => imageInput.click());
    imageInput.value = '';
  }

  const commentInput = $('#review-comment');
  const submitBtn = $('#submit-review');

  function checkReady() {
    submitBtn.disabled = !(rating > 0);
  }
  commentInput.addEventListener('input', checkReady);

  submitBtn.addEventListener('click', async () => {
    if (rating === 0) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi...';

    const review = {
      author: $('#review-author').value.trim() || 'Anonyme',
      rating,
      comment: commentInput.value.trim(),
      image: $('#review-preview-img')?.src || null,
    };

    const res = await api.addReview(recipe.id, review);
    if (res?.ok) {
      if (review.author) localStorage.setItem('mes-recettes-author', review.author);
      // Le formulaire sera régénéré au prochain recipes:update (via re-render du détail)
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icons.comment} Réessayer`;
    }
  });

  container.querySelectorAll('.review-delete').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Supprimer cet avis ?')) return;
      await api.deleteReview(btn.dataset.recipeId, btn.dataset.reviewId);
    });
  });
}
