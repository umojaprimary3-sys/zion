import { BizData, formatWhatsAppNumber } from '../data/store';

/** All business details come from the admin-editable store (content.biz). Nothing is hardcoded here. */

export function waLink(biz: Partial<BizData> | undefined, text?: string): string {
  const num = formatWhatsAppNumber(biz?.whatsapp || '');
  if (!num) return '';
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function firstPhone(biz: Partial<BizData> | undefined): string {
  return (biz?.phone || '').split('/')[0].trim();
}

export function telHref(biz: Partial<BizData> | undefined): string {
  const p = firstPhone(biz).replace(/[^\d+]/g, '');
  return p ? `tel:${p}` : '';
}

export function addressLine(biz: Partial<BizData> | undefined): string {
  return [biz?.address1, biz?.address2].map((s) => (s || '').trim()).filter(Boolean).join(', ');
}

export function mapUrl(biz: Partial<BizData> | undefined): string {
  if (biz?.mapUrl) return biz.mapUrl;
  const q = addressLine(biz);
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

export function dirUrl(biz: Partial<BizData> | undefined): string {
  if (biz?.dirUrl) return biz.dirUrl;
  const q = addressLine(biz);
  return q ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}` : '';
}

export function mapEmbedSrc(biz: Partial<BizData> | undefined): string {
  if (biz?.mapEmbed) return biz.mapEmbed;
  const q = addressLine(biz);
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed` : '';
}

/**
 * Brand-aware text. Built-in wording that mentions the old brand/city is rewritten with the
 * Business settings (name + city) from the admin, so renaming the business updates every page.
 */
export function bt(biz: Partial<BizData> | undefined, text: string): string {
  const name = (biz?.name || '').trim();
  const shortName = name.split(/\s+/)[0] || '';
  const city = (biz?.city || '').trim() || 'your area';
  let out = text;
  if (name) out = out.replace(/Zion Cakes & Bites/g, name);
  if (shortName) out = out.replace(/\bZion\b/g, shortName);
  return out.replace(/\bMbeya\b/g, city);
}
