// recipes.js — the ingredients on the counter and the dishes customers order.
// Every dish is a set of ingredients; order does not matter, extras do not count.

const INGREDIENTS = [
  { id: 'nasi',    name: 'Nasi',    key: '1', color: '#fff8e7', dark: '#d9c49a' },
  { id: 'ayam',    name: 'Ayam',    key: '2', color: '#e8a34c', dark: '#9c5a1d' },
  { id: 'telur',   name: 'Telur',   key: '3', color: '#ffd94d', dark: '#c98f1b' },
  { id: 'sayur',   name: 'Sayur',   key: '4', color: '#7bc96f', dark: '#3e7d32' },
  { id: 'sambal',  name: 'Sambal',  key: '5', color: '#e23b2e', dark: '#8f1d12' },
  { id: 'kerupuk', name: 'Kerupuk', key: '6', color: '#f2c14e', dark: '#b07f1e' },
];

const DISHES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'sambal'], price: 100 },
  { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['ayam', 'sambal', 'nasi'], price: 120 },
  { id: 'gado-gado',   name: 'Gado-Gado',   needs: ['sayur', 'telur', 'kerupuk'], price: 110 },
  { id: 'soto-ayam',   name: 'Soto Ayam',   needs: ['ayam', 'nasi', 'sayur'], price: 130 },
];

function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}

/** True when the plate holds exactly the dish's ingredients, no more and no less. */
function plateMatchesDish(plate, dish) {
  if (plate.length !== dish.needs.length) return false;
  return dish.needs.every((need) => plate.includes(need));
}

/** The first active order the plate satisfies, or null. */
function findMatchingOrder(plate, orders) {
  for (const order of orders) {
    if (plateMatchesDish(plate, order.dish)) return order;
  }
  return null;
}
