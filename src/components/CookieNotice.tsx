import { useState } from 'react';
import { useContent } from '../data/store';

const KEY = 'zion_cookie_ok';

export function CookieNotice({ onNavigate }: { onNavigate: (p: 'privacy') => void }) {
  const { biz } = useContent();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  if (hidden || biz?.showCookieNotice === false || !biz?.cookieText) return null;
  const accept = () => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      // ignore
    }
    setHidden(true);
  };
  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 76, zIndex: 90, maxWidth: 560, margin: '0 auto',
        background: '#241c15', color: '#fff', padding: '12px 16px', borderRadius: 14, fontSize: 13,
        display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
      }}
    >
      <span>
        {biz.cookieText}{' '}
        {biz.privacyText && (
          <a href="#privacy" onClick={() => onNavigate('privacy')} style={{ color: 'var(--orange)' }}>Privacy policy</a>
        )}
      </span>
      <button className="btn-solid" onClick={accept} style={{ padding: '6px 14px' }}>OK</button>
    </div>
  );
}
