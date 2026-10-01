import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { FAQ_ITEMS, RESTAURANT_INFO } from '../data/locationData';
import { useContent } from '../data/store';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: (itemName?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const content = useContent();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const hero = content.home?.hero;
  const rating = content.home?.rating;
  const sig = content.home?.sig;
  const stats = content.home?.stats || [
    { t: '4.1/5', s: 'Google Rating (87 reviews)' },
    { t: '6,896+', s: 'Instagram Followers' },
    { t: 'Fresh Daily', s: 'Made-to-order' },
  ];
  const serves = content.home?.serves;
  const test = content.home?.test;
  const moment = content.home?.moment;
  const reasons = content.home?.reasons;

  // Reviews: featured approved reviews or fallback to top reviews
  const approvedReviews = (content.reviews || []).filter(
    (r) => r.status === 'approved' && (r.featured || true)
  );
  const displayReviews = approvedReviews.slice(0, 3);

  // FAQ items from store or fallback
  const faqList = content.faq && content.faq.length > 0
    ? content.faq.map((f) => ({ question: f.q, answer: f.a }))
    : FAQ_ITEMS;

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero-section" id="hero-section">
        <div className="hero-card" id="hero-card">
          <HeaderNav
            currentPage="home"
            onNavigate={onNavigate}
            onOpenOrderModal={() => onOpenOrderModal()}
            isHeroMode={true}
          />

          <div className="hero-body" id="hero-body">
            <img
              src={hero?.image || "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1400&auto=format&fit=crop"}
              alt="Birthday cake with lit candles"
              id="hero-cake-image"
            />
            <div className="hero-overlay-text" id="hero-overlay-text">
              <h1>
                {hero?.title ? (
                  hero.title.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    Freshly Made,
                    <br />
                    Made For You
                  </>
                )}
              </h1>
              <p>
                {hero?.text || "Cakes, pizza, shawarma, chicken and more — baked and cooked fresh daily in Mbeya, ready for dine-in, pickup, or delivery."}
              </p>
            </div>
            <div className="hero-cards" id="hero-cards">
              <div
                className="info-card"
                id="info-card-rating"
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('reviews')}
              >
                <h3>{rating?.title || "Loved By Mbeya"}</h3>
                <p>{rating?.text || "Trusted by hundreds of happy customers across the city."}</p>
                <div className="rating-big">
                  {rating?.score || "4.1★"} <span>{rating?.label || "87 Google Reviews"}</span>
                </div>
              </div>
              <div
                className="info-card signature-card"
                id="info-card-signature"
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('custom-cakes')}
              >
                <h3>{sig?.title || "Signature Celebration Cake"}</h3>
                <div className="loc">{sig?.location || "Njia Panda ya Hospitali, Mbeya"}</div>
                <p>{sig?.text || "Custom flavors, fillings and decorations for birthdays, weddings and special occasions."}</p>
                <div className="signature-meta">
                  <div>{sig?.m0 || "Fresh daily"}</div>
                  <div>{sig?.m1 || "4 sizes"}</div>
                  <div>{sig?.m2 || "12 flavors"}</div>
                </div>
                <div className="signature-icons">♡ ⚑ ⇧</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVES */}
      <section className="serves" id="serves-section">
        <div className="wrap">
          <h2>{serves?.title || "Everything Zion Serves You"}</h2>
          <p>{serves?.sub || "From everyday meals to custom celebration cakes — dine in, drive through, or get it delivered."}</p>
          <div className="grid-3" id="serves-grid">
            {(serves?.cards || []).map((card, idx) => {
              const navTarget: PageId =
                idx === 0
                  ? 'custom-cakes'
                  : idx === 5
                  ? 'contact'
                  : 'menu';

              return (
                <div
                  key={idx}
                  className="serve-card"
                  id={`serve-card-${idx}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate(navTarget)}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                  />
                  <div className="content">
                    <div className="serve-icon">{card.icon}</div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="stats-bar" id="stats-bar">
            {stats.map((st, i) => (
              <div key={i}>
                {i === 0 && '★ '}
                <b>{st.t}</b> · {st.s}
              </div>
            ))}
          </div>

          <div className="cta-banner" id="cta-banner">
            <h3>Craving something sweet or savory?</h3>
            <div className="cta-actions">
              <button
                className="btn-solid"
                id="whatsapp-order-btn"
                type="button"
                onClick={() => onOpenOrderModal()}
              >
                Order on WhatsApp
              </button>
              <button
                className="btn-outline"
                id="full-menu-btn"
                type="button"
                onClick={() => onNavigate('menu')}
              >
                View Full Menu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials-section">
        <div className="wrap">
          <h2>{test?.title || "What Mbeya Is Saying"}</h2>
          <p>{test?.sub || "A few kind words from our customers."}</p>

          <div className="story-grid" id="story-grid">
            <div
              className="story-img"
              id="story-customer"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('reviews')}
            >
              <img
                src={test?.p0i || "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000&auto=format&fit=crop"}
                alt="Customer story"
              />
              <div className="story-label">
                <span className="dot">↗</span> {test?.p0l || "Customer stories & gallery"}
              </div>
            </div>
            <div
              className="story-img"
              id="story-kitchen"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('reviews')}
            >
              <img
                src={test?.p1i || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop"}
                alt="Kitchen moments"
              />
              <div className="story-label">
                <span className="dot">↗</span> {test?.p1l || "Fresh in the kitchen"}
              </div>
            </div>
          </div>

          <div className="reviews-grid" id="reviews-grid">
            {displayReviews.map((r, i) => (
              <div key={i} className="review-card" id={`review-card-${i}`}>
                <div className="stars">{'★'.repeat(r.rating || 5)}</div>
                <p>{r.comment}</p>
                <b>{r.author}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOMENT */}
      <section className="moment" id="moment-section">
        <div className="wrap">
          <h2>{moment?.title || "More Than A Meal, It's A Moment"}</h2>
          <p>{moment?.sub || "Settle in for good food, easy conversations, and the little extras that make Zion feel like your place in Mbeya."}</p>
          <div className="moment-img" id="moment-img">
            <img
              src={moment?.image || "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop"}
              alt="Cafe interior"
            />
          </div>
          <div className="moment-grid" id="moment-grid">
            {(moment?.cards || []).map((card, i) => (
              <div key={i} className="moment-card" id={`moment-card-${i}`}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REASONS */}
      <section className="reasons" id="reasons-section">
        <div className="wrap">
          <h2>{reasons?.title || "Little Reasons To Stop By"}</h2>
          <div className="reasons-grid" id="reasons-grid">
            {(reasons?.cards || []).map((card, i) => {
              const navTarget: PageId =
                i === 0 ? 'menu' : i === 1 ? 'custom-cakes' : 'about';
              return (
                <div
                  key={i}
                  className={`reason-card reason-${i + 1}`}
                  id={`reason-card-${i}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onNavigate(navTarget)}
                >
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="location" id="location-section">
        <div className="wrap">
          <div className="location-card" id="location-card">
            <div className="location-left" id="location-left">
              <div className="eyebrow">COME FIND US</div>
              <h2>Your Zion moment starts in Mbeya.</h2>
              <div className="addr">📍 {content.biz?.address1 || 'Forest Mpya, Maghorofani'}, {content.biz?.address2 || 'Mbeya, Tanzania'}</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <a
                  href={content.biz?.mapUrl || RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-solid"
                  id="directions-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Open in Google Maps ↗
                </a>
                <a
                  href={content.biz?.dirUrl || RESTAURANT_INFO.directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline"
                  id="get-directions-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--orange)', borderColor: 'var(--orange)' }}
                >
                  Get Directions ↗
                </a>
              </div>
            </div>
            <div
              className="location-right"
              id="location-right"
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
                  id="map-overlay-link"
                >
                  Open Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq-section">
        <div className="wrap">
          <h2>Questions? We've Got You.</h2>
          <div className="faq-list" id="faq-list">
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
