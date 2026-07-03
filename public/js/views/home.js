// home.js — page d'accueil : CTA d'ajout + dernières recettes
import { cardWide } from '../components/card.js';
import { icons } from '../icons.js';

export function renderHome(recipes) {
  const latest = [...recipes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
  const count = recipes.length;
  const myAuthor = localStorage.getItem('mes-recettes-author') || '';

  return `
    <div class="pb-28">
      <div class="hero">
        <div class="drip-accent" style="width:90px;height:90px;background:#EFAA3C;top:-20px;right:-20px;opacity:.85"></div>
        <div class="drip-accent" style="width:40px;height:40px;background:#E9A8C7;bottom:10px;right:60px;opacity:.7"></div>
        <p class="hero-eyebrow">Entre amis</p>
        <h1 class="hero-title">Nos recettes, toutes au même endroit</h1>
        <p class="hero-sub">${count} recette${count > 1 ? 's' : ''} partagée${count > 1 ? 's' : ''} pour l'instant</p>
        <div class="flex gap-2.5 flex-wrap mt-6">
          <button id="hero-add-btn" class="hero-cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Ajouter une recette
          </button>
          ${
            myAuthor
              ? `<button id="hero-mine-btn" class="hero-cta hero-cta-outline">${icons.user} Mes recettes</button>`
              : ''
          }
        </div>
      </div>

      <div class="px-5 mt-7">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-display font-semibold text-[19px] text-ink flex items-center gap-1.5">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EFAA3C" stroke-width="2"><path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/></svg>
            Dernières recettes
          </h2>
          ${count > 0 ? `<button id="see-all-btn" class="text-primary text-[13px] font-semibold">Tout voir</button>` : ''}
        </div>

        ${
          latest.length === 0
            ? `<div class="empty-box">
                <p class="font-display font-semibold text-ink text-[15px]">Aucune recette pour le moment</p>
                <p class="text-ink-soft text-[13px] mt-1">Ajoute la première recette de la bande !</p>
              </div>`
            : `<div class="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
                ${latest.map(cardWide).join('')}
              </div>`
        }
      </div>
    </div>`;
}
