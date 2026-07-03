// server.js — serveur unique : sert le front statique + gère le temps réel
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'recipes.json');

// ---------------------------------------------------------------------------
// Persistance : Upstash Redis en prod si les variables d'env sont présentes,
// sinon repli automatique sur un fichier JSON local (dev sans rien à installer).
// ---------------------------------------------------------------------------
let redis = null;
let useRedis = false;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const { Redis } = require('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  useRedis = true;
  console.log('✅ Upstash Redis détecté — les recettes seront persistées en prod.');
} else {
  console.log('ℹ️  Pas de variables Redis — repli sur recipes.json (mode local/dev).');
}

let recipes = [];
let saveTimer = null;

async function loadRecipes() {
  if (useRedis) {
    try {
      recipes = (await redis.get('recipes')) || [];
    } catch (err) {
      console.error('Erreur lecture Redis, on démarre avec une liste vide :', err.message);
      recipes = [];
    }
  } else {
    try {
      recipes = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch {
      recipes = [];
    }
  }
  recipes.forEach((r) => {
    if (!Array.isArray(r.reviews)) r.reviews = [];
  });
  console.log(`📖 ${recipes.length} recette(s) chargée(s).`);
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveRecipes, 800); // debounce pour éviter d'écrire à chaque frappe
}

async function saveRecipes() {
  if (useRedis) {
    try {
      await redis.set('recipes', recipes);
    } catch (err) {
      console.error('Erreur écriture Redis :', err.message);
    }
  } else {
    fs.writeFile(DB_FILE, JSON.stringify(recipes, null, 2), (err) => {
      if (err) console.error('Erreur écriture recipes.json :', err.message);
    });
  }
}

// ---------------------------------------------------------------------------
// Validation / sanitation des entrées utilisateur (le serveur fait autorité)
// ---------------------------------------------------------------------------
const CATEGORIES = ['entree', 'plat', 'dessert', 'apero', 'boisson'];
const DIFFICULTIES = ['facile', 'moyen', 'difficile'];
const MAX_STR = 200;
const MAX_STEP = 500;
const MAX_LIST = 40;

function cleanStr(v, max = MAX_STR) {
  if (typeof v !== 'string') return '';
  return v.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

function sanitizeRecipe(input) {
  if (!input || typeof input !== 'object') return null;
  const title = cleanStr(input.title, 120);
  if (!title) return null;

  const category = CATEGORIES.includes(input.category) ? input.category : 'plat';
  const difficulty = DIFFICULTIES.includes(input.difficulty) ? input.difficulty : 'facile';
  const prepTime = Math.max(0, Math.min(600, Number(input.prepTime) || 0));
  const servings = Math.max(1, Math.min(50, Number(input.servings) || 1));
  const author = cleanStr(input.author, 40) || 'Anonyme';

  const tags = Array.isArray(input.tags)
    ? input.tags.filter((t) => typeof t === 'string').map((t) => cleanStr(t, 30)).slice(0, 10)
    : [];

  const ingredients = Array.isArray(input.ingredients)
    ? input.ingredients
        .slice(0, MAX_LIST)
        .map((i) => ({
          name: cleanStr(i?.name, 80),
          qty: cleanStr(String(i?.qty ?? ''), 20),
          unit: cleanStr(i?.unit, 20),
        }))
        .filter((i) => i.name)
    : [];

  const steps = Array.isArray(input.steps)
    ? input.steps.map((s) => cleanStr(s, MAX_STEP)).filter(Boolean).slice(0, MAX_LIST)
    : [];

  // L'image est une data URL base64 (petites photos de recette) — on plafonne la taille.
  let image = null;
  if (typeof input.image === 'string' && input.image.startsWith('data:image/')) {
    if (input.image.length <= 1_500_000) image = input.image;
  }

  return {
    id: crypto.randomUUID(),
    title,
    category,
    difficulty,
    prepTime,
    servings,
    author,
    tags,
    ingredients,
    steps,
    image,
    reviews: [],
    createdAt: Date.now(),
  };
}

const MAX_COMMENT = 600;

function sanitizeReview(input) {
  if (!input || typeof input !== 'object') return null;
  const author = cleanStr(input.author, 40) || 'Anonyme';
  const comment = cleanStr(input.comment, MAX_COMMENT);
  let rating = Math.round(Number(input.rating));
  if (!Number.isFinite(rating)) rating = 0;
  rating = Math.max(1, Math.min(5, rating));

  let image = null;
  if (typeof input.image === 'string' && input.image.startsWith('data:image/')) {
    if (input.image.length <= 1_500_000) image = input.image;
  }

  if (!comment && !image) return null; // un avis doit dire ou montrer quelque chose

  return {
    id: crypto.randomUUID(),
    author,
    rating,
    comment,
    image,
    createdAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Statique + Socket.io
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// Petite route pour vérifier en un coup d'oeil si Redis est bien branché en prod.
// À visiter directement : https://ton-app.onrender.com/healthz
app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    storage: useRedis ? 'upstash-redis' : 'local-json-fallback',
    recipesCount: recipes.length,
  });
});

io.on('connection', (socket) => {
  socket.emit('recipes:update', recipes);

  socket.on('recipe:add', (payload, ack) => {
    const recipe = sanitizeRecipe(payload);
    if (!recipe) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Recette invalide.' });
      return;
    }
    recipes.unshift(recipe);
    scheduleSave();
    io.emit('recipes:update', recipes);
    if (typeof ack === 'function') ack({ ok: true, recipe });
  });

  socket.on('recipe:delete', (id, ack) => {
    if (typeof id !== 'string') return;
    recipes = recipes.filter((r) => r.id !== id);
    scheduleSave();
    io.emit('recipes:update', recipes);
    if (typeof ack === 'function') ack({ ok: true });
  });

  socket.on('review:add', ({ recipeId, review } = {}, ack) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Recette introuvable.' });
      return;
    }
    const clean = sanitizeReview(review);
    if (!clean) {
      if (typeof ack === 'function') ack({ ok: false, error: 'Avis invalide.' });
      return;
    }
    if (!Array.isArray(recipe.reviews)) recipe.reviews = [];
    recipe.reviews.unshift(clean);
    scheduleSave();
    io.emit('recipes:update', recipes);
    if (typeof ack === 'function') ack({ ok: true, review: clean });
  });

  socket.on('review:delete', ({ recipeId, reviewId } = {}, ack) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe || !Array.isArray(recipe.reviews)) return;
    recipe.reviews = recipe.reviews.filter((rv) => rv.id !== reviewId);
    scheduleSave();
    io.emit('recipes:update', recipes);
    if (typeof ack === 'function') ack({ ok: true });
  });
});

loadRecipes().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  });
});
