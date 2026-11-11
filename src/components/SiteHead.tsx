import { useEffect } from 'react';
import { PageId } from '../types';
import { useContent } from '../data/store';
import { addressLine, firstPhone } from '../lib/biz';

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!value) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

const PAGE_TITLES: Partial<Record<PageId | 'not-found', string>> = {
  menu: 'Menu',
  'custom-cakes': 'Custom Cakes',
  about: 'About & Location',
  contact: 'Contact & Delivery',
  reviews: 'Reviews & Gallery',
  account: 'My Account',
  login: 'Sign in',
  register: 'Create account',
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
  'not-found': 'Page not found',
};

/** Keeps <title>, meta tags, favicon, JSON-LD and analytics in sync with the admin-editable Business settings. */
export function SiteHead({ page }: { page: PageId | 'not-found' }) {
  const { biz } = useContent();

  useEffect(() => {
    const base = biz?.seoTitle || biz?.name || '';
    const part = PAGE_TITLES[page];
    document.title = part ? `${part} · ${biz?.name || base}` : base;
    const desc = biz?.seoDescription || biz?.footer || '';
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', document.title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:image', biz?.ogImage || '');
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:card', biz?.ogImage ? 'summary_large_image' : 'summary');
    setMeta('name', 'robots', page === 'not-found' ? 'noindex' : 'index,follow');

    let icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (biz?.faviconUrl) {
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = 'icon';
        document.head.appendChild(icon);
      }
      icon.href = biz.faviconUrl;
    }
  }, [page, biz]);

  // Structured data for search engines (LocalBusiness)
  useEffect(() => {
    const id = 'ld-localbusiness';
    document.getElementById(id)?.remove();
    if (!biz?.name) return;
    const ld: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Bakery',
      name: biz.name,
      description: biz.seoDescription || biz.footer || undefined,
      image: biz.ogImage || undefined,
      telephone: firstPhone(biz) || undefined,
      email: biz.email || undefined,
      address: addressLine(biz) ? { '@type': 'PostalAddress', streetAddress: addressLine(biz) } : undefined,
      sameAs: biz.igUrl ? [biz.igUrl] : undefined,
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.text = JSON.stringify(ld);
    document.head.appendChild(el);
    return () => el.remove();
  }, [biz]);

  // Google Analytics, only once an ID is entered in Admin → Business
  useEffect(() => {
    const gid = (biz?.analyticsId || '').trim();
    if (!/^G-[A-Z0-9]+$/i.test(gid)) return;
    if (document.getElementById('ga-loader')) return;
    const s = document.createElement('script');
    s.id = 'ga-loader';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
    document.head.appendChild(s);
    const w = window as unknown as { dataLayer: unknown[] };
    w.dataLayer = w.dataLayer || [];
    function gtag(..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', gid);
  }, [biz?.analyticsId]);

  return null;
}
