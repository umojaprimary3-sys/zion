import React, { useState, useEffect, useRef } from 'react';
import { useModalA11y } from '../lib/useModalA11y';
import { DELIVERY_ZONES } from '../data/locationData';
import { waLink, bt } from '../lib/biz';
import { PaymentInfo } from './PaymentInfo';
import { PageId } from '../types';
import { useContent, saveOrderToStore, generateOrderId, formatWhatsAppNumber } from '../data/store';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
  initialItemName?: string;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  initialItemName,
  onOpenAuthModal,
}) => {
  const content = useContent();
  const { user, member, isLoggedIn, refreshCustomerData } = useCustomerAuth();
  const zonesList = content.zones && content.zones.length > 0 ? content.zones : DELIVERY_ZONES;

  const [orderType, setOrderType] = useState<'delivery' | 'pickup' | 'custom-cake'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState(initialItemName ? `1x ${initialItemName}` : '');
  const [selectedZone, setSelectedZone] = useState(zonesList[0]?.name || 'Njia Panda & Hospitali Zone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Prefill details if customer is logged in
  useEffect(() => {
    if (isOpen) {
      if (initialItemName) {
        setOrderNotes(`1x ${initialItemName}`);
      }
      if (isLoggedIn) {
        if (!customerName) {
          setCustomerName(member?.name || user?.user_metadata?.full_name || '');
        }
        if (!customerPhone) {
          setCustomerPhone(member?.phone || user?.user_metadata?.phone || '');
        }
        if (member?.area) {
          // If member has saved area, match zone if possible
          const matched = zonesList.find((z) => member.area.toLowerCase().includes(z.name.toLowerCase()));
          if (matched) setSelectedZone(matched.name);
        }
      }
    }
  }, [isOpen, isLoggedIn, member, user, initialItemName, zonesList]);

  const dialogRef = useRef<HTMLDivElement>(null);
  useModalA11y(isOpen, onClose, dialogRef);

  if (!isOpen) return null;

  const handleWhatsAppSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const nameStr = customerName.trim() || member?.name || 'Valued Customer';
    let text = `${content.biz?.orderGreeting || 'Hello!'}\n\n`;
    text += `*Customer:* ${nameStr}\n`;
    if (customerPhone.trim()) {
      text += `*Phone:* ${customerPhone.trim()}\n`;
    }
    text += `*Order Type:* ${orderType.toUpperCase()}\n`;
    if (orderType === 'delivery') {
      text += `*Delivery Location:* ${selectedZone}\n`;
    }
    text += `*Order Items / Request:*\n${orderNotes || 'Please share your daily specials'}\n\n`;
    text += `Sent from ${content.biz?.name || 'our website'}`;

    // Save order record to Supabase store
    const todayStr = new Date().toISOString().slice(0, 10);
    const orderId = generateOrderId(content.cfg?.prefix || 'ZN', content.orders || []);

    try {
      await saveOrderToStore({
        id: orderId,
        user_id: user?.id,
        member_id: member?.id,
        type: orderType === 'custom-cake' ? 'cake' : orderType,
        status: 'new',
        name: nameStr,
        phone: customerPhone.trim(),
        email: user?.email || '',
        zone: orderType === 'delivery' ? selectedZone : '—',
        items: orderNotes || 'Daily specials inquiry',
        total: 0,
        pay: 'unpaid',
        date: todayStr,
        notes: '',
        src: isLoggedIn ? 'Customer Account Pop-up' : 'Website order pop-up',
      });
      if (isLoggedIn) {
        refreshCustomerData();
      }
    } catch (err: unknown) {
      console.warn('Order saved locally/fallback warning:', err);
    }

    const url = waLink(content.biz, text);
    setIsSubmitting(false);
    if (url) {
      window.open(url, '_blank');
    } else {
      window.alert('Thank you! Your order has been received. We will contact you shortly.');
    }
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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={content.pg?.order?.title || 'Place your order'}
        tabIndex={-1}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '22px' }}>
              {content.pg?.order?.title || 'Place your order'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              {content.pg?.order?.text || 'Direct ordering on WhatsApp with instant kitchen dispatch.'}
            </p>
          </div>
          <button aria-label="Close"
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

        {isLoggedIn ? (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #bbf7d0',
            }}
          >
            <span>✓ Ordering as <strong>{member?.name || user?.user_metadata?.full_name || 'Customer'}</strong></span>
            <span style={{ fontSize: '11px', opacity: 0.85 }}>Saved to Account</span>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(0,0,0,0.04)',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Guest Checkout · No account needed</span>
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal('login');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--orange)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Sign In ↗
              </button>
            )}
          </div>
        )}

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

          <div className="form-group">
            <label>Phone / WhatsApp Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          {orderType === 'delivery' && (
            <div className="form-group">
              <label>{bt(content.biz, 'Delivery Area in Mbeya')}</label>
              <select
                className="form-select"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
              >
                {zonesList.map((zone) => (
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

          <PaymentInfo compact />
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
            {waLink(content.biz) ? bt(content.biz, '💬 Clicking below will open WhatsApp with your pre-filled message sent straight to our Mbeya kitchen team!') : 'Your order is saved instantly and our team will contact you to confirm.'}
          </div>

          <button
            type="submit"
            className="btn-solid"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            {content.pg?.order?.btn || 'Send Order to WhatsApp ↗'}
          </button>
        </form>
      </div>
    </div>
  );
};
