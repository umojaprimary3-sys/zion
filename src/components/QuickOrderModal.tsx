import React, { useState } from 'react';
import { RESTAURANT_INFO, DELIVERY_ZONES } from '../data/locationData';
import { PageId } from '../types';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  initialItemName?: string;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialItemName,
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'custom-cake'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [orderNotes, setOrderNotes] = useState(initialItemName ? `1x ${initialItemName}` : '');
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0].name);

  if (!isOpen) return null;

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    const nameStr = customerName.trim() || 'Valued Customer';
    let text = `Hello Zion Cakes & Bites Mbeya!\n\n`;
    text += `*Customer:* ${nameStr}\n`;
    text += `*Order Type:* ${orderType.toUpperCase()}\n`;
    if (orderType === 'delivery') {
      text += `*Delivery Location:* ${selectedZone}\n`;
    }
    text += `*Order Items / Request:*\n${orderNotes || 'Please share your daily specials'}\n\n`;
    text += `Sent from Zion Cakes & Bites App`;

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div
      className="mobile-nav-drawer-overlay"
      style={{ alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          color: 'var(--text-dark)',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '22px' }}>
              Order with Zion Mbeya
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Direct ordering on WhatsApp with instant kitchen dispatch.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(36,28,21,0.08)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <button
            type="button"
            className={`occasion-chip ${orderType === 'delivery' ? 'selected' : ''}`}
            onClick={() => setOrderType('delivery')}
          >
            🛵 Delivery
          </button>
          <button
            type="button"
            className={`occasion-chip ${orderType === 'pickup' ? 'selected' : ''}`}
            onClick={() => setOrderType('pickup')}
          >
            🛍️ Pickup
          </button>
          <button
            type="button"
            className="occasion-chip"
            onClick={() => {
              onClose();
              onNavigate('custom-cakes');
            }}
          >
            🎂 Custom Cake
          </button>
        </div>

        <form onSubmit={handleWhatsAppSend}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Anna Mwambene"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          {orderType === 'delivery' && (
            <div className="form-group">
              <label>Delivery Area in Mbeya</label>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                {DELIVERY_ZONES.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} ({zone.fee})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>What would you like to order?</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., 1x Zion Supreme Meat & Veg Pizza, 2x Fresh Passion Juice, 1x Red Velvet Slice"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              background: 'var(--mint)',
              borderRadius: '14px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#12321f',
              marginBottom: '18px',
              lineHeight: '1.4',
            }}
          >
            💬 Clicking below will open WhatsApp with your pre-filled message sent straight to our Mbeya kitchen team!
          </div>

          <button
            type="submit"
            className="btn-solid"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            Send Order to WhatsApp ↗
          </button>
        </form>
      </div>
    </div>
  );
};
