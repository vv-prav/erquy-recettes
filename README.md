# Mes Recettes 🍋💜

Webapp mobile-first pour partager des recettes de cuisine **en temps réel** entre amis.

Reconstruite avec ta stack habituelle : Node + Express 5 + Socket.io (CommonJS), front en vanilla JS + PWA, persistance Upstash Redis avec repli JSON local, déploiement Render.

## Stack

- **Backend** : Node.js CommonJS, Express 5 (`express.static('public')`), Socket.io 4 pour le temps réel.
- **Frontend** : vanilla JS (modules ES natifs, aucun bundler), PWA installable (`manifest.json` + `sw.js` versionné).
- **Persistance** : Upstash Redis en prod (détection automatique via variables d'env), repli sur `recipes.json` en local.
- **Le serveur fait autorité** : toutes les recettes sont validées et nettoyées côté serveur (`sanitizeRecipe` dans `server.js`) avant d'être diffusées à tout le monde via `io.emit('recipes:update', ...)`.

## Démarrer en local

```bash
npm install
npm start
```

Ouvre `http://localhost:3000`. Aucune base de données à installer : sans variables Redis, l'app utilise automatiquement `recipes.json`.

Pour tester depuis ton téléphone sur le même Wi-Fi : remplace `localhost` par l'IP locale de ton ordi (ex. `http://192.168.1.23:3000`).

## Déployer sur Render

1. Pousse ce dossier sur un dépôt GitHub.
2. Sur [render.com](https://render.com) → **New Web Service** → connecte le repo.
3. Build command : *(aucune, ou `npm install`)* — Start command : `npm start`.
4. Dans **Environment**, ajoute :
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   
   (récupérés sur le dashboard [Upstash](https://upstash.com), offre gratuite largement suffisante pour ce projet.)

⚠️ Sur Render le disque est éphémère : **sans les variables Redis, les recettes ne survivront pas à un redéploiement**. Avec Redis configuré, tout est persistant et partagé entre tous tes amis, peu importe leur appareil.

## Comment ça marche (temps réel)

- Chaque client se connecte en Socket.io et reçoit immédiatement la liste complète (`recipes:update`).
- Ajouter une recette émet `recipe:add` → le serveur valide, sauvegarde (debounce 800ms), puis **rediffuse la liste à jour à tout le monde** — tes amis voient la nouvelle recette apparaître sans recharger la page.
- Supprimer une recette suit le même principe avec `recipe:delete`.
- Une bannière discrète s'affiche en haut si la connexion est perdue (`recipes:update` ne peut plus être reçu tant qu'elle n'est pas rétablie).

## Structure du projet

```
mes-recettes/
├── server.js              ← serveur Express + Socket.io (à la racine)
├── package.json
├── recipes.json            ← repli local de la "DB" (ignoré une fois Redis actif)
└── public/
    ├── index.html
    ├── manifest.json
    ├── sw.js                ← service worker (CACHE_VERSION à incrémenter à chaque modif statique)
    ├── icons/               ← icônes PWA (192 / 512)
    ├── css/style.css
    └── js/
        ├── app.js            ← routing entre les 3 onglets + état des recettes
        ├── api.js             ← wrapper Socket.io (source unique de vérité)
        ├── presets.js          ← catégories, tags, ingrédients courants, modèles rapides
        ├── icons.js             ← icônes SVG inline (pas de dépendance externe)
        ├── utils.js              ← escapeHtml / escapeAttr (protection XSS)
        ├── components/
        │   ├── card.js            ← carte recette (grille + format large)
        │   └── bottomnav.js        ← barre d'onglets
        └── views/
            ├── home.js              ← accueil (CTA + dernières recettes)
            ├── add.js                ← formulaire d'ajout optimisé mobile
            ├── list.js                ← liste avec recherche + filtres
            └── detail.js               ← fiche recette (ingrédients cochables, portions ajustables)
```

## ⚠️ Rappel de workflow

- **À chaque modif d'un fichier dans `public/`** : incrémente `CACHE_VERSION` dans `public/sw.js`, et pense à un rechargement forcé côté client (+ redémarrage du serveur si `server.js` a changé).
- **Validation avant livraison** : `node --check server.js` (et pareil pour les fichiers de `public/js`, qui sont des modules ES — utilise `node --check --input-type=module` ou renomme temporairement en `.mjs` pour les tester).
- Le serveur nettoie et valide toujours les données envoyées par les clients (`sanitizeRecipe`) — ne fais jamais confiance à ce qu'envoie le navigateur.

## Personnalisation rapide

- **Couleurs / polices** : variables CSS en haut de `public/css/style.css`.
- **Catégories, tags, ingrédients courants, modèles de recette** : `public/js/presets.js` (uniquement côté affichage — mets aussi à jour `CATEGORIES`/`DIFFICULTIES` dans `server.js` si tu ajoutes une catégorie, car le serveur valide contre sa propre liste).
