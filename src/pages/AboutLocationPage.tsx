import React from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { OPERATING_HOURS, RESTAURANT_INFO } from '../data/locationData';
import { useContent } from '../data/store';

interface AboutLocationPageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
}

export const AboutLocationPage: React.FC<AboutLocationPageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const content = useContent();
  const banner = content.banners?.about;
  const about = content.pg?.about;
  const hoursList = (content.hours && content.hours.length > 0) ? content.hours : OPERATING_HOURS;

  return (
    <>
      {/* PAGE HEADER */}
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage="about"
            onNavigate={onNavigate}
            onOpenOrderModal={onOpenOrderModal}
          />

          <div className="page-title-section">
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              {banner?.eyebrow || 'OUR STORY & PHYSICAL LOCATION'}
            </div>
            <h1>{banner?.title || 'About Zion Cakes & Bites'}</h1>
            <p>
              {banner?.text || 'Founded in the heart of Mbeya, dedicated to elevating everyday dining, family celebrations, and artisan baking.'}
            </p>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="about-story-section">
        <div className="wrap">
          <div className="about-story-card">
            <div>
              <div className="eyebrow" style={{ color: 'var(--orange)', marginBottom: '8px' }}>
                {about?.eyebrow || 'LOCAL ROOTS · FRESH DAILY'}
              </div>
              <h2>
                {about?.title || "From a local home oven to Mbeya's favorite food hub."}
              </h2>
              <p className="story-lead">
                {about?.lead || (
                  <>
                    Zion Cakes & Bites started with a single promise: never compromise on ingredient freshness. Located at <b>Forest Mpya, Maghorofani</b>, we bake celebration cakes, slice gourmet pizzas, and flame-grill chicken every morning for the vibrant community of Mbeya.
                  </>
                )}
              </p>
              <p className="story-body">
                {about?.body || "Whether you stop by for a quick midday shawarma, spend the weekend catching up over iced caramel lattes with free Wi-Fi, or order a 2-tier wedding centerpiece, we prepare everything with care and warmth."}
              </p>

              <div className="about-metrics-row">
                {(about?.metrics || [
                  { n: '4.1★', l: '87 Google Reviews' },
                  { n: '6,896+', l: 'Instagram Followers' },
                  { n: '100%', l: 'Made Fresh in Mbeya' }
                ]).map((m, i) => (
                  <div key={i} className="about-metric-pill">
                    <div className="metric-num">{m.n}</div>
                    <div className="metric-label">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-img-container">
              <img
                src={content.home?.aboutPhoto || "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1000&auto=format&fit=crop"}
                alt="Zion cafe interior"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DINE-IN EXPERIENCE (REUSING MOMENT STYLE) */}
      <section className="moment" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2>More Than A Meal, It's A Moment</h2>
          <p>Settle in for good food, easy conversations, and the little extras that make Zion feel like your place in Mbeya.</p>
          
          <div className="moment-grid">
            <div className="moment-card" id="about-music">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎷</div>
              <h3>Weekend Music</h3>
              <p>Easy live sounds and good company for a slower, relaxed weekend afternoon.</p>
            </div>
            <div className="moment-card" id="about-wifi">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📶</div>
              <h3>Comfortable Wi-Fi & Workspaces</h3>
              <p>A relaxed air-conditioned corner for remote work, casual meetings, and study catch-ups.</p>
            </div>
            <div className="moment-card" id="about-ambience">
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>✨</div>
              <h3>Warm Ambience</h3>
              <p>Thoughtful lighting, welcoming seating for dates, family reunions, and festive birthday surprises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION & HOURS SECTION */}
      <section className="location" style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <div className="location-card">
            <div className="location-left">
              <div className="eyebrow">PHYSICAL STORE & DINE-IN</div>
              <h2>Your Zion moment starts in Mbeya.</h2>
              <div className="addr">
                📍 {content.biz?.address1 || RESTAURANT_INFO.addressLine1}
                <br />
                {content.biz?.address2 || RESTAURANT_INFO.addressCity}
              </div>

              {/* Operating Hours Table */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '18px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--terracotta)', marginBottom: '10px' }}>
                  🕒 Operating Hours
                </div>
                {hoursList.map((h, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12.5px',
                      color: '#cfc6b8',
                      marginBottom: '6px',
                      borderBottom: idx < hoursList.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none',
                      paddingBottom: '4px',
                    }}
                  >
                    <span>{h.days}</span>
                    <b style={{ color: '#fff' }}>{h.hours}</b>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={content.biz?.mapUrl || RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-solid"
                >
                  Open in Google Maps ↗
                </a>
                <a
                  href={content.biz?.dirUrl || RESTAURANT_INFO.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                  style={{ color: 'var(--orange)', borderColor: 'var(--orange)' }}
                >
                  Get Directions ↗
                </a>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={onOpenOrderModal}
                >
                  Order for Delivery
                </button>
              </div>
            </div>

            <div
              className="location-right"
              id="about-location-right"
            >
              <iframe
                title="Zion Cakes & Bites Location Map"
                className="location-map-frame"
                src="https://maps.google.com/maps?q=Forest+Mpya,+Maghorofani,+Mbeya,+Tanzania&t=&z=15&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="location-map-overlay">
                <div className="location-map-badge">
                  <div className="pin">📍</div>
                  <div>
                    <b>{content.biz?.name || 'Zion Cakes & Bites'}</b>
                    <span>{content.biz?.address1 || 'Forest Mpya, Maghorofani'}, {content.biz?.address2?.split(',')[0] || 'Mbeya'}</span>
                  </div>
                </div>
                <a
                  href={content.biz?.mapUrl || RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="location-map-link-btn"
                >
                  Open Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REASONS SECTION */}
      <section className="reasons" style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <h2>Little Reasons To Stop By</h2>
          <div className="reasons-grid">
            <div
              className="reason-card reason-1"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('menu')}
            >
              <h3>Weekday Lunch</h3>
              <p>Fresh favorites for your midday break.</p>
            </div>
            <div
              className="reason-card reason-2"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('custom-cakes')}
            >
              <h3>Cake Preorders</h3>
              <p>Plan your celebration early with Zion.</p>
            </div>
            <div
              className="reason-card reason-3"
              style={{ cursor: 'pointer' }}
              onClick={onOpenOrderModal}
            >
              <h3>Weekend Treats</h3>
              <p>Good food, music, and room to unwind.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
