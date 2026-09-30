export type PageId = 'home' | 'menu' | 'custom-cakes' | 'about' | 'contact' | 'reviews';

export type MenuCategory = 
  | 'all'
  | 'cakes'
  | 'pizza-burgers'
  | 'chicken-shawarma'
  | 'cookies-bakes'
  | 'juice-drinks';

export interface MenuItem {
  id: string;
  name: string;
  category: 'cakes' | 'pizza-burgers' | 'chicken-shawarma' | 'cookies-bakes' | 'juice-drinks';
  description: string;
  price: number; // in TZS
  priceDisplay: string;
  image: string;
  popular?: boolean;
  dietary?: string[];
  serves?: string;
  prepTime?: string;
}

export interface CakeSize {
  id: string;
  name: string;
  weight: string;
  servings: string;
  basePrice: number;
  basePriceDisplay: string;
  description: string;
}

export interface CakeFlavor {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  badge?: string;
}

export interface CakeOccasion {
  id: string;
  label: string;
  icon: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  occasion?: string;
  verified: boolean;
}

export interface DeliveryZone {
  name: string;
  estimate: string;
  fee: string;
  coverage: string;
}
