// The warung's ingredients and dishes. A dish is a set of ingredient ids;
// the plate must hold exactly that set (any order) to serve the order.

export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#fff6e0', dark: '#c9b183', hint: 'steamed rice' },
  { id: 'ayam', name: 'Ayam', key: '2', color: '#f2a594', dark: '#a34a38', hint: 'raw chicken, grill it first' },
  { id: 'telur', name: 'Telur', key: '3', color: '#ffe9a8', dark: '#c98f2e', hint: 'fried egg' },
  { id: 'sayur', name: 'Sayur', key: '4', color: '#8fce62', dark: '#3e7a2e', hint: 'greens' },
  { id: 'sambal', name: 'Sambal', key: '5', color: '#e2483a', dark: '#8f1d14', hint: 'chilli sauce' },
  { id: 'kerupuk', name: 'Kerupuk', key: '6', color: '#ffd98a', dark: '#b98a2e', hint: 'crackers' },
];

export const GRILLED_CHICKEN = 'ayambakar';

export const DISHES = [
  {
    id: 'ayam-bakar',
    name: 'Nasi Ayam Bakar',
    price: 120,
    needs: ['nasi', 'ayambakar', 'sambal'],
    blurb: 'smoky chicken',
  },
  {
    id: 'telur-dadar',
    name: 'Nasi Telur Dadar',
    price: 100,
    needs: ['nasi', 'telur', 'sayur'],
    blurb: 'fluffy omelette',
  },
  {
    id: 'sayur-lodeh',
    name: 'Nasi Sayur Lodeh',
    price: 110,
    needs: ['nasi', 'sayur', 'kerupuk'],
    blurb: 'coconut veggie',
  },
  {
    id: 'komplit',
    name: 'Nasi Komplit',
    price: 150,
    needs: ['nasi', 'ayambakar', 'telur', 'kerupuk'],
    blurb: 'all in one',
  },
  {
    id: 'pedas',
    name: 'Nasi Pedas',
    price: 130,
    needs: ['nasi', 'sambal', 'telur', 'sayur'],
    blurb: 'extra hot',
  },
];

export function ingredientById(id) {
  if (id === GRILLED_CHICKEN) {
    return { id: GRILLED_CHICKEN, name: 'Ayam Bakar', key: '', color: '#c97b3a', dark: '#6e3c14', hint: 'grilled chicken' };
  }
  return INGREDIENTS.find((item) => item.id === id) || null;
}

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id) || null;
}

export function plateMatchesDish(plate, dish) {
  if (plate.length !== dish.needs.length) return false;
  const sortedPlate = plate.slice().sort();
  const sortedNeeds = dish.needs.slice().sort();
  for (let index = 0; index < sortedPlate.length; index += 1) {
    if (sortedPlate[index] !== sortedNeeds[index]) return false;
  }
  return true;
}

export function findMatchingOrder(plate, orders) {
  for (let index = 0; index < orders.length; index += 1) {
    const dish = dishById(orders[index].dishId);
    if (dish && plateMatchesDish(plate, dish)) return orders[index];
  }
  return null;
}
