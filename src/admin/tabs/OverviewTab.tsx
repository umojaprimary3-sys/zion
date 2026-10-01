import React from 'react';
import { StoreData, formatMoney } from '../../data/store';

interface OverviewTabProps {
  store: StoreData;
  onNavigateTab: (tab: string) => void;
  onOpenIoModal: () => void;
  onOpenResetModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  store,
  onNavigateTab,
  onOpenIoModal,
  onOpenResetModal,
}) => {
  const miss: Array<[string, string]> = [];

  store.menu.forEach((m) => {
    if (!m.image) miss.push(['menu', `“${m.name}” has no photo`]);
    if (!m.description) miss.push(['menu', `“${m.name}” has no description`]);
  });
  store.gallery.forEach((g) => {
    if (!g.src) miss.push(['gallery', `Gallery “${g.title}” has no photo`]);
  });
  store.reviews.forEach((r) => {
    if (!r.comment) miss.push(['revs', `Review by ${r.author} is empty`]);
  });
  if (!store.biz.phone) miss.push(['biz', 'Phone number is missing']);
  if (!store.biz.whatsapp) miss.push(['biz', 'WhatsApp number is missing']);

  const pct = Math.max(8, 100 - miss.length * 6);
  const has = (t: string) => !miss.some((m) => m[0] === t);

  // Operations stats
  const o = store.orders;
  const ok = o.filter((x) => x.status !== 'cancelled');
  const newOrdersCount = o.filter((x) => x.status === 'new').length;
  const totalValue = ok.reduce((a, x) => a + (+x.total || 0), 0);
  const unreadMessagesCount = store.inbox.filter((x) => x.status === 'unread').length;
  const pendingReviewsCount = store.reviews.filter((x) => x.status === 'pending').length;
  const membersCount = store.members.length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const an = o.map((x) => x.date).sort().pop() || todayStr;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(an);
    d.setUTCDate(d.getUTCDate() - 6 + i);
    return d.toISOString().slice(0, 10);
  });
  const counts = days.map((d) => o.filter((x) => x.date === d).length);
  const maxCount = Math.max(1, ...counts);

  const statusLabels: Record<string, string> = {
    new: '🆕 New',
    confirmed: '✅ Confirmed',
    preparing: '👩‍🍳 Preparing',
    ready: '🛍️ Ready',
    out: '🛵 On the way',
    done: '🎉 Completed',
    cancelled: '✖ Cancelled',
  };

  return (
    <div>
      <div className="za-hero">
        <svg className="za-ring" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="#3a3126"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.9"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
          <text
            x="18"
            y="21"
            textAnchor="middle"
            fill="#fff"
            fontSize="8"
            fontFamily="Fredoka, cursive, sans-serif"
          >
            {pct}%
          </text>
        </svg>
        <div className="za-eb" style={{ color: 'var(--za-terra)' }}>
          Welcome back
        </div>
        <h2>Run Zion Cakes &amp; Bites from one place.</h2>
        <p>
          Edit anything below — your changes appear on the website pages listed
          under each card.{' '}
          {miss.length ? (
            <b style={{ color: '#fff' }}>
              {miss.length} small thing{miss.length > 1 ? 's' : ''} to finish.
            </b>
          ) : (
            'Everything looks complete 🎉'
          )}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="za-kpis">
        <button
          type="button"
          className="za-kpi hot"
          onClick={() => onNavigateTab('orders')}
        >
          <b>{newOrdersCount}</b>
          <span>New orders</span>
        </button>
        <button
          type="button"
          className="za-kpi"
          onClick={() => onNavigateTab('orders')}
        >
          <b>{formatMoney(totalValue)}</b>
          <span>Order value</span>
        </button>
        <button
          type="button"
          className="za-kpi"
          onClick={() => onNavigateTab('inbox')}
        >
          <b>{unreadMessagesCount}</b>
          <span>Unread messages</span>
        </button>
        <button
          type="button"
          className="za-kpi"
          onClick={() => onNavigateTab('revs')}
        >
          <b>{pendingReviewsCount}</b>
          <span>Reviews to approve</span>
        </button>
        <button
          type="button"
          className="za-kpi"
          onClick={() => onNavigateTab('members')}
        >
          <b>{membersCount}</b>
          <span>Members</span>
        </button>
      </div>

      {/* Orders 7 days chart */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Orders, last 7 days</h2>
          </div>
        </div>
        <div className="za-bars">
          {counts.map((n, i) => (
            <div key={days[i]}>
              <i style={{ height: `${(n / maxCount) * 80}px` }}></i>
              {n}
              <br />
              {days[i].slice(5)}
            </div>
          ))}
        </div>
      </section>

      {/* Latest Orders */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Latest orders</h2>
          </div>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('orders')}
          >
            View all
          </button>
        </div>
        {o.slice(0, 5).map((x) => (
          <div key={x.id} className="za-ap">
            <span>
              <b>{x.name}</b> · {String(x.items).slice(0, 48)}
            </span>
            <span className={`za-pill ${x.status === 'new' ? 'o' : ''}`}>
              {statusLabels[x.status] || x.status}
            </span>
          </div>
        ))}
        {o.length === 0 && <p className="za-hint">No orders yet.</p>}
      </section>

      {/* Overview Cards */}
      <div className="za-oc">
        <div className="za-card">
          <h3>
            🏠 Home &amp; Hero
            <span className="za-ck">✓ Ready</span>
          </h3>
          <ul>
            <li>
              Everything Zion Serves cards
              <b>{store.home.serves.cards.length}</b>
            </li>
            <li>
              Moment cards<b>{store.home.moment.cards.length}</b>
            </li>
            <li>
              Reason cards<b>{store.home.reasons.cards.length}</b>
            </li>
            <li>
              Stats in bar<b>{store.home.stats.length}</b>
            </li>
          </ul>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('home')}
          >
            Edit Home &amp; Hero →
          </button>
        </div>

        <div className="za-card">
          <h3>
            🍽️ Menu
            <span className={`za-ck ${has('menu') ? '' : 'w'}`}>
              {has('menu') ? '✓ Ready' : 'Needs attention'}
            </span>
          </h3>
          <ul>
            <li>
              Categories<b>{store.cats.length}</b>
            </li>
            <li>
              Food boxes<b>{store.menu.length}</b>
            </li>
            <li>
              Favorites ★<b>{store.menu.filter((m) => m.popular).length}</b>
            </li>
          </ul>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('menu')}
          >
            Edit Menu →
          </button>
        </div>

        <div className="za-card">
          <h3>
            🎂 Cake Studio
            <span className="za-ck">✓ Ready</span>
          </h3>
          <ul>
            <li>
              Sizes<b>{store.sizes.length}</b>
            </li>
            <li>
              Flavors<b>{store.flavors.length}</b>
            </li>
            <li>
              Occasions<b>{store.occ.length}</b>
            </li>
            <li>
              Decorations<b>{store.decos.length}</b>
            </li>
            <li>
              Add-ons<b>{store.addons.length}</b>
            </li>
          </ul>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('cake')}
          >
            Edit Cake Studio →
          </button>
        </div>

        <div className="za-card">
          <h3>
            🖼️ Gallery &amp; Reviews
            <span className={`za-ck ${has('gallery') ? '' : 'w'}`}>
              {has('gallery') ? '✓ Ready' : 'Needs attention'}
            </span>
          </h3>
          <ul>
            <li>
              Gallery photos<b>{store.gallery.length}</b>
            </li>
            <li>
              Customer reviews<b>{store.reviews.length}</b>
            </li>
            <li>
              Average rating
              <b>
                {(
                  store.reviews.reduce((a, r) => a + r.rating, 0) /
                  (store.reviews.length || 1)
                ).toFixed(1)}{' '}
                ★
              </b>
            </li>
          </ul>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('gallery')}
          >
            Edit Gallery &amp; Reviews →
          </button>
        </div>

        <div className="za-card">
          <h3>
            📝 Pages
            <span className="za-ck">✓ Ready</span>
          </h3>
          <ul>
            <li>
              Menu · Cakes · About<b>3 banners</b>
            </li>
            <li>
              Contact · Reviews<b>2 banners</b>
            </li>
          </ul>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('pages')}
          >
            Edit Pages →
          </button>
        </div>

        <div className="za-card">
          <h3>
            📍 Business &amp; Delivery
            <span className={`za-ck ${has('biz') ? '' : 'w'}`}>
              {has('biz') ? '✓ Ready' : 'Needs attention'}
            </span>
          </h3>
          <ul>
            <li>
              Opening hours rows<b>{store.hours.length}</b>
            </li>
            <li>
              Delivery zones<b>{store.zones.length}</b>
            </li>
            <li>
              FAQ questions<b>{store.faq.length}</b>
            </li>
          </ul>
          <button
            type="button"
            className="za-btn za-b3"
            onClick={() => onNavigateTab('biz')}
          >
            Edit Business &amp; Delivery →
          </button>
        </div>
      </div>

      {/* Needs Attention */}
      {miss.length > 0 && (
        <section className="za-sec" style={{ marginTop: '18px' }}>
          <div className="za-sh">
            <div>
              <h2>Needs attention</h2>
              <p>Tap to jump straight to the item.</p>
            </div>
          </div>
          {miss.slice(0, 8).map((m, i) => (
            <div key={i} className="za-ap">
              <span>⚠️ {m[1]}</span>
              <button
                type="button"
                className="za-btn za-b3"
                onClick={() => onNavigateTab(m[0])}
              >
                Fix
              </button>
            </div>
          ))}
          {miss.length > 8 && (
            <p className="za-hint" style={{ marginTop: '10px' }}>
              + {miss.length - 8} more
            </p>
          )}
        </section>
      )}

      {/* Backup and restore */}
      <section className="za-sec" style={{ marginTop: '18px' }}>
        <div className="za-sh">
          <div>
            <h2>Your data</h2>
            <p>
              Changes save automatically in this browser. Use Export to copy
              everything as JSON, or Import to restore it.
            </p>
          </div>
        </div>
        <div className="za-acts" style={{ margin: 0 }}>
          <button
            type="button"
            className="za-btn za-b2"
            onClick={onOpenIoModal}
          >
            ⇅ Export / Import
          </button>
          <button
            type="button"
            className="za-btn za-b3 za-bd"
            onClick={onOpenResetModal}
          >
            ↺ Reset to original site content
          </button>
        </div>
      </section>
    </div>
  );
};
