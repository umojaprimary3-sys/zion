// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { waLink, telHref, firstPhone, addressLine, mapUrl, mapEmbedSrc, bt } from '../biz';
import { generateOrderId } from '../../data/store';

const biz = {
  name: 'Sweet Corner Bakery',
  city: 'Arusha',
  address1: 'Main Road',
  address2: 'Arusha, Tanzania',
  phone: '0712 345 678 / 0755 000 000',
  whatsapp: '0712 345 678',
} as any;

describe('business helpers', () => {
  it('hides WhatsApp link when number is blank', () => {
    expect(waLink({ whatsapp: '' } as any, 'hi')).toBe('');
  });
  it('builds a WhatsApp link with encoded text', () => {
    const url = waLink(biz, 'Hello there');
    expect(url.startsWith('https://wa.me/')).toBe(true);
    expect(url).toContain('text=Hello%20there');
  });
  it('uses the first phone for tel: links and returns nothing when blank', () => {
    expect(firstPhone(biz)).toBe('0712 345 678');
    expect(telHref(biz)).toBe('tel:0712345678');
    expect(telHref({ phone: '' } as any)).toBe('');
  });
  it('builds map links from the address when no link is saved', () => {
    expect(addressLine(biz)).toBe('Main Road, Arusha, Tanzania');
    expect(mapUrl(biz)).toContain('Main%20Road');
    expect(mapEmbedSrc(biz)).toContain('output=embed');
    expect(mapUrl({ mapUrl: 'https://example.com/m' } as any)).toBe('https://example.com/m');
    expect(mapUrl({} as any)).toBe('');
  });
});

describe('bt() brand wording', () => {
  it('replaces brand and city from settings', () => {
    expect(bt(biz, 'Your Zion moment starts in Mbeya.')).toBe('Your Sweet moment starts in Arusha.');
    expect(bt(biz, 'Welcome to Zion Cakes & Bites')).toBe('Welcome to Sweet Corner Bakery');
  });
});

describe('generateOrderId', () => {
  it('creates unique ids with the prefix', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateOrderId('ZN')));
    expect(ids.size).toBeGreaterThan(495);
    for (const id of ids) expect(id.startsWith('ZN-')).toBe(true);
  });
});
