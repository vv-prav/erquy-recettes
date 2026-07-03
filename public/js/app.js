// app.js — point d'entrée : routing entre les 3 onglets + état des recettes
import { api } from './api.js';
import { renderBottomNav } from './components/bottomnav.js';
import { renderHome } from './views/home.js';
import { renderList, mountList } from './views/list.js';
import { renderAdd, mountAdd } from './views/add.js';
import { renderDetail, mountDetail } from './views/detail.js';

const view = document.getElementById('view');
const nav = document.getElementById('nav');
const offlineBanner = document.getElementById('offline-banner');

let recipes = [];
let currentTab = 'accueil';

function openDetail(recipe) {
  const overlay = document.createElement('div');
  overlay.innerHTML = renderDetail(recipe);
  const node = overlay.firstElementChild;
  document.body.appendChild(node);
  mountDetail(node, recipe, {
    onBack: () => node.remove(),
    onDeleted: () => node.remove(),
  });
}

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
