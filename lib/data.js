// Shared data utility for Coffee House

const defaultCoffees = [
  { id: 'A', name: 'Coffee A', description: 'Bright and fruity, perfect for adventurous palates.', tags: ['fruity', 'bright', 'adventurous'] },
  { id: 'B', name: 'Coffee B', description: 'Smooth and chocolatey, a crowd-pleaser.', tags: ['chocolate', 'smooth', 'classic'] },
  { id: 'C', name: 'Coffee C', description: 'Nutty and balanced, for those who like harmony.', tags: ['nutty', 'balanced', 'mellow'] },
  { id: 'D', name: 'Coffee D', description: 'Bold and intense, for the strong-hearted.', tags: ['bold', 'intense', 'strong'] },
  { id: 'E', name: 'Coffee E', description: 'Floral and delicate, a gentle experience.', tags: ['floral', 'delicate', 'gentle'] }
];

export function getCoffees() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('adminCoffees');
    if (stored) return JSON.parse(stored);
  }
  return defaultCoffees;
}

export function setCoffees(coffees) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminCoffees', JSON.stringify(coffees));
  }
}

export function getTastings() {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('tastings') || '[]');
  }
  return [];
}

export function getReviews() {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('reviews') || '[]');
  }
  return [];
} 