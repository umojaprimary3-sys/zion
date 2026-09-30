import React, { useState } from 'react';
import { PageId } from '../types';
import { RESTAURANT_INFO } from '../data/locationData';

interface HeaderNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
  isHeroMode?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPage,
  onNavigate,
  onOpenOrderModal,
  isHeroMode = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { id: PageId; label: string; icon: string; desc?: string }[] = [
    { id: 'home', label: 'Home', icon: '⌂', desc: 'Fresh daily highlights & overview' },
    { id: 'menu', label: 'Full Menu', icon: '🍰', desc: 'Cakes, pizza, chicken, drinks' },
    { id: 'custom-cakes', label: 'Custom Cake Orders', icon: '🎂', desc: 'Flavors, sizes & occasions' },
    { id: 'about', label: 'About & Location', icon: '📍', desc: 'Store hours, Wi-Fi & dine-in' },
    { id: 'contact', label: 'Contact & Delivery', icon: '📞', desc: 'Mbeya delivery zones & fees' },
    { id: 'reviews', label: 'Reviews & Moments', icon: '★', desc: 'Customer stories & gallery' },
  ];

  return (
    <>
      <div className="hero-nav" id="main-navigation-bar">
        <button
          className="menu-btn"
          id="menu-toggle-btn"
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>☰</span>
          <span>Menu</span>
        </button>

        <div className="nav-pills" id="nav-pills-list">
          <button
            type="button"
            className={currentPage === 'home' ? 'active' : ''}
            onClick={() => handleNavClick('home')}
            id="nav-pill-home"
          >
            Home
          </button>
          <button
            type="button"
            className={currentPage === 'menu' ? 'active' : ''}
            onClick={() => handleNavClick('menu')}
            id="nav-pill-menu"
          >
            Menu
          </button>
          <button
            type="button"
            className={currentPage === 'custom-cakes' ? 'active' : ''}
            onClick={() => handleNavClick('custom-cakes')}
            id="nav-pill-custom-cakes"
          >
            Cake Orders
          </button>
          <button
            type="button"
            className={currentPage === 'about' ? 'active' : ''}
            onClick={() => handleNavClick('about')}
            id="nav-pill-about"
          >
            About & Location
          </button>
          <button
            type="button"
            className={currentPage === 'contact' ? 'active' : ''}
            onClick={() => handleNavClick('contact')}
            id="nav-pill-contact"
          >
            Contact
          </button>
          <button
            type="button"
            className={currentPage === 'reviews' ? 'active' : ''}
            onClick={() => handleNavClick('reviews')}
            id="nav-pill-reviews"
          >
            Reviews
          </button>
        </div>

        <button
          className="order-btn"
          id="header-order-btn"
          type="button"
          onClick={onOpenOrderModal}
        >
          <span>Order Now</span>
          <span>↗</span>
        </button>
      </div>

      {/* Mobile Slide Drawer */}
      {drawerOpen && (
        <div
          className="mobile-nav-drawer-overlay"
          id="mobile-nav-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="mobile-nav-drawer"
            id="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: 'Fredoka, sans-serif',
                      fontSize: '24px',
                      letterSpacing: '0.5px',
                      color: '#fff',
                    }}
                  >
                    ZION
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--terracotta)', fontWeight: 500 }}>
                    Cakes & Bites · Mbeya
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: 'none',
                    color: '#fff',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <div className="drawer-links" id="drawer-links-container" style={{ marginTop: '20px' }}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`drawer-link-btn ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    id={`drawer-btn-${item.id}`}
                    style={{ minHeight: '52px', padding: '14px 18px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '20px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>{item.label}</div>
                        {item.desc && (
                          <div style={{ fontSize: '11.5px', opacity: 0.75, fontWeight: 400 }}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '16px' }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.12)',
                paddingTop: '20px',
                marginTop: '24px',
              }}
            >
              <button
                type="button"
                className="btn-solid"
                style={{
                  width: '100%',
                  minHeight: '48px',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenOrderModal();
                }}
                id="drawer-order-now-btn"
              >
                <span>Order on WhatsApp</span>
                <span>↗</span>
              </button>
              <div
                style={{
                  fontSize: '12px',
                  color: '#cfc6b8',
                  textAlign: 'center',
                  lineHeight: '1.5',
                }}
              >
                📍 Njia Panda ya Hospitali, Mbeya
                <br />
                📞 +255 768 000 111
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
