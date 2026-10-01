import React from 'react';
import { PageId } from '../types';
import { RESTAURANT_INFO } from '../data/locationData';
import { useContent } from '../data/store';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const content = useContent();

  const bizName = content.biz?.name || 'ZION CAKES & BITES';
  const nameParts = bizName.split(' ');
  const titleFirst = nameParts[0] || 'ZION';
  const titleRest = nameParts.slice(1).join(' ') || 'CAKES & BITES';

  return (
    <footer id="main-footer">
      <div className="footer-card" id="footer-card">
        <div className="footer-brand" id="footer-brand">
          <h2>
            {titleFirst}
            <br />
            {titleRest}
          </h2>
          <p>{content.pg?.footer?.tag || 'Freshly made in Mbeya, for every moment worth sharing.'}</p>
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
            <span>·</span>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fff' }}
              onClick={() => onNavigate('account')}
            >
              Customer Account
            </span>
          </div>
        </div>

        <div className="footer-right" id="footer-right">
          <b>{content.biz?.address1 || RESTAURANT_INFO.location}, {content.biz?.address2 || 'Mbeya'}</b>
          <br />
          {content.pg?.footer?.line || 'Dine-in · Drive-through · Delivery'}
          <div style={{ marginTop: '10px', color: '#a89f90', fontSize: '12px' }}>
            Phone: {content.biz?.phone || RESTAURANT_INFO.phoneDisplay}
            <br />
            Instagram: <a href={content.biz?.igUrl || RESTAURANT_INFO.instagramUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)' }}>{content.biz?.instagram || RESTAURANT_INFO.instagram}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
