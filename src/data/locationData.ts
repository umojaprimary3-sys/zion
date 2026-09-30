import { DeliveryZone } from '../types';

export const RESTAURANT_INFO = {
  name: 'Zion Cakes & Bites',
  location: 'Forest Mpya, Maghorofani, Mbeya, Tanzania',
  addressLine1: 'Forest Mpya, Maghorofani',
  addressCity: 'Mbeya City, Tanzania',
  phoneDisplay: '+255 768 000 111 / +255 689 123 456',
  phoneCall: '+255768000111',
  whatsappNumber: '255768000111',
  whatsappDirectUrl: 'https://wa.me/255768000111?text=Hello%20Zion%20Cakes%20%26%20Bites%20Mbeya,%20I%20would%20like%20to%20place%20an%20order!',
  email: 'orders@zioncakesmbeya.com',
  instagram: '@zioncakesmbeya',
  instagramUrl: 'https://instagram.com/zioncakesmbeya',
  googleRating: '4.1',
  googleReviewsCount: '87 Google Reviews',
  instagramFollowers: '6,896+',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Zion+Bakery+Forest+Mpya+Maghorofani+Mbeya+Tanzania',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Zion+Bakery+Forest+Mpya+Maghorofani+Mbeya+Tanzania',
  nominatimGeocodingUrl: 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=Zion%20Bakery%2C%20Forest%20Mpya%2C%20Maghorofani%2C%20Mbeya%2C%20Tanzania',
};

export const OPERATING_HOURS = [
  { days: 'Monday – Thursday', hours: '07:30 AM – 10:00 PM', status: 'Open Daily' },
  { days: 'Friday – Saturday', hours: '07:30 AM – 11:00 PM', status: 'Weekend Music & Late Bites' },
  { days: 'Sunday', hours: '08:00 AM – 10:00 PM', status: 'Family Day & Brunch' },
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    name: 'Njia Panda & Hospitali Zone',
    estimate: '15 – 25 mins',
    fee: 'TZS 1,500 / Free over 30k',
    coverage: 'Hospital Grounds, Isanga, Meta, Mzinga',
  },
  {
    name: 'Mwanjelwa & Soweto Hub',
    estimate: '20 – 30 mins',
    fee: 'TZS 2,500',
    coverage: 'Mwanjelwa Central, Soweto Market, Block T',
  },
  {
    name: 'Forest & Jacaranda Area',
    estimate: '25 – 35 mins',
    fee: 'TZS 3,000',
    coverage: 'Forest Old/New, Mbeya Peak View, Jacaranda',
  },
  {
    name: 'Uyole & Iyunga Ward',
    estimate: '30 – 45 mins',
    fee: 'TZS 4,000',
    coverage: 'Uyole Junction, Iyunga Technical, MUST Uni Route',
  },
  {
    name: 'Nzovwe, Ilomba & Mbalizi Road',
    estimate: '35 – 50 mins',
    fee: 'TZS 4,500',
    coverage: 'Nzovwe Center, Ilomba, Airport Road up to Mbalizi',
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Do you offer delivery across Mbeya?',
    answer: 'Yes! We deliver freshly prepared cakes, meals, pizzas, and drinks across Mbeya City including Njia Panda, Mwanjelwa, Soweto, Forest, Uyole, Nzovwe, and Iyunga. Delivery takes approximately 20 to 45 minutes.',
  },
  {
    question: 'How much notice is needed to preorder a custom cake?',
    answer: 'For standard 1kg–2kg single-tier custom celebration cakes, we can often accommodate same-day orders with 3–4 hours notice. For tiered wedding, send-off, or intricate themed fondant designs, we recommend placing your order 24–48 hours in advance.',
  },
  {
    question: 'Do you have seating and Wi-Fi for dine-in?',
    answer: 'Yes, Zion features comfortable air-conditioned and terrace seating with complimentary high-speed guest Wi-Fi, ambient background music on weekends, and power outlets suitable for working lunches or friendly catch-ups.',
  },
  {
    question: 'How do I pay for my delivery or pickup order?',
    answer: 'We accept M-Pesa, Tigo Pesa, Airtel Money, Halopesa, direct bank transfers (NMB / CRDB), and cash on pickup or delivery.',
  },
  {
    question: 'Can you write a custom message on my cake?',
    answer: 'Yes! We provide complimentary custom chocolate plaque or buttercream script lettering on all whole cakes (e.g., "Happy 25th Birthday Baraka!" or "Congratulations Dr. Neema!").',
  },
];
