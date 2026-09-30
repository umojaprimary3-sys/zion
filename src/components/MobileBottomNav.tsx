import React from 'react';
import { PageId } from '../types';

interface MobileBottomNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  onOpenOrderModal,
}) => {
  const navButtons: { id: PageId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'menu', label: 'Menu', icon: '🍰' },
    { id: 'custom-cakes', label: 'Cakes', icon: '🎂' },
    { id: 'about', label: 'Location', icon: '📍' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <div className="mobile-sticky-footer-bar" id="mobile-sticky-footer-bar">
      <div className="mobile-bottom-nav-inner">
        <div className="mobile-nav-icons-row" id="mobile-bottom-icons-row">
          {navButtons.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-touch-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onNavigate(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                id={`mobile-bottom-nav-${item.id}`}
                aria-label={item.label}
              >
                <span className="nav-icon-glyph">{item.icon}</span>
                <span className="nav-icon-text">{item.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="mobile-sticky-order-btn"
          onClick={onOpenOrderModal}
          id="mobile-sticky-order-btn"
          aria-label="Order Now on WhatsApp"
        >
          <span>Order Now</span>
          <span className="arrow-glyph">↗</span>
        </button>
      </div>
    </div>
  );
};
