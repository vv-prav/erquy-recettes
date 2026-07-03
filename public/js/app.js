// app.js — point d'entrée : routing entre les 3 onglets + état des recettes
import { api } from './api.js';
import { renderBottomNav } from './components/bottomnav.js';
import { renderHome } from './views/home.js';
import { renderList, mountList } from './views/list.js';
import { renderAdd, mountAdd } from './views/add.js';
import { renderDetail, mountDetail } from './views/detail.js';
import { renderAuthor, mountAuthor } from './views/author.js';
import { icons } from './icons.js';

const view = document.getElementById('view');
const nav = document.getElementById('nav');
const offlineBanner = document.getElementById('offline-banner');

let recipes = [];
let currentTab = 'accueil';
let openDetailNode = null;
let openDetailId = null;
let openAuthorNode = null;
let openAuthorName = null;

function openDetail(recipe) {
  const overlay = document.createElement('div');
  overlay.innerHTML = renderDetail(recipe);
  const node = overlay.firstElementChild;
  document.body.appendChild(node);
  openDetailNode = node;
  openDetailId = recipe.id;
  mountDetail(node, recipe, {
    onBack: () => {
      node.remove();
      openDetailNode = null;
      openDetailId = null;
    },
    onDeleted: () => {
      node.remove();
      openDetailNode = null;
      openDetailId = null;
    },
    onOpenAuthor: (author) => openAuthor(author),
    defaultAuthor: localStorage.getItem('mes-recettes-author') || '',
  });
}

function openAuthor(authorName) {
  document.getElementById('author-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.innerHTML = renderAuthor(authorName, recipes);
  const node = overlay.firstElementChild;
  document.body.appendChild(node);
  openAuthorNode = node;
  openAuthorName = authorName;
  mountAuthor(node, {
    recipes,
    onBack: () => {
      node.remove();
      openAuthorNode = null;
      openAuthorName = null;
    },
    onOpenRecipe: (r) => openDetail(r),
  });
}

// Délégation globale : tout élément [data-author] ouvre la fiche de son auteur,
// que ce soit sur l'accueil, dans la liste, ou une fiche recette déjà ouverte.
document.body.addEventListener('click', (e) => {
  const el = e.target.closest('[data-author]');
  if (!el) return;
  openAuthor(el.dataset.author);
});

function renderCurrentTab() {
  nav.innerHTML = renderBottomNav(currentTab);
  nav.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      renderCurrentTab();
    });
  });

  if (currentTab === 'accueil') {
    view.innerHTML = renderHome(recipes);
    view.querySelector('#hero-add-btn')?.addEventListener('click', () => {
      currentTab = 'ajouter';
      renderCurrentTab();
    });
    view.querySelector('#see-all-btn')?.addEventListener('click', () => {
      currentTab = 'recettes';
      renderCurrentTab();
    });
    view.querySelector('#hero-mine-btn')?.addEventListener('click', () => {
      openAuthor(localStorage.getItem('mes-recettes-author') || '');
    });
    view.querySelectorAll('[data-open]').forEach((el) =>
      el.addEventListener('click', () => {
        const r = recipes.find((x) => x.id === el.dataset.open);
        if (r) openDetail(r);
      })
    );
  }

  if (currentTab === 'ajouter') {
    view.innerHTML = renderAdd();
    mountAdd(view, {
      defaultAuthor: localStorage.getItem('mes-recettes-author') || '',
      onSaved: () => {
        currentTab = 'accueil';
        renderCurrentTab();
      },
    });
  }

  if (currentTab === 'recettes') {
    view.innerHTML = renderList(recipes);
    mountList(view, recipes);
    // délégation : couvre aussi les cartes réaffichées après un filtre/une recherche
    view.addEventListener('click', (e) => {
      const el = e.target.closest('[data-open]');
      if (!el) return;
      const r = recipes.find((x) => x.id === el.dataset.open);
      if (r) openDetail(r);
    });
  }
}

api.onUpdate((updated) => {
  recipes = updated;
  // On ne redessine pas l'écran "ajouter" pour ne pas perdre la saisie en cours
  if (currentTab !== 'ajouter') renderCurrentTab();

  // Rafraîchit une fiche recette ouverte (ex: un nouvel avis vient d'arriver)
  if (openDetailNode && openDetailId) {
    const scrollPos = openDetailNode.scrollTop;
    const fresh = recipes.find((r) => r.id === openDetailId);
    if (fresh) {
      // On garde le brouillon d'avis en cours de saisie pour ne pas le perdre
      // si une mise à jour arrive pendant que la personne écrit son commentaire.
      const draftRating = openDetailNode.querySelectorAll('.rating-star-active').length;
      const draftComment = openDetailNode.querySelector('#review-comment')?.value || '';
      const draftAuthor = openDetailNode.querySelector('#review-author')?.value || '';
      const draftPhoto = openDetailNode.querySelector('#review-preview-img')?.src || null;

      openDetailNode.innerHTML = new DOMParser()
        .parseFromString(renderDetail(fresh), 'text/html')
        .querySelector('.detail-overlay').innerHTML;
      mountDetail(openDetailNode, fresh, {
        onBack: () => {
          openDetailNode.remove();
          openDetailNode = null;
          openDetailId = null;
        },
        onDeleted: () => {
          openDetailNode.remove();
          openDetailNode = null;
          openDetailId = null;
        },
        onOpenAuthor: (author) => openAuthor(author),
        defaultAuthor: localStorage.getItem('mes-recettes-author') || '',
      });

      // Restaure le brouillon dans le formulaire tout neuf
      if (draftRating > 0) {
        openDetailNode.querySelector(`.rating-star[data-value="${draftRating}"]`)?.click();
      }
      if (draftComment) {
        const c = openDetailNode.querySelector('#review-comment');
        if (c) {
          c.value = draftComment;
          c.dispatchEvent(new Event('input'));
        }
      }
      if (draftAuthor) {
        const a = openDetailNode.querySelector('#review-author');
        if (a) a.value = draftAuthor;
      }
      if (draftPhoto) {
        const zone = openDetailNode.querySelector('#review-image-zone');
        if (zone) {
          zone.innerHTML = `<div class="review-photo-preview"><img src="${draftPhoto}" alt="" id="review-preview-img" /><button type="button" id="review-remove-image">${icons.x}</button></div>`;
          zone.querySelector('#review-remove-image').addEventListener('click', () => {
            zone.innerHTML = `<button type="button" id="review-image-btn" class="review-photo-btn">${icons.camera} <span>Photo du plat réalisé</span></button>`;
          });
        }
      }

      openDetailNode.scrollTop = scrollPos;
    } else {
      openDetailNode.remove();
      openDetailNode = null;
      openDetailId = null;
    }
  }

  // Rafraîchit une fiche auteur ouverte
  if (openAuthorNode && openAuthorName) {
    const scrollPos = openAuthorNode.scrollTop;
    openAuthorNode.innerHTML = new DOMParser()
      .parseFromString(renderAuthor(openAuthorName, recipes), 'text/html')
      .querySelector('.detail-overlay').innerHTML;
    mountAuthor(openAuthorNode, {
      recipes,
      onBack: () => {
        openAuthorNode.remove();
        openAuthorNode = null;
        openAuthorName = null;
      },
      onOpenRecipe: (r) => openDetail(r),
    });
    openAuthorNode.scrollTop = scrollPos;
  }
});

api.onConnectionChange((connected) => {
  offlineBanner.classList.toggle('hidden', connected);
});

renderCurrentTab();

// Enregistrement du service worker (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
