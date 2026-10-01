import { useState, useEffect } from 'react';

export interface MenuCat {
  id: string;
  label: string;
  icon: string;
}

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  serves?: string;
  prepTime?: string;
}

export interface CakeSizeData {
  name: string;
  weight: string;
  servings: string;
  price: number;
  description: string;
}

export interface CakeFlavorData {
  name: string;
  description: string;
  color: string;
  badge?: string;
  ingredients: string[];
}

export interface CakeOccasionData {
  label: string;
  icon: string;
}

export interface CakeDecorationData {
  label: string;
  extra: number;
}

export interface CakeAddonData {
  label: string;
  extra: number;
}

export interface GalleryItemData {
  src: string;
  title: string;
  tag: string;
}

export interface ReviewRecord {
  id?: string;
  author: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
  occasion?: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'hidden';
  reply?: string;
  featured?: boolean;
}

export interface HourItemData {
  days: string;
  hours: string;
  status: string;
}

export interface ZoneItemData {
  name: string;
  estimate: string;
  fee: string;
  coverage: string;
}

export interface FaqItemData {
  q: string;
  a: string;
}

export interface BizData {
  name: string;
  footer: string;
  address1: string;
  address2: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  igUrl: string;
  mapUrl: string;
  dirUrl: string;
  rating: string;
  reviewsCount: string;
  followers: string;
}

export interface BannerData {
  eyebrow: string;
  title: string;
  text: string;
}

export interface ServeCardData {
  icon: string;
  image: string;
  title: string;
  text: string;
}

export interface StatItemData {
  t: string;
  s: string;
}

export interface SimpleCardData {
  title: string;
  text: string;
}

export interface HomeData {
  hero: {
    title: string;
    text: string;
    image: string;
  };
  rating: {
    title: string;
    text: string;
    score: string;
    label: string;
  };
  sig: {
    title: string;
    location: string;
    text: string;
    m0: string;
    m1: string;
    m2: string;
  };
  stats: StatItemData[];
  serves: {
    title: string;
    sub: string;
    cards: ServeCardData[];
  };
  test: {
    title: string;
    sub: string;
    p0i: string;
    p0l: string;
    p1i: string;
    p1l: string;
  };
  moment: {
    title: string;
    sub: string;
    image: string;
    cards: SimpleCardData[];
  };
  reasons: {
    title: string;
    cards: SimpleCardData[];
  };
  aboutPhoto: string;
}

export interface MemberRecord {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  joined: string;
  birthday: string;
  consent: boolean;
  status: 'active' | 'paused' | 'blocked';
  notes: string;
}

export interface OrderRecord {
  id: string;
  user_id?: string;
  member_id?: string;
  type: 'delivery' | 'pickup' | 'cake';
  status: 'new' | 'confirmed' | 'preparing' | 'ready' | 'out' | 'done' | 'cancelled';
  name: string;
  phone: string;
  email: string;
  zone: string;
  items: string;
  total: number;
  pay: 'unpaid' | 'deposit' | 'paid';
  date: string;
  notes: string;
  src: string;
}

export interface InquiryRecord {
  name: string;
  phone: string;
  email: string;
  type: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
}

export interface SentEmailRecord {
  date: string;
  subject: string;
  count: number;
  status: string;
  body: string;
}

export interface DraftRecord {
  aud: string;
  to: string;
  subj: string;
  body: string;
}

export interface ConfigRecord {
  api: string;
  prefix: string;
  fromName: string;
  from: string;
  notify: string;
}

export interface PageContentData {
  orderBtn: string;
  nav: Array<{ label: string; desc: string }>;
  footer: {
    tag: string;
    line: string;
  };
  about: {
    eyebrow: string;
    title: string;
    lead: string;
    body: string;
    metrics: Array<{ n: string; l: string }>;
  };
  contact: {
    cards: Array<{ icon: string; title: string; text: string }>;
    zonesTitle: string;
    zonesText: string;
    formTitle: string;
    formText: string;
    types: string[];
  };
  rform: {
    title: string;
    text: string;
    btn: string;
  };
  order: {
    title: string;
    text: string;
    btn: string;
  };
}

export interface StoreData {
  cats: MenuCat[];
  menu: MenuItemData[];
  sizes: CakeSizeData[];
  flavors: CakeFlavorData[];
  occ: CakeOccasionData[];
  decos: CakeDecorationData[];
  addons: CakeAddonData[];
  gallery: GalleryItemData[];
  reviews: ReviewRecord[];
  hours: HourItemData[];
  zones: ZoneItemData[];
  faq: FaqItemData[];
  biz: BizData;
  banners: {
    menu: BannerData;
    cake: BannerData;
    about: BannerData;
    contact: BannerData;
    reviews: BannerData;
  };
  home: HomeData;
  members: MemberRecord[];
  orders: OrderRecord[];
  inbox: InquiryRecord[];
  mail: SentEmailRecord[];
  draft: DraftRecord;
  cfg: ConfigRecord;
  pg: PageContentData;
}

export const DEFAULT_STORE: StoreData = {
  cats: [
    { id: 'cakes', label: 'Cakes & Slices', icon: '🍰' },
    { id: 'pizza-burgers', label: 'Pizza & Burgers', icon: '🍕' },
    { id: 'chicken-shawarma', label: 'Shawarma & Chicken', icon: '🍗' },
    { id: 'cookies-bakes', label: 'Cookies & Bakes', icon: '🍪' },
    { id: 'juice-drinks', label: 'Juice & Drinks', icon: '🥤' }
  ],
  menu: [
    {
      id: 'cake-signature-velvet',
      name: 'Royal Red Velvet Cake Slice',
      category: 'cakes',
      description: 'Moist crimson velvet sponge layered with smooth Madagascar cream cheese frosting.',
      price: 8000,
      image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 slice',
      prepTime: 'Instant / Ready to serve'
    },
    {
      id: 'cake-black-forest',
      name: 'Classic Black Forest Gateau',
      category: 'cakes',
      description: 'Fluffy dark cocoa sponge soaked in cherry syrup with whipped cream & dark chocolate shavings.',
      price: 9000,
      image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 slice / Whole available',
      prepTime: ''
    },
    {
      id: 'cake-chocolate-fudge',
      name: 'Belgian Triple Chocolate Fudge',
      category: 'cakes',
      description: 'Decadent melted Belgian chocolate ganache over rich chocolate cake layers.',
      price: 9500,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 slice',
      prepTime: ''
    },
    {
      id: 'cake-passion-fruit',
      name: 'Zion Passion Fruit Vanilla Sponge',
      category: 'cakes',
      description: 'Light vanilla bean sponge infused with fresh local Tukuyu passion fruit curd.',
      price: 7500,
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '1 slice',
      prepTime: ''
    },
    {
      id: 'cake-whole-celebration-1kg',
      name: 'Custom Celebration Cake (1 Kg)',
      category: 'cakes',
      description: 'Freshly baked made-to-order cake with your choice of flavor, piped wording, and candles.',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '6 – 8 guests',
      prepTime: '2 hrs / Preorder'
    },
    {
      id: 'pizza-zion-supreme',
      name: 'Zion Supreme Meat & Veg Pizza (Large)',
      category: 'pizza-burgers',
      description: 'Hand-stretched dough topped with seasoned beef, spicy pepperoni, sweet bell peppers, onions, and melted mozzarella.',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '2 – 3 people',
      prepTime: '20 mins'
    },
    {
      id: 'pizza-bbq-chicken',
      name: 'Smoky BBQ Chicken Pizza (Medium / Large)',
      category: 'pizza-burgers',
      description: 'Tender marinated grilled chicken breast, smoky barbecue glaze, sweet corn, and double mozzarella cheese.',
      price: 22000,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '2 people',
      prepTime: '20 mins'
    },
    {
      id: 'pizza-margherita',
      name: 'Classic Margherita Pizza',
      category: 'pizza-burgers',
      description: 'Herb-infused tomato passata, fresh basil leaves, extra virgin olive oil, and creamy mozzarella.',
      price: 18000,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '1 – 2 people',
      prepTime: '15 mins'
    },
    {
      id: 'burger-zion-double-beef',
      name: 'Zion Double Gourmet Beef Burger',
      category: 'pizza-burgers',
      description: 'Two flame-grilled beef patties, melted cheddar, caramelized onions, crisp lettuce, and Zion secret relish in a toasted brioche bun.',
      price: 16000,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: 'Served with spiced chips',
      prepTime: '15 mins'
    },
    {
      id: 'burger-crispy-chicken',
      name: 'Crunchy Southern Fried Chicken Burger',
      category: 'pizza-burgers',
      description: 'Golden buttermilk fried chicken fillet, creamy coleslaw, sweet pickles, and garlic herb mayo.',
      price: 14000,
      image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: 'Served with chips',
      prepTime: '15 mins'
    },
    {
      id: 'shawarma-special-chicken',
      name: 'Zion Arabic Spiced Chicken Shawarma',
      category: 'chicken-shawarma',
      description: 'Slow-roasted spit chicken shaved thin, garlic toum sauce, crunchy fries, tahini drizzle, wrapped in fresh flatbread.',
      price: 10000,
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 hearty wrap',
      prepTime: '10 mins'
    },
    {
      id: 'shawarma-beef-cheese',
      name: 'Loaded Beef & Cheddar Shawarma',
      category: 'chicken-shawarma',
      description: 'Char-seared shredded beef steak, melting cheese blend, onions, sumac, parsley, and Zion hot sauce.',
      price: 12000,
      image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 wrap',
      prepTime: '10 mins'
    },
    {
      id: 'chicken-half-flame-grilled',
      name: 'Half Flame-Grilled Chicken Platter',
      category: 'chicken-shawarma',
      description: 'Marinated in Swahili herbs and flame-grilled to tender perfection. Served with seasoned potato chips and kachumbari salad.',
      price: 20000,
      image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 – 2 people',
      prepTime: '20 mins'
    },
    {
      id: 'chicken-crispy-strips',
      name: 'Golden Chicken Tenders & Chips Basket',
      category: 'chicken-shawarma',
      description: 'Hand-breaded juicy chicken breast tenders served with signature honey mustard and garlic dip.',
      price: 13000,
      image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '1 person',
      prepTime: '12 mins'
    },
    {
      id: 'cookie-chocolate-chunk',
      name: 'Jumbo Chocolate Chip Cookies (Pack of 3)',
      category: 'cookies-bakes',
      description: 'Crispy edges with gooey, melted dark & milk chocolate chunks in every single bite.',
      price: 6000,
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '3 jumbo cookies',
      prepTime: ''
    },
    {
      id: 'bake-butter-croissant',
      name: 'Flaky French Butter Croissant',
      category: 'cookies-bakes',
      description: 'Traditional laminated pastry dough baked golden brown with pure dairy butter.',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '1 pastry',
      prepTime: ''
    },
    {
      id: 'bake-cinnamon-rolls',
      name: 'Warm Iced Cinnamon Swirl Roll',
      category: 'cookies-bakes',
      description: 'Soft pillowy dough swirled with aromatic cinnamon brown sugar and smothered in cream cheese glaze.',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 large roll',
      prepTime: ''
    },
    {
      id: 'bake-meat-pie-samosa',
      name: 'Zion Spiced Beef Samosas (3 pcs)',
      category: 'cookies-bakes',
      description: 'Crisp pastry triangles packed with lightly spiced minced beef, coriander, and sweet onions.',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '3 pieces',
      prepTime: ''
    },
    {
      id: 'drink-passion-mango-juice',
      name: 'Fresh Mango & Passion Fruit Cold Pressed Juice',
      category: 'juice-drinks',
      description: '100% pure fresh fruit pulp from Rungwe & Mbeya orchards, chilled with no added preservatives.',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '500ml bottle',
      prepTime: ''
    },
    {
      id: 'drink-iced-caramel-latte',
      name: 'Iced Caramel Coffee Frappé',
      category: 'juice-drinks',
      description: 'Locally roasted Southern Highlands espresso, cold fresh milk, caramel swirl, topped with whipped cream.',
      price: 7000,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop',
      popular: true,
      serves: '1 tall glass',
      prepTime: ''
    },
    {
      id: 'drink-hibiscus-ginger',
      name: 'Chilled Hibiscus & Fresh Ginger Cooler',
      category: 'juice-drinks',
      description: 'Traditional Roselle (Karkadeh) infused with spicy crushed ginger, fresh mint, and lime.',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '500ml bottle',
      prepTime: ''
    },
    {
      id: 'drink-strawberry-milkshake',
      name: 'Velvety Strawberry & Vanilla Thickshake',
      category: 'juice-drinks',
      description: 'Real strawberries blended with rich vanilla bean gelato and whole farm milk.',
      price: 8000,
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
      popular: false,
      serves: '1 glass',
      prepTime: ''
    }
  ],
  sizes: [
    {
      name: 'Standard Celebration',
      weight: '1.0 Kg',
      servings: '6 – 8 slices',
      price: 45000,
      description: 'Perfect for family birthdays, intimate dinners, and house celebrations.'
    },
    {
      name: 'Medium Gathering',
      weight: '2.0 Kg',
      servings: '14 – 18 slices',
      price: 85000,
      description: 'Great for office parties, kids birthdays, and anniversary celebrations.'
    },
    {
      name: 'Large Grand Party',
      weight: '3.0 Kg',
      servings: '24 – 28 slices',
      price: 125000,
      description: 'Generous party centerpiece for large family reunions and milestones.'
    },
    {
      name: 'Two-Tier Luxury Edition',
      weight: '4.5+ Kg (2 Tiers)',
      servings: '35 – 45 slices',
      price: 210000,
      description: 'Stunning tiered structure designed for weddings, send-offs, and luxury events.'
    }
  ],
  flavors: [
    {
      name: 'Royal Red Velvet',
      description: 'Moist crimson cocoa sponge with silken Madagascar cream cheese frosting.',
      color: '#9e1c28',
      badge: 'Best Seller',
      ingredients: ['Cocoa sponge', 'Cream cheese frosting']
    },
    {
      name: 'Triple Chocolate Fudge',
      description: 'Dark Belgian chocolate ganache layers with moist chocolate crumb.',
      color: '#3a2016',
      badge: 'Popular',
      ingredients: ['Belgian chocolate', 'Chocolate ganache']
    },
    {
      name: 'Classic Black Forest',
      description: 'Dark cherry compote, kirsch syrup, chantilly cream, and chocolate flakes.',
      color: '#4a1525',
      badge: 'Classic',
      ingredients: ['Cherry compote', 'Kirsch syrup', 'Chantilly cream', 'Chocolate flakes']
    },
    {
      name: 'Madagascar Vanilla Bean',
      description: 'Pure aromatic bourbon vanilla sponge with light whipped buttercream.',
      color: '#e8b374',
      badge: '',
      ingredients: ['Bourbon vanilla', 'Whipped buttercream']
    },
    {
      name: 'Salted Caramel Crunch',
      description: 'Golden caramel sponge filled with slow-cooked sea salt caramel and praline.',
      color: '#c87d32',
      badge: 'Chef Pick',
      ingredients: ['Sea salt caramel', 'Praline']
    },
    {
      name: 'Fresh Strawberry Cream',
      description: 'Fluffy sponge layered with fresh crushed strawberries and whipped cream.',
      color: '#d64560',
      badge: '',
      ingredients: ['Fresh strawberries', 'Whipped cream']
    },
    {
      name: 'Tropical Passion Fruit',
      description: 'Tangy local Tukuyu passion fruit curd between moist vanilla sponge.',
      color: '#e2a15a',
      badge: 'Mbeya Local',
      ingredients: ['Tukuyu passion fruit curd', 'Vanilla sponge']
    },
    {
      name: 'Zesty Lemon & Blueberry',
      description: 'Fresh lemon zest sponge packed with juicy blueberries and lemon glaze.',
      color: '#6c5ce7',
      badge: '',
      ingredients: ['Lemon zest', 'Blueberries', 'Lemon glaze']
    },
    {
      name: 'Mbeya Coffee Mocha',
      description: 'Infused with Southern Highlands freshly roasted arabica coffee and dark cocoa.',
      color: '#533529',
      badge: '',
      ingredients: ['Arabica coffee', 'Dark cocoa']
    },
    {
      name: 'Coconut Pina Colada',
      description: 'Toasted coconut flakes, roasted pineapple compote, and light rum essence.',
      color: '#20bf6b',
      badge: '',
      ingredients: ['Toasted coconut', 'Pineapple compote']
    },
    {
      name: 'Rainbow Funfetti Carnival',
      description: 'Celebratory sprinkle-filled vanilla cake with joyful colorful layers.',
      color: '#f5b400',
      badge: 'Kids Love It',
      ingredients: ['Sprinkles', 'Vanilla sponge']
    },
    {
      name: 'White Chocolate Raspberry',
      description: 'Silky melted white chocolate buttercream with tart wild raspberry drizzle.',
      color: '#b83b5e',
      badge: '',
      ingredients: ['White chocolate buttercream', 'Wild raspberry drizzle']
    }
  ],
  occ: [
    { label: 'Birthday Celebration', icon: '🎂' },
    { label: 'Wedding / Send-off', icon: '💍' },
    { label: 'Anniversary', icon: '❤️' },
    { label: 'Graduation Day', icon: '🎓' },
    { label: 'Baby Shower / Gender Reveal', icon: '🍼' },
    { label: 'Corporate / Custom Event', icon: '🎉' }
  ],
  decos: [
    { label: 'Classic Rosettes & Pearls', extra: 0 },
    { label: 'Rich Chocolate Ganache Drip', extra: 5000 },
    { label: 'Fresh Strawberries & Berries Crown', extra: 10000 },
    { label: 'Acrylic Name / Age Topper', extra: 8000 }
  ],
  addons: [
    { label: 'Birthday candle pack', extra: 2000 },
    { label: 'Sparkler candles', extra: 3000 },
    { label: 'Gift box & ribbon', extra: 5000 }
  ],
  gallery: [
    {
      src: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000&auto=format&fit=crop',
      title: 'Custom Birthday Masterpiece',
      tag: 'Custom Cakes'
    },
    {
      src: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
      title: 'Freshly Baked Chocolate Fudge',
      tag: 'In the Kitchen'
    },
    {
      src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop',
      title: 'Woodfire Crust Supreme Pizza',
      tag: 'Savoury Bites'
    },
    {
      src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1000&auto=format&fit=crop',
      title: 'Warm Zion Café Ambience',
      tag: 'Dine-In Vibe'
    },
    {
      src: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop',
      title: 'Jumbo Chocolate Chip Bakes',
      tag: 'Fresh Bakes'
    },
    {
      src: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=1000&auto=format&fit=crop',
      title: 'Flame-Grilled Half Chicken',
      tag: 'Hearty Meals'
    }
  ],
  reviews: [
    {
      author: 'Rehema T.',
      location: 'Uyole, Mbeya',
      rating: 4,
      comment: 'Lovely cake and friendly staff. Delivery was a little late but the taste made up for it.',
      date: 'Today',
      occasion: 'Anniversary',
      verified: false,
      status: 'pending',
      reply: '',
      featured: false
    },
    {
      author: 'Peter L.',
      location: 'Iyunga, Mbeya',
      rating: 5,
      comment: 'Best chicken shawarma in Mbeya, hands down!',
      date: 'Yesterday',
      occasion: 'Lunch',
      verified: false,
      status: 'pending',
      reply: '',
      featured: false
    },
    {
      author: 'Anna M.',
      location: 'Forest Area, Mbeya',
      rating: 5,
      comment: 'The birthday cake was beautiful and tasted even better. Zion made our celebration feel so special! The red velvet was moist and not overly sweet.',
      date: '3 days ago',
      occasion: 'Birthday Celebration',
      verified: true,
      status: 'approved',
      reply: '',
      featured: true
    },
    {
      author: 'Joseph K.',
      location: 'Mwanjelwa, Mbeya',
      rating: 5,
      comment: 'Fresh pizza, friendly service, and quick pickup. This is my go-to spot in Mbeya whenever craving real cheese and thick meat toppings.',
      date: '1 week ago',
      occasion: 'Dinner with Friends',
      verified: true,
      status: 'approved',
      reply: '',
      featured: true
    },
    {
      author: 'Neema R.',
      location: 'Soweto, Mbeya',
      rating: 5,
      comment: 'I ordered fresh juice and chicken shawarma for the entire office — everything arrived fresh, warm, and neatly packed. Super fast delivery!',
      date: '2 weeks ago',
      occasion: 'Office Lunch Delivery',
      verified: true,
      status: 'approved',
      reply: '',
      featured: true
    },
    {
      author: 'Baraka Mwambene',
      location: 'Njia Panda, Mbeya',
      rating: 5,
      comment: 'Best ambience in the city for weekend relaxation. The Wi-Fi is reliable, the iced caramel coffee is fantastic, and the acoustics with gentle music are perfect.',
      date: '3 weeks ago',
      occasion: 'Weekend Hangout',
      verified: true,
      status: 'approved',
      reply: '',
      featured: false
    },
    {
      author: 'Grace Sanga',
      location: 'Uyole, Mbeya',
      rating: 5,
      comment: 'Ordered a 2-tier send-off cake last month. Guests could not stop complimenting the chocolate fudge and passion fruit tiers. Zion exceeded our expectations.',
      date: '1 month ago',
      occasion: 'Wedding Send-off',
      verified: true,
      status: 'approved',
      reply: '',
      featured: false
    },
    {
      author: 'David L.',
      location: 'Iyunga, Mbeya',
      rating: 5,
      comment: 'Their southern fried chicken burger and jumbo cookies are on another level. Very clean kitchen and friendly staff at the counter.',
      date: '1 month ago',
      occasion: 'Family Dinner',
      verified: true,
      status: 'approved',
      reply: '',
      featured: false
    }
  ],
  hours: [
    { days: 'Monday – Thursday', hours: '07:30 AM – 10:00 PM', status: 'Open Daily' },
    { days: 'Friday – Saturday', hours: '07:30 AM – 11:00 PM', status: 'Weekend Music & Late Bites' },
    { days: 'Sunday', hours: '08:00 AM – 10:00 PM', status: 'Family Day & Brunch' }
  ],
  zones: [
    {
      name: 'Njia Panda & Hospitali Zone',
      estimate: '15 – 25 mins',
      fee: 'TZS 1,500 / Free over 30k',
      coverage: 'Hospital Grounds, Isanga, Meta, Mzinga'
    },
    {
      name: 'Mwanjelwa & Soweto Hub',
      estimate: '20 – 30 mins',
      fee: 'TZS 2,500',
      coverage: 'Mwanjelwa Central, Soweto Market, Block T'
    },
    {
      name: 'Forest & Jacaranda Area',
      estimate: '25 – 35 mins',
      fee: 'TZS 3,000',
      coverage: 'Forest Old/New, Mbeya Peak View, Jacaranda'
    },
    {
      name: 'Uyole & Iyunga Ward',
      estimate: '30 – 45 mins',
      fee: 'TZS 4,000',
      coverage: 'Uyole Junction, Iyunga Technical, MUST Uni Route'
    },
    {
      name: 'Nzovwe, Ilomba & Mbalizi Road',
      estimate: '35 – 50 mins',
      fee: 'TZS 4,500',
      coverage: 'Nzovwe Center, Ilomba, Airport Road up to Mbalizi'
    }
  ],
  faq: [
    {
      q: 'Do you offer delivery across Mbeya?',
      a: 'Yes! We deliver freshly prepared cakes, meals, pizzas, and drinks across Mbeya City including Njia Panda, Mwanjelwa, Soweto, Forest, Uyole, Nzovwe, and Iyunga. Delivery takes approximately 20 to 45 minutes.'
    },
    {
      q: 'How much notice is needed to preorder a custom cake?',
      a: 'For standard 1kg–2kg single-tier custom celebration cakes, we can often accommodate same-day orders with 3–4 hours notice. For tiered wedding, send-off, or intricate themed fondant designs, we recommend placing your order 24–48 hours in advance.'
    },
    {
      q: 'Do you have seating and Wi-Fi for dine-in?',
      a: 'Yes, Zion features comfortable air-conditioned and terrace seating with complimentary high-speed guest Wi-Fi, ambient background music on weekends, and power outlets suitable for working lunches or friendly catch-ups.'
    },
    {
      q: 'How do I pay for my delivery or pickup order?',
      a: 'We accept M-Pesa, Tigo Pesa, Airtel Money, Halopesa, direct bank transfers (NMB / CRDB), and cash on pickup or delivery.'
    },
    {
      q: 'Can you write a custom message on my cake?',
      a: 'Yes! We provide complimentary custom chocolate plaque or buttercream script lettering on all whole cakes (e.g., "Happy 25th Birthday Baraka!" or "Congratulations Dr. Neema!").'
    }
  ],
  biz: {
    name: 'Zion Cakes & Bites',
    footer: 'Freshly made in Mbeya, for every moment worth sharing.',
    address1: 'Forest Mpya, Maghorofani',
    address2: 'Mbeya City, Tanzania',
    phone: '+255 768 000 111 / +255 689 123 456',
    whatsapp: '255768000111',
    email: 'orders@zioncakesmbeya.com',
    instagram: '@zioncakesmbeya',
    igUrl: 'https://instagram.com/zioncakesmbeya',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Zion+Bakery+Forest+Mpya+Maghorofani+Mbeya+Tanzania',
    dirUrl: 'https://www.google.com/maps/dir/?api=1&destination=Zion+Bakery+Forest+Mpya+Maghorofani+Mbeya+Tanzania',
    rating: '4.1',
    reviewsCount: '87 Google Reviews',
    followers: '6,896+'
  },
  banners: {
    menu: {
      eyebrow: 'FRESHLY BAKED & COOKED IN MBEYA',
      title: 'Our Full Menu',
      text: 'Handcrafted celebration cakes, oven-baked pizza, sizzling shawarma, hearty chicken, fresh cookies, and cold-pressed juices.'
    },
    cake: {
      eyebrow: 'HANDMADE CELEBRATION CAKES · MBEYA',
      title: 'Custom Cake Studio',
      text: 'Design your dream celebration cake in 5 simple steps. Select from 12 gourmet flavors, 4 party sizes, bespoke toppings, and custom inscriptions.'
    },
    about: {
      eyebrow: 'OUR STORY & PHYSICAL LOCATION',
      title: 'About Zion Cakes & Bites',
      text: 'Founded in the heart of Mbeya, dedicated to elevating everyday dining, family celebrations, and artisan baking.'
    },
    contact: {
      eyebrow: 'REACH OUT & CITYWIDE DELIVERY',
      title: 'Contact & Delivery',
      text: 'Order via WhatsApp for rapid dispatch, inquire about event catering, or ask our bakery team about delivery to your area in Mbeya.'
    },
    reviews: {
      eyebrow: 'TESTIMONIALS & MOMENTS',
      title: 'What Mbeya Is Saying',
      text: 'Real stories from birthday celebrations, office lunches, and weekend gatherings with Zion Cakes & Bites.'
    }
  },
  home: {
    hero: {
      title: 'Freshly Made,\nMade For You',
      text: 'Cakes, pizza, shawarma, chicken and more — baked and cooked fresh daily in Mbeya, ready for dine-in, pickup, or delivery.',
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1400&auto=format&fit=crop'
    },
    rating: {
      title: 'Loved By Mbeya',
      text: 'Trusted by hundreds of happy customers across the city.',
      score: '4.1★',
      label: '87 Google Reviews'
    },
    sig: {
      title: 'Signature Celebration Cake',
      location: 'Njia Panda ya Hospitali, Mbeya',
      text: 'Custom flavors, fillings and decorations for birthdays, weddings and special occasions.',
      m0: 'Fresh daily',
      m1: '4 sizes',
      m2: '12 flavors'
    },
    stats: [
      { t: '4.1/5', s: 'Google Rating (87 reviews)' },
      { t: '6,896+', s: 'Instagram Followers' },
      { t: 'Fresh Daily', s: 'Made-to-order' }
    ],
    serves: {
      title: 'Everything Zion Serves You',
      sub: 'From everyday meals to custom celebration cakes — dine in, drive through, or get it delivered.',
      cards: [
        {
          icon: '🍰',
          image: 'https://images.unsplash.com/photo-1602351447937-745cb720612f?q=80&w=800&auto=format&fit=crop',
          title: 'Cakes & Custom Orders',
          text: 'Birthday, wedding, and celebration cakes — choose flavor, size, and decoration.'
        },
        {
          icon: '🍕',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
          title: 'Pizza, Burgers & Shawarma',
          text: 'Everyday favorites made fresh, from lunch to late-night cravings.'
        },
        {
          icon: '🍪',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop',
          title: 'Cookies & Bakes',
          text: 'Freshly baked daily, perfect for gifting or snacking.'
        },
        {
          icon: '🍗',
          image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800&auto=format&fit=crop',
          title: 'Chicken & Mains',
          text: 'Hearty meals for lunch, dinner, or family outings.'
        },
        {
          icon: '🥤',
          image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800&auto=format&fit=crop',
          title: 'Juice & Drinks',
          text: 'Fresh juice to pair with any meal.'
        },
        {
          icon: '📦',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
          title: 'Dine-in, Drive-through & Delivery',
          text: 'However you want it — we bring the food to you.'
        }
      ]
    },
    test: {
      title: 'What Mbeya Is Saying',
      sub: 'A few kind words from our customers.',
      p0i: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000&auto=format&fit=crop',
      p0l: 'Customer stories & gallery',
      p1i: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop',
      p1l: 'Fresh in the kitchen'
    },
    moment: {
      title: "More Than A Meal, It's A Moment",
      sub: 'Settle in for good food, easy conversations, and the little extras that make Zion feel like your place in Mbeya.',
      image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop',
      cards: [
        {
          title: 'Weekend Music',
          text: 'Easy live sounds and good company for a slower weekend.'
        },
        {
          title: 'Comfortable Wi-Fi',
          text: 'A relaxed corner for work, catch-ups, and everything in between.'
        },
        {
          title: 'Warm Ambience',
          text: 'Thoughtful spaces for dates, family time, and celebrations.'
        }
      ]
    },
    reasons: {
      title: 'Little Reasons To Stop By',
      cards: [
        {
          title: 'Weekday Lunch',
          text: 'Fresh favorites for your midday break.'
        },
        {
          title: 'Cake Preorders',
          text: 'Plan your celebration early with Zion.'
        },
        {
          title: 'Weekend Treats',
          text: 'Good food, music, and room to unwind.'
        }
      ]
    },
    aboutPhoto: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1000&auto=format&fit=crop'
  },
  members: [
    {
      id: 'u1',
      name: 'Anna Mwambene',
      phone: '0768 111 222',
      email: 'anna@example.com',
      area: 'Forest',
      joined: '2026-02-02',
      birthday: '10-14',
      consent: true,
      status: 'active',
      notes: 'Loves red velvet. Orders every birthday.'
    },
    {
      id: 'u2',
      name: 'Joseph Kilonzo',
      phone: '0755 333 444',
      email: 'joseph@example.com',
      area: 'Mwanjelwa',
      joined: '2026-05-03',
      birthday: '03-02',
      consent: true,
      status: 'active',
      notes: 'Pizza regular.'
    },
    {
      id: 'u3',
      name: 'Neema Rashid',
      phone: '0713 555 666',
      email: 'neema@example.com',
      area: 'Soweto',
      joined: '2026-07-02',
      birthday: '09-21',
      consent: true,
      status: 'active',
      notes: 'Office lunch orders.'
    },
    {
      id: 'u4',
      name: 'Baraka Mwambene',
      phone: '0689 777 888',
      email: 'baraka@example.com',
      area: 'Njia Panda',
      joined: '2026-08-01',
      birthday: '',
      consent: false,
      status: 'active',
      notes: ''
    },
    {
      id: 'u5',
      name: 'Grace Sanga',
      phone: '0762 999 000',
      email: 'grace@example.com',
      area: 'Uyole',
      joined: '2026-08-31',
      birthday: '09-30',
      consent: true,
      status: 'active',
      notes: '2-tier send-off cake.'
    }
  ],
  orders: [
    {
      id: 'ZN-1048',
      type: 'delivery',
      status: 'new',
      name: 'Anna Mwambene',
      phone: '0768 111 222',
      email: 'anna@example.com',
      zone: 'Forest & Jacaranda Area',
      items: '2x Zion Supreme Meat & Veg Pizza (Large)\n1x Fresh Mango & Passion Fruit Juice',
      total: 55000,
      pay: 'unpaid',
      date: '2026-09-30',
      notes: 'Call at the gate.',
      src: 'Website order pop-up'
    },
    {
      id: 'ZN-1047',
      type: 'cake',
      status: 'confirmed',
      name: 'Grace Sanga',
      phone: '0762 999 000',
      email: 'grace@example.com',
      zone: 'Uyole & Iyunga Ward',
      items: 'Custom cake · Royal Red Velvet · 2.0 Kg · Birthday\nMessage: "Happy 30th Baraka!"\nDecoration: Chocolate ganache drip',
      total: 90000,
      pay: 'deposit',
      date: '2026-09-30',
      notes: 'Gold and pink theme.',
      src: 'Custom Cake Studio'
    },
    {
      id: 'ZN-1046',
      type: 'pickup',
      status: 'preparing',
      name: 'Joseph Kilonzo',
      phone: '0755 333 444',
      email: 'joseph@example.com',
      zone: '—',
      items: '1x Classic Margherita Pizza\n2x Crunchy Southern Fried Chicken Burger',
      total: 46000,
      pay: 'paid',
      date: '2026-09-29',
      notes: '',
      src: 'Website order pop-up'
    },
    {
      id: 'ZN-1045',
      type: 'delivery',
      status: 'out',
      name: 'Neema Rashid',
      phone: '0713 555 666',
      email: 'neema@example.com',
      zone: 'Mwanjelwa & Soweto Hub',
      items: '6x Zion Arabic Spiced Chicken Shawarma\n6x Chilled Hibiscus Cooler',
      total: 87000,
      pay: 'paid',
      date: '2026-09-29',
      notes: 'Office lunch, 1pm.',
      src: 'Website order pop-up'
    },
    {
      id: 'ZN-1044',
      type: 'cake',
      status: 'done',
      name: 'Baraka Mwambene',
      phone: '0689 777 888',
      email: 'baraka@example.com',
      zone: '—',
      items: 'Custom cake · Triple Chocolate Fudge · 1.0 Kg · Anniversary',
      total: 50000,
      pay: 'paid',
      date: '2026-09-28',
      notes: '',
      src: 'Custom Cake Studio'
    },
    {
      id: 'ZN-1043',
      type: 'delivery',
      status: 'done',
      name: 'Anna Mwambene',
      phone: '0768 111 222',
      email: 'anna@example.com',
      zone: 'Forest & Jacaranda Area',
      items: '1x Half Flame-Grilled Chicken Platter',
      total: 23000,
      pay: 'paid',
      date: '2026-09-27',
      notes: '',
      src: 'Website order pop-up'
    },
    {
      id: 'ZN-1042',
      type: 'pickup',
      status: 'done',
      name: 'Neema Rashid',
      phone: '0713 555 666',
      email: 'neema@example.com',
      zone: '—',
      items: '12x Jumbo Chocolate Chip Cookies (Pack of 3)',
      total: 72000,
      pay: 'paid',
      date: '2026-09-26',
      notes: '',
      src: 'Phone call (added by admin)'
    },
    {
      id: 'ZN-1041',
      type: 'delivery',
      status: 'cancelled',
      name: 'Peter Lukas',
      phone: '0654 121 212',
      email: '',
      zone: 'Nzovwe, Ilomba & Mbalizi Road',
      items: '1x Smoky BBQ Chicken Pizza',
      total: 26500,
      pay: 'unpaid',
      date: '2026-09-25',
      notes: 'Customer cancelled.',
      src: 'Website order pop-up'
    }
  ],
  inbox: [
    {
      name: 'Rehema Tarimo',
      phone: '0744 200 300',
      email: 'rehema@example.com',
      type: 'Event Catering',
      message: 'We are planning a wedding send-off for 80 guests on 14 November. Can you cater snacks and a 3-tier cake?',
      date: '2026-09-30',
      status: 'unread'
    },
    {
      name: 'Hassan Mushi',
      phone: '0713 400 500',
      email: 'hassan@example.com',
      type: 'Daily Food Delivery',
      message: 'Do you deliver to Iyunga after 9pm on weekends?',
      date: '2026-09-29',
      status: 'unread'
    },
    {
      name: 'Esther Mwakyusa',
      phone: '0765 600 700',
      email: 'esther@example.com',
      type: 'Cake Preorder',
      message: 'Can I get a cake without eggs for my daughter?',
      date: '2026-09-27',
      status: 'replied'
    }
  ],
  mail: [],
  draft: {
    aud: 'all',
    to: '',
    subj: '',
    body: ''
  },
  cfg: {
    api: '',
    prefix: 'ZN',
    fromName: 'Zion Cakes & Bites',
    from: 'orders@zioncakesmbeya.com',
    notify: 'orders@zioncakesmbeya.com'
  },
  pg: {
    orderBtn: 'Order Now',
    nav: [
      { label: 'Home', desc: 'Fresh daily highlights & overview' },
      { label: 'Full Menu', desc: 'Cakes, pizza, chicken, drinks' },
      { label: 'Custom Cake Orders', desc: 'Flavors, sizes & occasions' },
      { label: 'About & Location', desc: 'Store hours, Wi-Fi & dine-in' },
      { label: 'Contact & Delivery', desc: 'Mbeya delivery zones & fees' },
      { label: 'Reviews & Moments', desc: 'Customer stories & gallery' }
    ],
    footer: {
      tag: 'Freshly made in Mbeya, for every moment worth sharing.',
      line: 'Dine-in · Drive-through · Delivery'
    },
    about: {
      eyebrow: 'LOCAL ROOTS · FRESH DAILY',
      title: "From a local home oven to Mbeya's favorite food hub.",
      lead: 'Zion Cakes & Bites started with a single promise: never compromise on ingredient freshness. Located at Forest Mpya, Maghorofani, we bake celebration cakes, slice gourmet pizzas, and flame-grill chicken every morning for the vibrant community of Mbeya.',
      body: 'Whether you stop by for a quick midday shawarma, spend the weekend catching up over iced caramel lattes with free Wi-Fi, or order a 2-tier wedding centerpiece, we prepare everything with care and warmth.',
      metrics: [
        { n: '4.1★', l: '87 Google Reviews' },
        { n: '6,896+', l: 'Instagram Followers' },
        { n: '100%', l: 'Made Fresh in Mbeya' }
      ]
    },
    contact: {
      cards: [
        {
          icon: '💬',
          title: 'WhatsApp Direct Order',
          text: 'Instant kitchen order dispatch. Send your items or cake inspiration photo.'
        },
        {
          icon: '📞',
          title: 'Phone Inquiries',
          text: 'Speak directly with our counter staff for immediate inquiries and table bookings.'
        },
        {
          icon: '📸',
          title: 'Instagram Community',
          text: 'Join 6,896+ followers for daily fresh bake reels & cakes.'
        }
      ],
      zonesTitle: 'Mbeya Delivery Zones & Rates',
      zonesText: 'We deliver throughout Mbeya using insulated thermal bags so food arrives hot and cakes arrive pristine.',
      formTitle: 'Send a Message or Catering Request',
      formText: 'Planning a wedding send-off, office event, or have a specific question? Send your inquiry directly.',
      types: [
        'Daily Food Delivery',
        'Custom Cake Preorder',
        'Wedding / Send-off Catering',
        'Corporate / Bulk Pastry Order',
        'General Question'
      ]
    },
    rform: {
      title: 'Share your Zion moment',
      text: 'Tell Mbeya how we did. Your review appears after our team approves it.',
      btn: 'Submit review'
    },
    order: {
      title: 'Order with Zion Mbeya',
      text: 'Direct ordering on WhatsApp with instant kitchen dispatch.',
      btn: 'Send Order to WhatsApp ↗'
    }
  }
};

const STORAGE_KEY = 'zion-admin-v2';

export interface DataAdapter {
  getData(): Promise<StoreData> | StoreData;
  saveData(data: StoreData): Promise<void> | void;
  createOrder(order: OrderRecord): Promise<void> | void;
  createInquiry(inquiry: InquiryRecord): Promise<void> | void;
  createReview(review: ReviewRecord): Promise<void> | void;
}

export class LocalStorageAdapter implements DataAdapter {
  private key = STORAGE_KEY;

  getData(): StoreData {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.orders && parsed.menu) {
          return {
            ...DEFAULT_STORE,
            ...parsed,
            pg: { ...DEFAULT_STORE.pg, ...(parsed.pg || {}) },
            home: { ...DEFAULT_STORE.home, ...(parsed.home || {}) },
            banners: { ...DEFAULT_STORE.banners, ...(parsed.banners || {}) },
            biz: { ...DEFAULT_STORE.biz, ...(parsed.biz || {}) },
            cfg: { ...DEFAULT_STORE.cfg, ...(parsed.cfg || {}) }
          };
        }
      }
    } catch {
      // Fallback
    }
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }

  saveData(data: StoreData): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      notifyStoreSubscribers(data);
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  createOrder(order: OrderRecord): void {
    const data = this.getData();
    data.orders = [order, ...data.orders];
    this.saveData(data);
  }

  createInquiry(inquiry: InquiryRecord): void {
    const data = this.getData();
    data.inbox = [inquiry, ...data.inbox];
    this.saveData(data);
  }

  createReview(review: ReviewRecord): void {
    const data = this.getData();
    data.reviews = [review, ...data.reviews];
    this.saveData(data);
  }
}

export class ApiAdapter implements DataAdapter {
  private baseUrl: string;
  private localFallback = new LocalStorageAdapter();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async getData(): Promise<StoreData> {
    try {
      const res = await fetch(`${this.baseUrl}/content`);
      if (res.ok) {
        const json = await res.json();
        return {
          ...DEFAULT_STORE,
          ...json,
          pg: { ...DEFAULT_STORE.pg, ...(json.pg || {}) },
          home: { ...DEFAULT_STORE.home, ...(json.home || {}) }
        };
      }
    } catch (e) {
      console.warn('ApiAdapter getData error, falling back to local:', e);
    }
    return this.localFallback.getData();
  }

  async saveData(data: StoreData): Promise<void> {
    this.localFallback.saveData(data);
    try {
      await fetch(`${this.baseUrl}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.warn('ApiAdapter saveData error:', e);
    }
  }

  async createOrder(order: OrderRecord): Promise<void> {
    this.localFallback.createOrder(order);
    try {
      await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (e) {
      console.warn('ApiAdapter createOrder error:', e);
    }
  }

  async createInquiry(inquiry: InquiryRecord): Promise<void> {
    this.localFallback.createInquiry(inquiry);
    try {
      await fetch(`${this.baseUrl}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry)
      });
    } catch (e) {
      console.warn('ApiAdapter createInquiry error:', e);
    }
  }

  async createReview(review: ReviewRecord): Promise<void> {
    this.localFallback.createReview(review);
    try {
      await fetch(`${this.baseUrl}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    } catch (e) {
      console.warn('ApiAdapter createReview error:', e);
    }
  }
}

import { SupabaseDataAdapter } from './supabaseAdapter';

// Global active adapter instance: Supabase is primary persistent source!
export const activeAdapter: DataAdapter = new SupabaseDataAdapter();

// Reactive subscription listeners
type Subscriber = (data: StoreData) => void;
const subscribers = new Set<Subscriber>();

export function subscribeToStore(sub: Subscriber): () => void {
  subscribers.add(sub);
  return () => {
    subscribers.delete(sub);
  };
}

export function notifyStoreSubscribers(data: StoreData) {
  subscribers.forEach((sub) => {
    try {
      sub(data);
    } catch (e) {
      console.error(e);
    }
  });
}

// React hooks
export function useStore(): [StoreData, (updater: StoreData | ((prev: StoreData) => StoreData)) => void] {
  const [data, setData] = useState<StoreData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.orders || parsed.menu)) {
          return {
            ...DEFAULT_STORE,
            ...parsed,
            pg: { ...DEFAULT_STORE.pg, ...(parsed.pg || {}) },
            home: { ...DEFAULT_STORE.home, ...(parsed.home || {}) },
            banners: { ...DEFAULT_STORE.banners, ...(parsed.banners || {}) },
            biz: { ...DEFAULT_STORE.biz, ...(parsed.biz || {}) },
            cfg: { ...DEFAULT_STORE.cfg, ...(parsed.cfg || {}) }
          };
        }
      }
    } catch {
      // Ignored
    }
    return DEFAULT_STORE;
  });

  useEffect(() => {
    // Fetch live data from Supabase
    Promise.resolve(activeAdapter.getData())
      .then((fresh) => {
        if (fresh) setData(fresh);
      })
      .catch((err) => {
        console.warn('Initial store load warning:', err);
      });

    const unsub = subscribeToStore((newData) => {
      setData(newData);
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) setData((prev) => ({ ...prev, ...parsed }));
        } catch {
          // Ignored
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsub();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const updateStore = (updater: StoreData | ((prev: StoreData) => StoreData)) => {
    const next = typeof updater === 'function' ? updater(data) : updater;
    setData(next);
    activeAdapter.saveData(next);
  };

  return [data, updateStore];
}

export function useContent(): StoreData {
  const [store] = useStore();
  return store;
}

export function useOrders(): OrderRecord[] {
  const [store] = useStore();
  return store.orders;
}

export function useReviews(): ReviewRecord[] {
  const [store] = useStore();
  return store.reviews;
}

export function useMembers(): MemberRecord[] {
  const [store] = useStore();
  return store.members;
}

// Helpers
export function formatMoney(val: number | string): string {
  const num = Number(val) || 0;
  return 'TZS ' + num.toLocaleString('en-US');
}

export function formatWhatsAppNumber(phone: string): string {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.startsWith('0')) d = '255' + d.slice(1);
  return d;
}

export function generateOrderId(prefix = 'ZN', existingOrders: OrderRecord[] = []): string {
  const maxNum = Math.max(
    1000,
    ...existingOrders.map((o) => +String(o.id).replace(/\D/g, '') || 0)
  );
  return `${prefix}-${maxNum + 1}`;
}

export async function saveOrderToStore(order: OrderRecord): Promise<void> {
  await activeAdapter.createOrder(order);
}

export async function saveInquiryToStore(inquiry: InquiryRecord): Promise<void> {
  await activeAdapter.createInquiry(inquiry);
}

export async function saveReviewToStore(review: ReviewRecord): Promise<void> {
  await activeAdapter.createReview(review);
}
