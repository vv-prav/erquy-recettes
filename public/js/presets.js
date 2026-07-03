// presets.js — données de référence partagées par toute l'app
export const CATEGORIES = [
  { id: 'entree', label: 'Entrée', color: '#E9A8C7', text: '#7A3B5A' },
  { id: 'plat', label: 'Plat', color: '#5B3E96', text: '#FFFFFF' },
  { id: 'dessert', label: 'Dessert', color: '#EFAA3C', text: '#5A3A0A' },
  { id: 'apero', label: 'Apéro', color: '#8B7BC7', text: '#FFFFFF' },
  { id: 'boisson', label: 'Boisson', color: '#3E2A6B', text: '#FFFFFF' },
];

export const DIFFICULTIES = [
  { id: 'facile', label: 'Facile' },
  { id: 'moyen', label: 'Moyen' },
  { id: 'difficile', label: 'Difficile' },
];

export const UNITS = ['g', 'kg', 'ml', 'L', 'c. à s.', 'c. à c.', 'pièce(s)', 'pincée'];

export const COMMON_INGREDIENTS = [
  'Sel', 'Poivre', "Huile d'olive", 'Beurre', 'Ail', 'Oignon', 'Farine',
  'Sucre', 'Œufs', 'Lait', 'Crème fraîche', 'Tomate', 'Citron', 'Persil',
  'Basilic', 'Parmesan', 'Pâtes', 'Riz', 'Pommes de terre', 'Vin blanc',
  'Chapelure', 'Levure', 'Miel', 'Moutarde', 'Vinaigre', 'Poulet',
];

export const TAGS = [
  { id: 'vege', label: '🌱 Végé' },
  { id: 'vegan', label: '🌿 Vegan' },
  { id: 'sans-gluten', label: '🌾 Sans gluten' },
  { id: 'rapide', label: '⚡ Rapide' },
  { id: 'sans-cuisson', label: '❄️ Sans cuisson' },
  { id: 'epice', label: '🌶️ Épicé' },
];

export const QUICK_TEMPLATES = [
  {
    label: 'Pâtes simples',
    ingredients: [
      { name: 'Pâtes', qty: '400', unit: 'g' },
      { name: "Huile d'olive", qty: '2', unit: 'c. à s.' },
      { name: 'Parmesan', qty: '50', unit: 'g' },
      { name: 'Sel', qty: '1', unit: 'pincée' },
    ],
    steps: ["Faire bouillir l'eau salée.", 'Cuire les pâtes selon le paquet.', 'Égoutter et assaisonner.'],
  },
  {
    label: 'Salade rapide',
    ingredients: [
      { name: 'Tomate', qty: '3', unit: 'pièce(s)' },
      { name: "Huile d'olive", qty: '2', unit: 'c. à s.' },
      { name: 'Sel', qty: '1', unit: 'pincée' },
    ],
    steps: ['Laver et couper les légumes.', 'Assaisonner et mélanger.'],
  },
];

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[1];
}

export function getDifficultyLabel(id) {
  return DIFFICULTIES.find((d) => d.id === id)?.label || 'Facile';
}

export function getTagLabel(id) {
  return TAGS.find((t) => t.id === id)?.label || id;
}
