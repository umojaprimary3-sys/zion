import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { RESTAURANT_INFO, DELIVERY_ZONES, FAQ_ITEMS } from '../data/locationData';

interface ContactOrderPageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
}

export const ContactOrderPage: React.FC<ContactOrderPageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Daily Food Delivery');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello Zion Cakes & Bites Mbeya!\n\n*Name:* ${inquiryName}\n*Phone:* ${inquiryPhone}\n*Inquiry Category:* ${inquiryType}\n*Details:* ${inquiryMessage}\n\nSent from Zion Mbeya Website`;
    const url = `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`;
    setSubmitted(true);
    window.open(url, '_blank');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
              REACH OUT & CITYWIDE DELIVERY
            </div>
            <h1>Contact & Delivery</h1>
            <p>
              Order via WhatsApp for rapid dispatch, inquire about event catering, or ask our bakery team about delivery to your area in Mbeya.
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
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', marginBottom: '6px' }}>
                WhatsApp Direct Order
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Instant kitchen order dispatch. Send your items or cake inspiration photo.
              </p>
              <a
                href={RESTAURANT_INFO.whatsappDirectUrl}
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
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>📞</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', marginBottom: '6px' }}>
                Phone Inquiries
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Speak directly with our counter staff for immediate inquiries and table bookings.
              </p>
              <a
                href={`tel:${RESTAURANT_INFO.phoneCall}`}
                className="btn-outline"
                style={{ display: 'inline-block', border: '1px solid rgba(36,28,21,0.2)' }}
              >
                Call +255 768 000 111
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
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>📸</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', marginBottom: '6px' }}>
                Instagram Community
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Join {RESTAURANT_INFO.instagramFollowers} followers for daily fresh bake reels & cakes.
              </p>
              <a
                href={RESTAURANT_INFO.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ display: 'inline-block', border: '1px solid rgba(36,28,21,0.2)' }}
              >
                Follow @zioncakesmbeya ↗
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
                Mbeya Delivery Zones & Rates
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                We deliver throughout Mbeya using insulated thermal bags so food arrives hot and cakes arrive pristine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {DELIVERY_ZONES.map((zone, idx) => (
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
                Send a Message or Catering Request
              </h3>
              <p style={{ fontSize: '12.5px', color: '#cfc6b8', marginBottom: '20px' }}>
                Planning a wedding send-off, office event, or have a specific question? Send your inquiry directly.
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
                    <option value="Daily Food Delivery">Daily Food Delivery</option>
                    <option value="Custom Cake Preorder">Custom Celebration Cake</option>
                    <option value="Wedding / Send-off Catering">Wedding / Send-off Catering</option>
                    <option value="Corporate / Bulk Pastry Order">Corporate / Bulk Pastry Order</option>
                    <option value="General Question">General Feedback / Question</option>
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
          <h2>Delivery & Ordering FAQ</h2>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, idx) => (
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
