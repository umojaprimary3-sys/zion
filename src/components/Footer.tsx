import React from 'react';
import { PageId } from '../types';
import { addressLine, firstPhone } from '../lib/biz';
import { useContent } from '../data/store';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const content = useContent();

  const bizName = content.biz?.name || '';
  const nameParts = bizName.split(' ');
  const titleFirst = nameParts[0] || '';
  const titleRest = nameParts.slice(1).join(' ');

  return (
    <footer id="main-footer">
      <div className="footer-card" id="footer-card">
        <div className="footer-brand" id="footer-brand">
          {content.biz?.logoUrl && (
            <img loading="lazy" decoding="async" src={content.biz.logoUrl} alt={bizName} style={{ height: 48, maxWidth: 200, objectFit: 'contain', marginBottom: 8 }} />
          )}
          <h2>
            {titleFirst}
            <br />
            {titleRest}
          </h2>
          <p>{content.pg?.footer?.tag || content.biz?.footer || ''}</p>
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
            {content.biz?.privacyText && (
              <>
                <span>·</span>
                <span style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fff' }} onClick={() => onNavigate('privacy')}>Privacy</span>
              </>
            )}
            {content.biz?.termsText && (
              <>
                <span>·</span>
                <span style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fff' }} onClick={() => onNavigate('terms')}>Terms</span>
              </>
            )}
          </div>
        </div>

        <div className="footer-right" id="footer-right">
          <b>{addressLine(content.biz)}</b>
          <br />
          {content.pg?.footer?.line || 'Dine-in · Drive-through · Delivery'}
          <div style={{ marginTop: '10px', color: '#a89f90', fontSize: '12px' }}>
            {content.biz?.phone && <>Phone: {content.biz.phone}<br /></>}
            {content.biz?.email && <>Email: {content.biz.email}<br /></>}
            {content.biz?.igUrl && <>Instagram: <a href={content.biz.igUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)' }}>{content.biz?.instagram || content.biz.igUrl}</a></>}
          </div>
        </div>
      </div>
    </footer>
  );
};
