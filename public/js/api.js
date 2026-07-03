// api.js — connexion Socket.io et échanges avec le serveur
// eslint-disable-next-line no-undef
const socket = io();

const listeners = new Set();

socket.on('recipes:update', (recipes) => {
  listeners.forEach((cb) => cb(recipes));
});

export const api = {
  onUpdate(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  addRecipe(recipe) {
    return new Promise((resolve) => {
      socket.emit('recipe:add', recipe, (res) => resolve(res));
    });
  },
  deleteRecipe(id) {
    return new Promise((resolve) => {
      socket.emit('recipe:delete', id, (res) => resolve(res));
    });
  },
  get connected() {
    return socket.connected;
  },
  onConnectionChange(cb) {
    socket.on('connect', () => cb(true));
    socket.on('disconnect', () => cb(false));
  },
};
