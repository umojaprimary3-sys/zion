import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { OrderRecord, formatMoney, formatWhatsAppNumber } from '../data/store';
import { RESTAURANT_INFO } from '../data/locationData';

interface CustomerAccountPageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: (itemName?: string) => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

const ORDER_STATUS_MAP: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  new: { label: 'Order Placed', icon: '🆕', color: '#1e40af', bg: '#dbeafe' },
  confirmed: { label: 'Confirmed', icon: '✅', color: '#065f46', bg: '#d1fae5' },
  preparing: { label: 'In Kitchen Preparing', icon: '👩‍🍳', color: '#92400e', bg: '#fef3c7' },
  ready: { label: 'Ready for Pickup', icon: '🛍️', color: '#047857', bg: '#ecfdf5' },
  out: { label: 'Out for Delivery', icon: '🛵', color: '#c2410c', bg: '#ffedd5' },
  done: { label: 'Delivered / Completed', icon: '🎉', color: '#15803d', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', icon: '✖', color: '#991b1b', bg: '#fee2e2' },
};

const TIMELINE_STEPS = [
  { key: 'new', label: 'Order Placed', desc: 'Received by kitchen' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Order approved' },
  { key: 'preparing', label: 'Preparing', desc: 'Baking & cooking' },
  { key: 'ready_or_out', label: 'Ready / Dispatch', desc: 'Packed or on the way' },
  { key: 'done', label: 'Completed', desc: 'Delivered / Picked up' },
];

function getTimelineIndex(status: string): number {
  switch (status) {
    case 'new':
      return 0;
    case 'confirmed':
      return 1;
    case 'preparing':
      return 2;
    case 'ready':
    case 'out':
      return 3;
    case 'done':
      return 4;
    default:
      return -1;
  }
}

export const CustomerAccountPage: React.FC<CustomerAccountPageProps> = ({
  onNavigate,
  onOpenOrderModal,
  onOpenAuthModal,
}) => {
  const {
    user,
    member,
    customerOrders,
    isLoggedIn,
    signOut,
    updateProfile,
    updatePassword,
  } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'done'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Profile Form state
  const [editName, setEditName] = useState(member?.name || user?.user_metadata?.full_name || '');
  const [editPhone, setEditPhone] = useState(member?.phone || user?.user_metadata?.phone || '');
  const [editArea, setEditArea] = useState(member?.area || user?.user_metadata?.area || '');
  const [editBirthday, setEditBirthday] = useState(member?.birthday || user?.user_metadata?.birthday || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Compute stats
  const totalSpent = customerOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const loyaltyTier = totalSpent >= 300000 ? 'Gold VIP' : totalSpent >= 100000 ? 'Silver Regular' : 'Bronze Member';

  // Filter orders
  const filteredOrders = customerOrders.filter((o) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'active') return ['new', 'confirmed', 'preparing', 'ready', 'out'].includes(o.status);
    if (orderFilter === 'done') return ['done', 'cancelled'].includes(o.status);
    return true;
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileToast(null);

    const res = await updateProfile({
      name: editName,
      phone: editPhone,
      area: editArea,
      birthday: editBirthday,
    });

    setProfileSaving(false);
    if (res.success) {
      setProfileToast({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setProfileToast(null), 3500);
    } else {
      setProfileToast({ type: 'error', message: res.error || 'Failed to update profile.' });
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordToast({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordToast(null);

    const res = await updatePassword(newPassword);
    setPasswordSaving(false);

    if (res.success) {
      setPasswordToast({ type: 'success', message: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordToast(null), 3500);
    } else {
      setPasswordToast({ type: 'error', message: res.error || 'Failed to update password.' });
    }
  };

  // If user is not logged in, show an inviting prompt
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <section className="page-header-banner">
          <div className="page-header-card">
            <HeaderNav
              currentPage="account"
              onNavigate={onNavigate}
              onOpenOrderModal={() => onOpenOrderModal()}
            />
            <div className="page-title-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
                ZION CUSTOMER PORTAL
              </div>
              <h1 style={{ fontSize: '32px', marginBottom: '12px' }}>Customer Account & Orders</h1>
              <p style={{ maxWidth: '540px', margin: '0 auto 24px', color: '#cfc6b8' }}>
                Log in to view your orders, track delivery status in real-time, view past custom cake designs, and manage your delivery details.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-solid"
                  onClick={() => onOpenAuthModal('login')}
                  style={{ minWidth: '150px' }}
                >
                  <span>Sign In</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => onOpenAuthModal('register')}
                  style={{ minWidth: '160px', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
                >
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px 80px' }}>
          <div className="wrap" style={{ maxWidth: '800px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
                marginTop: '10px',
              }}
            >
              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧾</div>
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Track Your Orders</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  See real-time progress from the moment your cake or meal is baked to delivery at your doorstep.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Zion Loyalty Club</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Earn member tiers, birthday surprises, and special custom cake perks with every order in Mbeya.
                </p>
              </div>

              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚡</div>
                <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Faster Checkout</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Save your delivery address and contact information for effortless 1-click WhatsApp ordering.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const customerDisplayName = member?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';

  return (
    <div className="min-h-screen flex flex-col">
      {/* PAGE HEADER */}
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage="account"
            onNavigate={onNavigate}
            onOpenOrderModal={() => onOpenOrderModal()}
          />

          {/* User Banner Card */}
          <div
            style={{
              padding: '28px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              marginTop: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: 'var(--terracotta)',
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'Fredoka, sans-serif',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                }}
              >
                {customerDisplayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '24px', color: '#fff', margin: 0, fontFamily: 'Fredoka, sans-serif' }}>
                    {customerDisplayName}
                  </h1>
                  <span
                    style={{
                      background: 'rgba(232, 179, 116, 0.2)',
                      color: 'var(--terracotta)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: '1px solid rgba(232, 179, 116, 0.4)',
                    }}
                  >
                    👑 {loyaltyTier}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#cfc6b8', marginTop: '2px' }}>
                  {user?.email} {member?.phone ? `· 📞 ${member.phone}` : ''} {member?.area ? `· 📍 ${member.area}` : ''}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-solid"
                onClick={() => onOpenOrderModal()}
                style={{ padding: '10px 18px', fontSize: '13.5px' }}
              >
                <span>+ Place New Order</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  onNavigate('home');
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section style={{ padding: '30px 20px 80px' }}>
        <div className="wrap" style={{ maxWidth: '1000px' }}>
          {/* NAVIGATION TABS */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              borderBottom: '2px solid rgba(36,28,21,0.08)',
              paddingBottom: '12px',
              marginBottom: '26px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                background: activeTab === 'orders' ? 'var(--dark)' : 'transparent',
                color: activeTab === 'orders' ? '#fff' : 'var(--text-dark)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>🧾 My Orders</span>
              <span
                style={{
                  background: activeTab === 'orders' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                }}
              >
                {customerOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                background: activeTab === 'profile' ? 'var(--dark)' : 'transparent',
                color: activeTab === 'profile' ? '#fff' : 'var(--text-dark)',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>👤 Profile & Delivery Info</span>
            </button>
          </div>

          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div>
              {/* Order filters & stats header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setOrderFilter('all')}
                    className={`occasion-chip ${orderFilter === 'all' ? 'selected' : ''}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    All Orders ({customerOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter('active')}
                    className={`occasion-chip ${orderFilter === 'active' ? 'selected' : ''}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    Active / Kitchen ({customerOrders.filter((o) => ['new', 'confirmed', 'preparing', 'ready', 'out'].includes(o.status)).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter('done')}
                    className={`occasion-chip ${orderFilter === 'done' ? 'selected' : ''}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    Completed ({customerOrders.filter((o) => ['done', 'cancelled'].includes(o.status)).length})
                  </button>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Total Lifetime Spent: <strong style={{ color: 'var(--text-dark)' }}>{formatMoney(totalSpent)}</strong>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: '24px',
                    padding: '48px 24px',
                    textAlign: 'center',
                    border: '1px dashed rgba(0,0,0,0.15)',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍰</div>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No orders found</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
                    {orderFilter === 'all'
                      ? "You haven't placed an order yet. Treat yourself to fresh cakes, pizza, shawarma or juice today!"
                      : 'No orders match this filter.'}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-solid"
                      onClick={() => onOpenOrderModal()}
                    >
                      <span>Quick Order ↗</span>
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => onNavigate('custom-cakes')}
                    >
                      <span>Design Custom Cake 🎂</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredOrders.map((order) => {
                    const statusConfig = ORDER_STATUS_MAP[order.status] || {
                      label: order.status,
                      icon: '📋',
                      color: '#4b5563',
                      bg: '#f3f4f6',
                    };

                    return (
                      <div
                        key={order.id}
                        style={{
                          background: 'var(--card)',
                          borderRadius: '20px',
                          padding: '22px',
                          border: '1px solid rgba(0,0,0,0.06)',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                        }}
                      >
                        {/* Top row: ID, Date, Status */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '10px',
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            paddingBottom: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                fontFamily: 'Fredoka, sans-serif',
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'var(--text-dark)',
                              }}
                            >
                              Order #{order.id}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              📅 {order.date || 'Today'}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                background: order.type === 'cake' ? '#fdf2f8' : order.type === 'delivery' ? '#ecfdf5' : '#f0fdf4',
                                color: order.type === 'cake' ? '#be185d' : order.type === 'delivery' ? '#047857' : '#15803d',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                              }}
                            >
                              {order.type === 'cake' ? '🎂 Custom Cake' : order.type === 'delivery' ? '🛵 Delivery' : '🛍️ Pickup'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                background: statusConfig.bg,
                                color: statusConfig.color,
                                padding: '4px 12px',
                                borderRadius: '999px',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <span>{statusConfig.icon}</span>
                              <span>{statusConfig.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Middle row: Items preview & Location */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                          <div>
                            <div style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              Items Ordered
                            </div>
                            <div style={{ fontSize: '14px', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                              {order.items || 'Menu items'}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              Fulfillment & Destination
                            </div>
                            <div style={{ fontSize: '13.5px', color: 'var(--text-dark)' }}>
                              {order.type === 'delivery' ? (
                                <span>🛵 Delivery to: <strong>{order.zone}</strong></span>
                              ) : (
                                <span>🛍️ Direct Counter Pickup at Zion Store, Forest Mpya</span>
                              )}
                            </div>
                            {order.notes && (
                              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                                Notes: "{order.notes}"
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom row: Total, Payment badge, Details Button */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                            borderTop: '1px solid rgba(0,0,0,0.06)',
                            paddingTop: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>Total:</span>
                              <strong style={{ fontSize: '17px', color: 'var(--text-dark)' }}>
                                {order.total ? formatMoney(order.total) : 'Awaiting Quote'}
                              </strong>
                            </div>

                            <span
                              style={{
                                fontSize: '11.5px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                background: order.pay === 'paid' ? '#dcfce7' : order.pay === 'deposit' ? '#fef3c7' : '#fee2e2',
                                color: order.pay === 'paid' ? '#15803d' : order.pay === 'deposit' ? '#92400e' : '#991b1b',
                              }}
                            >
                              {order.pay === 'paid' ? '✓ Paid' : order.pay === 'deposit' ? '🪙 Deposit Paid' : '⏳ Unpaid'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              style={{
                                background: 'rgba(36,28,21,0.07)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '999px',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--text-dark)',
                                cursor: 'pointer',
                              }}
                            >
                              Track & Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE & DELIVERY SETTINGS */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Profile Details Form */}
              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: '24px',
                  padding: '28px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '20px', marginBottom: '6px' }}>
                  Personal & Delivery Details
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Keep your contact details up to date for fast WhatsApp notifications and smooth deliveries.
                </p>

                {profileToast && (
                  <div
                    style={{
                      background: profileToast.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: profileToast.type === 'success' ? '#166534' : '#991b1b',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      marginBottom: '16px',
                    }}
                  >
                    {profileToast.message}
                  </div>
                )}

                <form onSubmit={handleSaveProfile}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={user?.email || ''}
                      disabled
                      style={{ opacity: 0.7, background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                      Email is linked to your Supabase login.
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g., 0768 111 222"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Neighborhood / Delivery Zone
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Forest Mpya, Uyole, Soweto"
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Birthday (MM-DD)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 10-14"
                      value={editBirthday}
                      onChange={(e) => setEditBirthday(e.target.value)}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                      We send special birthday discounts to Zion members!
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="btn-solid"
                    disabled={profileSaving}
                    style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
                  >
                    {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password & Security Card */}
              <div
                style={{
                  background: 'var(--card)',
                  borderRadius: '24px',
                  padding: '28px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <h3 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '20px', marginBottom: '6px' }}>
                  Security & Password
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Update your account password anytime to keep your Zion customer account protected.
                </p>

                {passwordToast && (
                  <div
                    style={{
                      background: passwordToast.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: passwordToast.type === 'success' ? '#166534' : '#991b1b',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      marginBottom: '16px',
                    }}
                  >
                    {passwordToast.message}
                  </div>
                )}

                <form onSubmit={handleSavePassword}>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-outline"
                    disabled={passwordSaving}
                    style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
                  >
                    {passwordSaving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>

                <div
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    marginTop: '28px',
                    paddingTop: '20px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Need help with an order or have questions about delivery?
                  </div>
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(RESTAURANT_INFO.whatsappNumber)}?text=${encodeURIComponent('Hello Zion Bakery, I have a question about my customer account.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--orange)',
                      fontWeight: 600,
                    }}
                  >
                    <span>💬 Contact Zion Support on WhatsApp</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ORDER DETAILS & STATUS TIMELINE MODAL */}
      {selectedOrder && (
        <div
          className="mobile-nav-drawer-overlay"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 9999,
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              color: 'var(--text-dark)',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--orange)' }}>
                  Zion Order Tracking
                </span>
                <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', marginTop: '2px' }}>
                  Order #{selectedOrder.id}
                </h2>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Placed on {selectedOrder.date || 'Today'} · {selectedOrder.src || 'Website'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
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

            {/* STATUS TIMELINE */}
            <div
              style={{
                background: 'rgba(255,255,255,0.7)',
                borderRadius: '16px',
                padding: '18px 14px',
                marginBottom: '20px',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Status Timeline
              </div>

              {selectedOrder.status === 'cancelled' ? (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '10px', fontSize: '13.5px' }}>
                  ✖ This order was cancelled. Please contact us on WhatsApp if you would like to re-order.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const currentIdx = getTimelineIndex(selectedOrder.status);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isCurrent ? 'var(--green)' : isPassed ? 'var(--green-dark)' : 'rgba(0,0,0,0.1)',
                            color: isPassed ? '#fff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: isCurrent ? 700 : isPassed ? 600 : 400,
                              color: isCurrent ? 'var(--text-dark)' : isPassed ? 'var(--text-dark)' : 'var(--text-muted)',
                            }}
                          >
                            {step.label} {isCurrent && <span style={{ color: 'var(--green-dark)', fontSize: '11px', fontWeight: 700 }}>— IN PROGRESS</span>}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {step.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ORDER ITEMS & DETAILS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Items in this Order
                </div>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.03)',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedOrder.items}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '2px' }}>Delivery Destination</div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{selectedOrder.zone || 'Store Pickup'}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '2px' }}>Payment Status</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                    {selectedOrder.pay === 'paid' ? '✅ Paid in Full' : selectedOrder.pay === 'deposit' ? '🪙 Deposit Received' : '⏳ Unpaid (Pay on Delivery)'}
                  </div>
                </div>
              </div>

              {selectedOrder.notes && (
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer Notes</div>
                  <div style={{ fontSize: '13px', fontStyle: 'italic' }}>"{selectedOrder.notes}"</div>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--dark)',
                  color: '#fff',
                  padding: '14px 18px',
                  borderRadius: '14px',
                }}
              >
                <span style={{ fontSize: '14px' }}>Order Total</span>
                <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'Fredoka, sans-serif' }}>
                  {selectedOrder.total ? formatMoney(selectedOrder.total) : 'Pending Confirmation'}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`https://wa.me/${formatWhatsAppNumber(RESTAURANT_INFO.whatsappNumber)}?text=${encodeURIComponent(`Hello Zion Cakes & Bites Mbeya! Inquiring about Order #${selectedOrder.id} (${selectedOrder.name}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-solid"
                style={{ flex: 1, justifyContent: 'center', fontSize: '14px' }}
              >
                <span>Inquire on WhatsApp</span>
                <span>↗</span>
              </a>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'rgba(36,28,21,0.08)',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
