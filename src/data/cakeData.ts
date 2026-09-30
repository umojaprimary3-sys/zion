import { CakeFlavor, CakeSize, CakeOccasion } from '../types';

export const CAKE_SIZES: CakeSize[] = [
  {
    id: 'size-1kg',
    name: 'Standard Celebration',
    weight: '1.0 Kg',
    servings: '6 – 8 slices',
    basePrice: 45000,
    basePriceDisplay: 'TZS 45,000',
    description: 'Perfect for family birthdays, intimate dinners, and house celebrations.',
  },
  {
    id: 'size-2kg',
    name: 'Medium Gathering',
    weight: '2.0 Kg',
    servings: '14 – 18 slices',
    basePrice: 85000,
    basePriceDisplay: 'TZS 85,000',
    description: 'Great for office parties, kids birthdays, and anniversary celebrations.',
  },
  {
    id: 'size-3kg',
    name: 'Large Grand Party',
    weight: '3.0 Kg',
    servings: '24 – 28 slices',
    basePrice: 125000,
    basePriceDisplay: 'TZS 125,000',
    description: 'Generous party centerpiece for large family reunions and milestones.',
  },
  {
    id: 'size-2tier',
    name: 'Two-Tier Luxury Edition',
    weight: '4.5+ Kg (2 Tiers)',
    servings: '35 – 45 slices',
    basePrice: 210000,
    basePriceDisplay: 'TZS 210,000',
    description: 'Stunning tiered structure designed for weddings, send-offs, and luxury events.',
  },
];

export const CAKE_FLAVORS: CakeFlavor[] = [
  {
    id: 'red-velvet',
    name: 'Royal Red Velvet',
    description: 'Moist crimson cocoa sponge with silken Madagascar cream cheese frosting.',
    accentColor: '#9e1c28',
    badge: 'Best Seller',
  },
  {
    id: 'belgian-chocolate',
    name: 'Triple Chocolate Fudge',
    description: 'Dark Belgian chocolate ganache layers with moist chocolate crumb.',
    accentColor: '#3a2016',
    badge: 'Popular',
  },
  {
    id: 'black-forest',
    name: 'Classic Black Forest',
    description: 'Dark cherry compote, kirsch syrup, chantilly cream, and chocolate flakes.',
    accentColor: '#4a1525',
    badge: 'Classic',
  },
  {
    id: 'madagascar-vanilla',
    name: 'Madagascar Vanilla Bean',
    description: 'Pure aromatic bourbon vanilla sponge with light whipped buttercream.',
    accentColor: '#e8b374',
  },
  {
    id: 'salted-caramel',
    name: 'Salted Caramel Crunch',
    description: 'Golden caramel sponge filled with slow-cooked sea salt caramel and praline.',
    accentColor: '#c87d32',
    badge: 'Chef Pick',
  },
  {
    id: 'strawberry-cream',
    name: 'Fresh Strawberry Cream',
    description: 'Fluffy sponge layered with fresh crushed strawberries and whipped cream.',
    accentColor: '#d64560',
  },
  {
    id: 'passion-fruit',
    name: 'Tropical Passion Fruit',
    description: 'Tangy local Tukuyu passion fruit curd between moist vanilla sponge.',
    accentColor: '#e2a15a',
    badge: 'Mbeya Local',
  },
  {
    id: 'lemon-blueberry',
    name: 'Zesty Lemon & Blueberry',
    description: 'Fresh lemon zest sponge packed with juicy blueberries and lemon glaze.',
    accentColor: '#6c5ce7',
  },
  {
    id: 'mocha-espresso',
    name: 'Mbeya Coffee Mocha',
    description: 'Infused with Southern Highlands freshly roasted arabica coffee and dark cocoa.',
    accentColor: '#533529',
  },
  {
    id: 'coconut-pineapple',
    name: 'Coconut Pina Colada',
    description: 'Toasted coconut flakes, roasted pineapple compote, and light rum essence.',
    accentColor: '#20bf6b',
  },
  {
    id: 'rainbow-funfetti',
    name: 'Rainbow Funfetti Carnival',
    description: 'Celebratory sprinkle-filled vanilla cake with joyful colorful layers.',
    accentColor: '#f5b400',
    badge: 'Kids Love It',
  },
  {
    id: 'white-choco-raspberry',
    name: 'White Chocolate Raspberry',
    description: 'Silky melted white chocolate buttercream with tart wild raspberry drizzle.',
    accentColor: '#b83b5e',
  },
];

export const CAKE_OCCASIONS: CakeOccasion[] = [
  { id: 'birthday', label: 'Birthday Celebration', icon: '🎂' },
  { id: 'wedding', label: 'Wedding / Send-off', icon: '💍' },
  { id: 'anniversary', label: 'Anniversary', icon: '❤️' },
  { id: 'graduation', label: 'Graduation Day', icon: '🎓' },
  { id: 'baby-shower', label: 'Baby Shower / Gender Reveal', icon: '🍼' },
  { id: 'custom', label: 'Corporate / Custom Event', icon: '🎉' },
];

export const CAKE_DECORATIONS = [
  { id: 'classic-piping', label: 'Classic Rosettes & Pearls', extra: 0, extraDisplay: 'Free' },
  { id: 'chocolate-drip', label: 'Rich Chocolate Ganache Drip', extra: 5000, extraDisplay: '+TZS 5,000' },
  { id: 'fresh-berries', label: 'Fresh Strawberries & Berries Crown', extra: 10000, extraDisplay: '+TZS 10,000' },
  { id: 'custom-topper', label: 'Acrylic Acrylic Name / Age Topper', extra: 8000, extraDisplay: '+TZS 8,000' },
];
