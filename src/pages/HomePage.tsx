import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { FAQ_ITEMS, RESTAURANT_INFO } from '../data/locationData';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: (itemName?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

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
              src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1400&auto=format&fit=crop"
              alt="Birthday cake with lit candles"
              id="hero-cake-image"
            />
            <div className="hero-overlay-text" id="hero-overlay-text">
              <h1>
                Freshly Made,
                <br />
                Made For You
              </h1>
              <p>
                Cakes, pizza, shawarma, chicken and more — baked and cooked fresh daily in Mbeya, ready for dine-in, pickup, or delivery.
              </p>
            </div>
            <div className="hero-cards" id="hero-cards">
              <div
                className="info-card"
                id="info-card-rating"
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('reviews')}
              >
                <h3>Loved By Mbeya</h3>
                <p>Trusted by hundreds of happy customers across the city.</p>
                <div className="rating-big">
                  4.1★ <span>87 Google<br />Reviews</span>
                </div>
              </div>
              <div
                className="info-card signature-card"
                id="info-card-signature"
                style={{ cursor: 'pointer' }}
                onClick={() => onNavigate('custom-cakes')}
              >
                <h3>Signature Celebration Cake</h3>
                <div className="loc">Njia Panda ya Hospitali, Mbeya</div>
                <p>Custom flavors, fillings and decorations for birthdays, weddings and special occasions.</p>
                <div className="signature-meta">
                  <div>Fresh daily</div>
                  <div>4 sizes</div>
                  <div>12 flavors</div>
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
          <h2>Everything Zion Serves You</h2>
          <p>From everyday meals to custom celebration cakes — dine in, drive through, or get it delivered.</p>
          <div className="grid-3" id="serves-grid">
            <div
              className="serve-card"
              id="serve-card-cakes"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('custom-cakes')}
            >
              <img
                src="https://images.unsplash.com/photo-1602351447937-745cb720612f?q=80&w=800&auto=format&fit=crop"
                alt="Cakes"
              />
              <div className="content">
                <div className="serve-icon">🍰</div>
                <h3>Cakes & Custom Orders</h3>
                <p>Birthday, wedding, and celebration cakes — choose flavor, size, and decoration.</p>
              </div>
            </div>
            <div
              className="serve-card"
              id="serve-card-pizza"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('menu')}
            >
              <img
                src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop"
                alt="Pizza"
              />
              <div className="content">
                <div className="serve-icon">🍕</div>
                <h3>Pizza, Burgers & Shawarma</h3>
                <p>Everyday favorites made fresh, from lunch to late-night cravings.</p>
              </div>
            </div>
            <div
              className="serve-card"
              id="serve-card-cookies"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('menu')}
            >
              <img
                src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop"
                alt="Cookies"
              />
              <div className="content">
                <div className="serve-icon">🍪</div>
                <h3>Cookies & Bakes</h3>
                <p>Freshly baked daily, perfect for gifting or snacking.</p>
              </div>
            </div>
            <div
              className="serve-card"
              id="serve-card-chicken"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('menu')}
            >
              <img
                src="https://images.unsplash.com/photo-1432139555190-58524dae6a55?q=80&w=800&auto=format&fit=crop"
                alt="Chicken"
              />
              <div className="content">
                <div className="serve-icon">🍗</div>
                <h3>Chicken & Mains</h3>
                <p>Hearty meals for lunch, dinner, or family outings.</p>
              </div>
            </div>
            <div
              className="serve-card"
              id="serve-card-drinks"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('menu')}
            >
              <img
                src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=800&auto=format&fit=crop"
                alt="Cake with candles"
              />
              <div className="content">
                <div className="serve-icon">🥤</div>
                <h3>Juice & Drinks</h3>
                <p>Fresh juice to pair with any meal.</p>
              </div>
            </div>
            <div
              className="serve-card"
              id="serve-card-delivery"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('contact')}
            >
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop"
                alt="Pastries"
              />
              <div className="content">
                <div className="serve-icon">📦</div>
                <h3>Dine-in, Drive-through & Delivery</h3>
                <p>However you want it — we bring the food to you.</p>
              </div>
            </div>
          </div>

          <div className="stats-bar" id="stats-bar">
            <div>★ <b>4.1/5</b> · Google Rating (87 reviews)</div>
            <div><b>6,896+</b> · Instagram Followers</div>
            <div><b>Fresh Daily</b> · Made-to-order</div>
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
          <h2>What Mbeya Is Saying</h2>
          <p>A few kind words from our customers.</p>

          <div className="story-grid" id="story-grid">
            <div
              className="story-img"
              id="story-customer"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('reviews')}
            >
              <img
                src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1000&auto=format&fit=crop"
                alt="Customer story"
              />
              <div className="story-label">
                <span className="dot">↗</span> Customer stories & gallery
              </div>
            </div>
            <div
              className="story-img"
              id="story-kitchen"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('reviews')}
            >
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop"
                alt="Kitchen moments"
              />
              <div className="story-label">
                <span className="dot">↗</span> Fresh in the kitchen
              </div>
            </div>
          </div>

          <div className="reviews-grid" id="reviews-grid">
            <div className="review-card" id="review-card-anna">
              <div className="stars">★★★★★</div>
              <p>The birthday cake was beautiful and tasted even better. Zion made our celebration feel so special!</p>
              <b>Anna M.</b>
            </div>
            <div className="review-card" id="review-card-joseph">
              <div className="stars">★★★★★</div>
              <p>Fresh pizza, friendly service, and quick pickup. This is my go-to spot in Mbeya.</p>
              <b>Joseph K.</b>
            </div>
            <div className="review-card" id="review-card-neema">
              <div className="stars">★★★★★</div>
              <p>I ordered juice and shawarma for the office — everything arrived fresh and perfectly packed.</p>
              <b>Neema R.</b>
            </div>
          </div>
        </div>
      </section>

      {/* MOMENT */}
      <section className="moment" id="moment-section">
        <div className="wrap">
          <h2>More Than A Meal, It's A Moment</h2>
          <p>Settle in for good food, easy conversations, and the little extras that make Zion feel like your place in Mbeya.</p>
          <div className="moment-img" id="moment-img">
            <img
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1200&auto=format&fit=crop"
              alt="Cafe interior"
            />
          </div>
          <div className="moment-grid" id="moment-grid">
            <div className="moment-card" id="moment-music">
              <h3>Weekend Music</h3>
              <p>Easy live sounds and good company for a slower weekend.</p>
            </div>
            <div className="moment-card" id="moment-wifi">
              <h3>Comfortable Wi-Fi</h3>
              <p>A relaxed corner for work, catch-ups, and everything in between.</p>
            </div>
            <div className="moment-card" id="moment-ambience">
              <h3>Warm Ambience</h3>
              <p>Thoughtful spaces for dates, family time, and celebrations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REASONS */}
      <section className="reasons" id="reasons-section">
        <div className="wrap">
          <h2>Little Reasons To Stop By</h2>
          <div className="reasons-grid" id="reasons-grid">
            <div
              className="reason-card reason-1"
              id="reason-lunch"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('menu')}
            >
              <h3>Weekday Lunch</h3>
              <p>Fresh favorites for your midday break.</p>
            </div>
            <div
              className="reason-card reason-2"
              id="reason-preorders"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('custom-cakes')}
            >
              <h3>Cake Preorders</h3>
              <p>Plan your celebration early with Zion.</p>
            </div>
            <div
              className="reason-card reason-3"
              id="reason-treats"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('about')}
            >
              <h3>Weekend Treats</h3>
              <p>Good food, music, and room to unwind.</p>
            </div>
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
              <div className="addr">📍 Forest Mpya, Maghorofani, Mbeya, Tanzania</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <a
                  href={RESTAURANT_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-solid"
                  id="directions-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  Open in Google Maps ↗
                </a>
                <a
                  href={RESTAURANT_INFO.directionsUrl}
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
                    <b>Zion Cakes & Bites</b>
                    <span>Forest Mpya, Maghorofani, Mbeya</span>
                  </div>
                </div>
                <a
                  href={RESTAURANT_INFO.googleMapsUrl}
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
