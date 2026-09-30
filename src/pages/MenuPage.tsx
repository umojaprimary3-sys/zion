import React, { useState, useMemo } from 'react';
import { PageId, MenuCategory } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { MENU_ITEMS, MENU_CATEGORIES } from '../data/menuData';

interface MenuPageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: (itemName?: string) => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <>
      {/* PAGE HEADER */}
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage="menu"
            onNavigate={onNavigate}
            onOpenOrderModal={() => onOpenOrderModal()}
          />

          <div className="page-title-section">
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              FRESHLY BAKED & COOKED IN MBEYA
            </div>
            <h1>Our Full Menu</h1>
            <p>
              Handcrafted celebration cakes, oven-baked pizza, sizzling shawarma, hearty chicken, fresh cookies, and cold-pressed juices.
            </p>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH */}
      <section style={{ padding: '20px 20px 60px' }}>
        <div className="wrap">
          {/* Search bar */}
          <div className="search-input-wrap">
            <span className="search-icon-pos">🔍</span>
            <input
              type="text"
              className="search-input-field"
              placeholder="Search cakes, pizza, shawarma, juice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="category-filter-bar" id="menu-category-tabs">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`category-tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id as MenuCategory)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Items count */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            <span>Showing <b>{filteredItems.length}</b> fresh items</span>
            <button
              type="button"
              onClick={() => onNavigate('custom-cakes')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dark)',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Looking for a Custom Cake? Click here ↗
            </button>
          </div>

          {/* Menu Grid */}
          {filteredItems.length === 0 ? (
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '20px',
                padding: '50px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🍽️</div>
              <h3 style={{ fontFamily: 'Fredoka, sans-serif', color: 'var(--text-dark)', marginBottom: '6px' }}>
                No items found for "{searchQuery}"
              </h3>
              <p style={{ fontSize: '13px', marginBottom: '16px' }}>
                Try searching for another dish or clear the filter.
              </p>
              <button
                type="button"
                className="btn-solid"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Show All Menu Items
              </button>
            </div>
          ) : (
            <div className="menu-grid" id="full-menu-items-grid">
              {filteredItems.map((item) => (
                <div className="menu-card" key={item.id} id={`menu-item-${item.id}`}>
                  <div className="menu-card-img-wrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    {item.popular && (
                      <span className="menu-card-badge">★ Favorite</span>
                    )}
                    <span className="menu-card-price-pill">{item.priceDisplay}</span>
                  </div>

                  <div className="menu-card-body">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>

                    <div className="menu-card-meta">
                      <span>{item.serves ? `🍽️ ${item.serves}` : '✨ Made to order'}</span>
                      <button
                        type="button"
                        className="btn-solid"
                        style={{ padding: '8px 16px', fontSize: '12.5px' }}
                        onClick={() => onOpenOrderModal(item.name)}
                      >
                        Order ↗
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATS BAR */}
          <div className="stats-bar" style={{ marginTop: '50px' }}>
            <div>★ <b>4.1/5</b> · Google Rating (87 reviews)</div>
            <div><b>6,896+</b> · Instagram Community</div>
            <div><b>Dine-in · Pickup · Delivery</b> · Across Mbeya</div>
          </div>

          {/* CTA BANNER */}
          <div className="cta-banner" style={{ marginTop: '30px' }}>
            <div>
              <h3>Craving something special today?</h3>
              <p style={{ fontSize: '13px', color: '#3d362c', marginTop: '4px' }}>
                Chat directly with our kitchen in Mbeya for immediate takeaway or city delivery.
              </p>
            </div>
            <div className="cta-actions">
              <button
                className="btn-solid"
                type="button"
                onClick={() => onOpenOrderModal()}
              >
                Order on WhatsApp
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => onNavigate('custom-cakes')}
              >
                Custom Cake Preorders ↗
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
