import React, { useState } from 'react';
import { PageId } from '../types';
import { RESTAURANT_INFO } from '../data/locationData';
import { useContent } from '../data/store';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface HeaderNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  isHeroMode?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPage,
  onNavigate,
  onOpenOrderModal,
  onOpenAuthModal,
  isHeroMode = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const content = useContent();
  const { user, member, isLoggedIn, signOut } = useCustomerAuth();

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLabels = content.pg?.nav || [];

  const navItems: { id: PageId; label: string; icon: string; desc?: string }[] = [
    { id: 'home', label: navLabels[0]?.label || 'Home', icon: '⌂', desc: navLabels[0]?.desc || 'Fresh daily highlights & overview' },
    { id: 'menu', label: navLabels[1]?.label || 'Full Menu', icon: '🍰', desc: navLabels[1]?.desc || 'Cakes, pizza, chicken, drinks' },
    { id: 'custom-cakes', label: navLabels[2]?.label || 'Custom Cake Orders', icon: '🎂', desc: navLabels[2]?.desc || 'Flavors, sizes & occasions' },
    { id: 'about', label: navLabels[3]?.label || 'About & Location', icon: '📍', desc: navLabels[3]?.desc || 'Store hours, Wi-Fi & dine-in' },
    { id: 'contact', label: navLabels[4]?.label || 'Contact & Delivery', icon: '📞', desc: navLabels[4]?.desc || 'Mbeya delivery zones & fees' },
    { id: 'reviews', label: navLabels[5]?.label || 'Reviews & Moments', icon: '★', desc: navLabels[5]?.desc || 'Customer stories & gallery' },
  ];

  const customerShortName = member?.name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'Account';

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
            {navLabels[0]?.label || 'Home'}
          </button>
          <button
            type="button"
            className={currentPage === 'menu' ? 'active' : ''}
            onClick={() => handleNavClick('menu')}
            id="nav-pill-menu"
          >
            {navLabels[1]?.label || 'Menu'}
          </button>
          <button
            type="button"
            className={currentPage === 'custom-cakes' ? 'active' : ''}
            onClick={() => handleNavClick('custom-cakes')}
            id="nav-pill-custom-cakes"
          >
            {navLabels[2]?.label ? navLabels[2].label.replace('Custom ', '') : 'Cake Orders'}
          </button>
          <button
            type="button"
            className={currentPage === 'about' ? 'active' : ''}
            onClick={() => handleNavClick('about')}
            id="nav-pill-about"
          >
            {navLabels[3]?.label || 'About & Location'}
          </button>
          <button
            type="button"
            className={currentPage === 'contact' ? 'active' : ''}
            onClick={() => handleNavClick('contact')}
            id="nav-pill-contact"
          >
            {navLabels[4]?.label ? navLabels[4].label.split('&')[0].trim() : 'Contact'}
          </button>
          <button
            type="button"
            className={currentPage === 'reviews' ? 'active' : ''}
            onClick={() => handleNavClick('reviews')}
            id="nav-pill-reviews"
          >
            {navLabels[5]?.label ? navLabels[5].label.split('&')[0].trim() : 'Reviews'}
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              className={currentPage === 'account' ? 'active' : ''}
              onClick={() => handleNavClick('account')}
              id="nav-pill-account"
              style={{
                color: currentPage === 'account' ? '#fff' : 'var(--terracotta)',
                fontWeight: 600,
              }}
            >
              👤 {customerShortName}
            </button>
          ) : (
            <button
              type="button"
              className={currentPage === 'login' || currentPage === 'register' ? 'active' : ''}
              onClick={() => (onOpenAuthModal ? onOpenAuthModal('login') : handleNavClick('login'))}
              id="nav-pill-login"
              style={{ opacity: 0.9 }}
            >
              Sign In
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => handleNavClick('account')}
              className={currentPage === 'account' ? 'order-btn' : 'menu-btn'}
              style={{
                fontSize: '13px',
                padding: '9px 16px',
                background: currentPage === 'account' ? 'var(--green)' : 'rgba(255,255,255,0.12)',
                color: currentPage === 'account' ? '#0c1a10' : '#fff',
              }}
              title="My Account & Orders"
            >
              <span>👤 {customerShortName}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal('login') : handleNavClick('login'))}
              className="menu-btn"
              style={{
                fontSize: '13px',
                padding: '9px 14px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span>Login</span>
            </button>
          )}

          <button
            className="order-btn"
            id="header-order-btn"
            type="button"
            onClick={onOpenOrderModal}
          >
            <span>{content.pg?.orderBtn || 'Order Now'}</span>
            <span>↗</span>
          </button>
        </div>
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
                    {content.biz?.name?.split(' ')[0] || 'ZION'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--terracotta)', fontWeight: 500 }}>
                    {content.biz?.name?.includes('Cakes') ? 'Cakes & Bites · Mbeya' : (content.biz?.name || 'Cakes & Bites · Mbeya')}
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

              {/* Customer Account Strip in Mobile Drawer */}
              <div
                style={{
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '14px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {isLoggedIn ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>👤</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                            {member?.name || user?.user_metadata?.full_name || 'Customer'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#cfc6b8' }}>{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleNavClick('account')}
                        style={{
                          flex: 1,
                          background: 'var(--green)',
                          color: '#0c1a10',
                          border: 'none',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        My Account & Orders
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setDrawerOpen(false);
                          await signOut();
                          handleNavClick('home');
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          color: '#fff',
                          border: 'none',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '12px', color: '#cfc6b8', marginBottom: '8px' }}>
                      Customer Account
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal('login');
                          else handleNavClick('login');
                        }}
                        style={{
                          flex: 1,
                          background: 'rgba(255,255,255,0.15)',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          if (onOpenAuthModal) onOpenAuthModal('register');
                          else handleNavClick('register');
                        }}
                        style={{
                          flex: 1,
                          background: 'var(--terracotta)',
                          color: 'var(--dark)',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="drawer-links" id="drawer-links-container" style={{ marginTop: '16px' }}>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`drawer-link-btn ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    id={`drawer-btn-${item.id}`}
                    style={{ minHeight: '48px', padding: '12px 16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 600 }}>{item.label}</div>
                        {item.desc && (
                          <div style={{ fontSize: '11px', opacity: 0.75, fontWeight: 400 }}>
                            {item.desc}
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: '15px' }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.12)',
                paddingTop: '20px',
                marginTop: '20px',
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
                📍 {content.biz?.address1 || RESTAURANT_INFO.location}, {content.biz?.address2 || 'Mbeya'}
                <br />
                📞 {content.biz?.phone || RESTAURANT_INFO.phoneDisplay}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
