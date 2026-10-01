import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { RESTAURANT_INFO, DELIVERY_ZONES, FAQ_ITEMS } from '../data/locationData';
import { useContent, saveInquiryToStore, formatWhatsAppNumber } from '../data/store';

interface ContactOrderPageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
}

export const ContactOrderPage: React.FC<ContactOrderPageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const content = useContent();

  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Daily Food Delivery');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const banner = content.banners?.contact;
  const contactPg = content.pg?.contact;
  const zonesList = (content.zones && content.zones.length > 0) ? content.zones : DELIVERY_ZONES;
  const faqList = (content.faq && content.faq.length > 0)
    ? content.faq.map((f) => ({ question: f.q, answer: f.a }))
    : FAQ_ITEMS;

  const inquiryOptions = contactPg?.types && contactPg.types.length > 0
    ? contactPg.types
    : [
        'Daily Food Delivery',
        'Custom Cake Preorder',
        'Wedding / Send-off Catering',
        'Corporate / Bulk Pastry Order',
        'General Question',
      ];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello Zion Cakes & Bites Mbeya!\n\n*Name:* ${inquiryName}\n*Phone:* ${inquiryPhone}\n*Inquiry Category:* ${inquiryType}\n*Details:* ${inquiryMessage}\n\nSent from Zion Mbeya Website`;

    // Save inquiry to Supabase store
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      await saveInquiryToStore({
        name: inquiryName,
        phone: inquiryPhone,
        email: '',
        type: inquiryType,
        message: inquiryMessage,
        date: todayStr,
        status: 'unread',
      });
    } catch (err: unknown) {
      console.warn('Could not save inquiry to Supabase:', err);
    }

    const waNum = formatWhatsAppNumber(content.biz?.whatsapp) || RESTAURANT_INFO.whatsappNumber;
    const url = `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`;
    setSubmitted(true);
    window.open(url, '_blank');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const contactCards = contactPg?.cards || [
    {
      icon: '💬',
      title: 'WhatsApp Direct Order',
      text: 'Instant kitchen order dispatch. Send your items or cake inspiration photo.',
    },
    {
      icon: '📞',
      title: 'Phone Inquiries',
      text: 'Speak directly with our counter staff for immediate inquiries and table bookings.',
    },
    {
      icon: '📸',
      title: 'Instagram Community',
      text: `Join ${content.biz?.followers || RESTAURANT_INFO.instagramFollowers} followers for daily fresh bake reels & cakes.`,
    },
  ];

  return (
    <>
      {/* PAGE HEADER */}
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage="contact"
            onNavigate={onNavigate}
            onOpenOrderModal={onOpenOrderModal}
          />

          <div className="page-title-section">
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              {banner?.eyebrow || 'REACH OUT & CITYWIDE DELIVERY'}
            </div>
            <h1>{banner?.title || 'Contact & Delivery'}</h1>
            <p>
              {banner?.text || 'Order via WhatsApp for rapid dispatch, inquire about event catering, or ask our bakery team about delivery to your area in Mbeya.'}
            </p>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT CARDS */}
      <section style={{ padding: '20px 20px 50px' }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            {/* CARD 1: WHATSAPP */}
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{contactCards[0]?.icon || '💬'}</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', marginBottom: '6px' }}>
                {contactCards[0]?.title || 'WhatsApp Direct Order'}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {contactCards[0]?.text || 'Instant kitchen order dispatch. Send your items or cake inspiration photo.'}
              </p>
              <a
                href={content.biz?.whatsapp ? `https://wa.me/${formatWhatsAppNumber(content.biz.whatsapp)}` : RESTAURANT_INFO.whatsappDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-solid"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Chat on WhatsApp ↗
              </a>
            </div>

            {/* CARD 2: PHONE CALLS */}
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{contactCards[1]?.icon || '📞'}</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', marginBottom: '6px' }}>
                {contactCards[1]?.title || 'Phone Inquiries'}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {contactCards[1]?.text || 'Speak directly with our counter staff for immediate inquiries and table bookings.'}
              </p>
              <a
                href={`tel:${content.biz?.phone ? content.biz.phone.replace(/\s+/g, '') : RESTAURANT_INFO.phoneCall}`}
                className="btn-outline"
                style={{ display: 'inline-block', border: '1px solid rgba(36,28,21,0.2)' }}
              >
                Call {content.biz?.phone ? content.biz.phone.split('/')[0].trim() : '+255 768 000 111'}
              </a>
            </div>

            {/* CARD 3: INSTAGRAM */}
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{contactCards[2]?.icon || '📸'}</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', marginBottom: '6px' }}>
                {contactCards[2]?.title || 'Instagram Community'}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {contactCards[2]?.text || `Join ${content.biz?.followers || RESTAURANT_INFO.instagramFollowers} followers for daily fresh bake reels & cakes.`}
              </p>
              <a
                href={content.biz?.igUrl || RESTAURANT_INFO.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ display: 'inline-block', border: '1px solid rgba(36,28,21,0.2)' }}
              >
                Follow {content.biz?.instagram || '@zioncakesmbeya'} ↗
              </a>
            </div>
          </div>

          {/* DELIVERY ZONES & INQUIRY FORM GRID */}
          <div className="contact-zones-grid" id="contact-zones-grid">
            {/* DELIVERY ZONES */}
            <div
              className="contact-card-box"
              id="delivery-zones-card"
            >
              <div className="eyebrow" style={{ color: 'var(--orange)', marginBottom: '6px' }}>
                COVERAGE MAP
              </div>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '26px', marginBottom: '12px' }}>
                {contactPg?.zonesTitle || 'Mbeya Delivery Zones & Rates'}
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {contactPg?.zonesText || 'We deliver throughout Mbeya using insulated thermal bags so food arrives hot and cakes arrive pristine.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {zonesList.map((zone, idx) => (
                  <div
                    key={idx}
                    className="delivery-zone-row"
                  >
                    <div>
                      <b style={{ fontSize: '14px', color: 'var(--text-dark)' }}>{zone.name}</b>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {zone.coverage}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-dark)' }}>
                        {zone.fee}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ⏱ ~{zone.estimate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIRECT MESSAGE / CATERING FORM */}
            <div
              className="contact-form-card"
              id="catering-inquiry-form-card"
            >
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '22px', marginBottom: '6px' }}>
                {contactPg?.formTitle || 'Send a Message or Catering Request'}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#cfc6b8', marginBottom: '20px' }}>
                {contactPg?.formText || 'Planning a wedding send-off, office event, or have a specific question? Send your inquiry directly.'}
              </p>

              {submitted && (
                <div
                  style={{
                    background: 'var(--mint)',
                    color: '#12321f',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  ✓ WhatsApp message opened! Our team will respond shortly.
                </div>
              )}

              <form onSubmit={handleInquirySubmit}>
                <div className="form-group">
                  <label style={{ color: '#cfc6b8' }}>Your Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Baraka Mwambene"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: '#cfc6b8' }}>Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g., 0768 000 111"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ color: '#cfc6b8' }}>Inquiry Type</label>
                  <select
                    className="form-select"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                  >
                    {inquiryOptions.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ color: '#cfc6b8' }}>Message / Details *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Share event date, guest count, or items you need..."
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-solid"
                  style={{ width: '100%', padding: '14px', justifyContent: 'center', marginTop: '10px' }}
                >
                  Send Inquiry via WhatsApp ↗
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="faq" style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <h2>Delivery &amp; Ordering FAQ</h2>
          <div className="faq-list">
            {faqList.map((item, idx) => (
              <div
                key={idx}
                className="faq-item"
                style={{ flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => toggleFaq(idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>{item.question}</span>
                  <span style={{ transform: openFaqIndex === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    ⌄
                  </span>
                </div>
                {openFaqIndex === idx && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: '1.5' }}>
                    {item.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
