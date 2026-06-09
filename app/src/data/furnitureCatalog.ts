import type { FurnitureCatalogItem } from '@/types';

export const furnitureCatalog: FurnitureCatalogItem[] = [
  {
    id: 'sofa-3seat',
    category: 'sofa',
    name: '3-Seat Sofa',
    basePrice: 120,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    description: 'Standard three-seat couch or sofa',
  },
  {
    id: 'sofa-sectional',
    category: 'sofa',
    name: 'Sectional Sofa',
    basePrice: 180,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=300&fit=crop',
    description: 'L-shaped or U-shaped sectional',
  },
  {
    id: 'sofa-loveseat',
    category: 'sofa',
    name: 'Loveseat',
    basePrice: 90,
    image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&h=300&fit=crop',
    description: 'Two-seat loveseat',
  },
  {
    id: 'bed-queen',
    category: 'bed',
    name: 'Queen Bed Frame',
    basePrice: 110,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop',
    description: 'Queen size bed frame',
  },
  {
    id: 'bed-king',
    category: 'bed',
    name: 'King Bed Frame',
    basePrice: 140,
    image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=400&h=300&fit=crop',
    description: 'King size bed frame',
  },
  {
    id: 'bed-twin',
    category: 'bed',
    name: 'Twin Bed Frame',
    basePrice: 80,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop',
    description: 'Twin or single bed frame',
  },
  {
    id: 'mattress-queen',
    category: 'mattress',
    name: 'Queen Mattress',
    basePrice: 85,
    image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=400&h=300&fit=crop',
    description: 'Queen size mattress',
  },
  {
    id: 'mattress-king',
    category: 'mattress',
    name: 'King Mattress',
    basePrice: 110,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop',
    description: 'King size mattress',
  },
  {
    id: 'dresser-standard',
    category: 'dresser',
    name: 'Standard Dresser',
    basePrice: 95,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
    description: '6-drawer dresser or chest',
  },
  {
    id: 'dresser-tall',
    category: 'dresser',
    name: 'Tall Chest',
    basePrice: 75,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
    description: 'Tallboy or high chest',
  },
  {
    id: 'table-dining',
    category: 'table',
    name: 'Dining Table',
    basePrice: 130,
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
    description: 'Dining room table',
  },
  {
    id: 'table-coffee',
    category: 'table',
    name: 'Coffee Table',
    basePrice: 60,
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=300&fit=crop',
    description: 'Coffee or end table',
  },
  {
    id: 'chair-recliner',
    category: 'chair',
    name: 'Recliner',
    basePrice: 85,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop',
    description: 'Reclining armchair',
  },
  {
    id: 'chair-dining',
    category: 'chair',
    name: 'Dining Chair (ea)',
    basePrice: 25,
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop',
    description: 'Per dining chair',
  },
  {
    id: 'entertainment-center',
    category: 'entertainment_center',
    name: 'Entertainment Center',
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1611486212557-88be5ff6f941?w=400&h=300&fit=crop',
    description: 'TV stand or entertainment wall unit',
  },
  {
    id: 'other',
    category: 'other',
    name: 'Other Item',
    basePrice: 75,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    description: 'Miscellaneous furniture item',
  },
];

export const removalMultiplier = 0.85; // removals cost 85% of delivery price
export const taxRate = 0.085; // 8.5% tax

export function getPriceForAction(basePrice: number, action: 'deliver' | 'remove'): number {
  return action === 'remove' ? Math.round(basePrice * removalMultiplier) : basePrice;
}
