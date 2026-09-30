import React from 'react';
import { PageId } from '../types';
import { RESTAURANT_INFO } from '../data/locationData';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="main-footer">
      <div className="footer-card" id="footer-card">
        <div className="footer-brand" id="footer-brand">
          <h2>
            ZION
            <br />
            CAKES & BITES
          </h2>
          <p>Freshly made in Mbeya, for every moment worth sharing.</p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
              fontSize: '12px',
              color: 'var(--terracotta)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onNavigate('home')}
            >
              Home
            </span>
            <span>·</span>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onNavigate('menu')}
            >
              Full Menu
            </span>
            <span>·</span>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onNavigate('custom-cakes')}
            >
              Custom Cake Preorders
            </span>
            <span>·</span>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onNavigate('about')}
            >
              About & Location
            </span>
            <span>·</span>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onNavigate('contact')}
            >
              Delivery & Contact
            </span>
            <span>·</span>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => onNavigate('reviews')}
            >
              Reviews
            </span>
          </div>
        </div>

        <div className="footer-right" id="footer-right">
          <b>{RESTAURANT_INFO.location}</b>
          <br />
          Dine-in · Drive-through · Delivery
          <div style={{ marginTop: '10px', color: '#a89f90', fontSize: '12px' }}>
            Phone: {RESTAURANT_INFO.phoneDisplay}
            <br />
            Instagram: <a href={RESTAURANT_INFO.instagramUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)' }}>{RESTAURANT_INFO.instagram}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
