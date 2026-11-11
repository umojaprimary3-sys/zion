import React from 'react';
import { PageId } from '../types';
import { useContent } from '../data/store';
import { HeaderNav } from '../components/HeaderNav';

interface Props {
  onNavigate: (p: PageId) => void;
  onOpenOrderModal: () => void;
}

const wrapStyle: React.CSSProperties = { maxWidth: 820, margin: '0 auto', padding: '32px 20px 64px', textAlign: 'left' };

export const LegalPage: React.FC<Props & { kind: 'privacy' | 'terms' }> = ({ kind, onNavigate, onOpenOrderModal }) => {
  const { biz } = useContent();
  const text = kind === 'privacy' ? biz?.privacyText : biz?.termsText;
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
  return (
    <>
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav currentPage={kind} onNavigate={onNavigate} onOpenOrderModal={onOpenOrderModal} />
          <div className="page-title-section"><h1>{title}</h1></div>
        </div>
      </section>
      <section style={wrapStyle}>
        {text?.trim() ? (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 15 }}>{text}</div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>This page has not been published yet.</p>
        )}
      </section>
    </>
  );
};

export const NotFoundPage: React.FC<Props> = ({ onNavigate, onOpenOrderModal }) => (
  <>
    <section className="page-header-banner">
      <div className="page-header-card">
        <HeaderNav currentPage="home" onNavigate={onNavigate} onOpenOrderModal={onOpenOrderModal} />
        <div className="page-title-section">
          <h1>Page not found</h1>
          <p>The page you are looking for does not exist or has moved.</p>
        </div>
      </div>
    </section>
    <section style={{ ...wrapStyle, textAlign: 'center' }}>
      <button className="btn-solid" onClick={() => onNavigate('home')}>Back to home</button>{' '}
      <button className="btn-outline" onClick={() => onNavigate('menu')}>View menu</button>
    </section>
  </>
);
