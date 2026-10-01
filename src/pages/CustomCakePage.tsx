import React, { useState } from 'react';
import { PageId } from '../types';
import { HeaderNav } from '../components/HeaderNav';
import {
  CAKE_FLAVORS,
  CAKE_SIZES,
  CAKE_OCCASIONS,
  CAKE_DECORATIONS,
} from '../data/cakeData';
import { RESTAURANT_INFO, DELIVERY_ZONES } from '../data/locationData';
import { useContent, saveOrderToStore, generateOrderId, formatWhatsAppNumber, formatMoney } from '../data/store';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface CustomCakePageProps {
  onNavigate: (page: PageId) => void;
  onOpenOrderModal: (itemName?: string) => void;
}

export const CustomCakePage: React.FC<CustomCakePageProps> = ({
  onNavigate,
  onOpenOrderModal,
}) => {
  const content = useContent();
  const { user, member, isLoggedIn, refreshCustomerData } = useCustomerAuth();

  const flavorsList = (content.flavors && content.flavors.length > 0)
    ? content.flavors.map((f, i) => ({
        id: `flavor-${i}`,
        name: f.name,
        description: f.description,
        accentColor: f.color,
        badge: f.badge,
      }))
    : CAKE_FLAVORS;

  const sizesList = (content.sizes && content.sizes.length > 0)
    ? content.sizes.map((s, i) => ({
        id: `size-${i}`,
        name: s.name,
        weight: s.weight,
        servings: s.servings,
        basePrice: s.price,
        basePriceDisplay: formatMoney(s.price),
        description: s.description,
      }))
    : CAKE_SIZES;

  const occList = (content.occ && content.occ.length > 0)
    ? content.occ.map((o, i) => ({
        id: `occ-${i}`,
        label: o.label,
        icon: o.icon,
      }))
    : CAKE_OCCASIONS;

  const decosList = (content.decos && content.decos.length > 0)
    ? content.decos.map((d, i) => ({
        id: `deco-${i}`,
        label: d.label,
        extra: d.extra,
        extraDisplay: d.extra === 0 ? 'Included (Free)' : `+${formatMoney(d.extra)}`,
      }))
    : CAKE_DECORATIONS;

  const zonesList = (content.zones && content.zones.length > 0)
    ? content.zones
    : DELIVERY_ZONES;

  const [selectedFlavor, setSelectedFlavor] = useState(flavorsList[0]);
  const [selectedSize, setSelectedSize] = useState(sizesList[0]);
  const [selectedOccasion, setSelectedOccasion] = useState(occList[0]);
  const [selectedDecoration, setSelectedDecoration] = useState(decosList[0]);
  const [cakeMessage, setCakeMessage] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryZone, setDeliveryZone] = useState(zonesList[0]?.name || 'Njia Panda & Hospitali Zone');
  const [customerName, setCustomerName] = useState(member?.name || user?.user_metadata?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(member?.phone || user?.user_metadata?.phone || '');
  const [dateNeeded, setDateNeeded] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Auto-sync customer info if auth loads after mount
  React.useEffect(() => {
    if (isLoggedIn) {
      if (!customerName && (member?.name || user?.user_metadata?.full_name)) {
        setCustomerName(member?.name || user?.user_metadata?.full_name || '');
      }
      if (!customerPhone && (member?.phone || user?.user_metadata?.phone)) {
        setCustomerPhone(member?.phone || user?.user_metadata?.phone || '');
      }
    }
  }, [isLoggedIn, member, user]);

  const totalPrice = (selectedSize?.basePrice || 45000) + (selectedDecoration?.extra || 0);
  const totalPriceDisplay = formatMoney(totalPrice);

  const banner = content.banners?.cake;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError('');
    
    // Format WhatsApp prefilled message
    let msg = `🎂 *ZION CUSTOM CAKE PREORDER* 🎂\n\n`;
    msg += `*Customer Name:* ${customerName || 'Valued Customer'}\n`;
    msg += `*Phone:* ${customerPhone || 'Not specified'}\n`;
    msg += `*Date Needed:* ${dateNeeded || 'Earliest available'}\n`;
    msg += `*Order Fulfillment:* ${deliveryType.toUpperCase()} ${deliveryType === 'delivery' ? `(${deliveryZone})` : '(Store Pickup)'}\n\n`;
    msg += `*Selected Flavor:* ${selectedFlavor.name}\n`;
    msg += `*Selected Size:* ${selectedSize.name} (${selectedSize.weight} / ${selectedSize.servings})\n`;
    msg += `*Occasion:* ${selectedOccasion.label}\n`;
    msg += `*Decoration Style:* ${selectedDecoration.label}\n`;
    if (cakeMessage.trim()) {
      msg += `*Custom Message on Cake:* "${cakeMessage.trim()}"\n`;
    }
    if (specialInstructions.trim()) {
      msg += `*Special Notes:* ${specialInstructions.trim()}\n`;
    }
    msg += `\n*Estimated Total:* ${totalPriceDisplay}\n\n`;
    msg += `Sent from Zion Cakes & Bites App · Mbeya`;

    // Save order record to Supabase store
    const todayStr = new Date().toISOString().slice(0, 10);
    const orderId = generateOrderId(content.cfg?.prefix || 'ZN', content.orders || []);
    let itemsDetail = `Custom cake · ${selectedFlavor.name} · ${selectedSize.weight} · ${selectedOccasion.label}`;
    if (cakeMessage.trim()) {
      itemsDetail += `\nMessage: "${cakeMessage.trim()}"`;
    }
    if (selectedDecoration.label) {
      itemsDetail += `\nDecoration: ${selectedDecoration.label}`;
    }

    try {
      await saveOrderToStore({
        id: orderId,
        user_id: user?.id,
        member_id: member?.id,
        type: 'cake',
        status: 'new',
        name: customerName || member?.name || 'Valued Customer',
        phone: customerPhone,
        email: user?.email || '',
        zone: deliveryType === 'delivery' ? deliveryZone : '—',
        items: itemsDetail,
        total: totalPrice,
        pay: 'unpaid',
        date: dateNeeded || todayStr,
        notes: specialInstructions,
        src: isLoggedIn ? 'Custom Cake Studio (Customer Account)' : 'Custom Cake Studio',
      });
      if (isLoggedIn) {
        refreshCustomerData();
      }
    } catch (err: unknown) {
      console.warn('Could not persist order to Supabase:', err);
    }

    const waNum = formatWhatsAppNumber(content.biz?.whatsapp) || RESTAURANT_INFO.whatsappNumber;
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${waNum}?text=${encoded}`;
    
    setIsSubmitting(false);
    setOrderSuccess(true);
    window.open(url, '_blank');
  };

  return (
    <>
      {/* PAGE HEADER */}
      <section className="page-header-banner">
        <div className="page-header-card">
          <HeaderNav
            currentPage="custom-cakes"
            onNavigate={onNavigate}
            onOpenOrderModal={() => onOpenOrderModal()}
          />

          <div className="page-title-section">
            <div className="eyebrow" style={{ color: 'var(--terracotta)' }}>
              {banner?.eyebrow || 'HANDMADE CELEBRATION CAKES · MBEYA'}
            </div>
            <h1>{banner?.title || 'Custom Cake Studio'}</h1>
            <p>
              {banner?.text || 'Design your dream celebration cake in 5 simple steps. Select from 12 gourmet flavors, 4 party sizes, bespoke toppings, and custom inscriptions.'}
            </p>
          </div>
        </div>
      </section>

      {/* SIGNATURE HERO CARD BANNER */}
      <section style={{ padding: '0 20px 30px' }}>
        <div className="wrap">
          <div
            style={{
              background: 'linear-gradient(135deg, #241c15, #1c1611)',
              borderRadius: '24px',
              padding: '30px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <div style={{ maxWidth: '540px' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: 'var(--orange)',
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '999px',
                  marginBottom: '10px',
                }}
              >
                MBEYA'S FAVORITE BAKERY
              </div>
              <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '28px', marginBottom: '8px' }}>
                Signature Celebration Cake
              </h2>
              <div style={{ color: 'var(--terracotta)', fontSize: '13px', marginBottom: '12px' }}>
                📍 {content.biz?.address1 || 'Forest Mpya, Maghorofani'}, {content.biz?.address2 || 'Mbeya'} · Baked Fresh Daily
              </div>
              <p style={{ color: '#cfc6b8', fontSize: '13.5px', lineHeight: '1.5', marginBottom: '16px' }}>
                Every cake is baked from scratch with pure dairy butter, farm-fresh eggs, and premium chocolate. No artificial preservatives.
              </p>
              <div className="signature-meta" style={{ margin: 0, color: '#e9e3d8' }}>
                <div>
                  <b>{content.home?.sig?.m0 || 'Fresh daily'}</b>
                  <span>Small batches</span>
                </div>
                <div>
                  <b>{content.home?.sig?.m1 || '4 sizes'}</b>
                  <span>1kg to 2-Tier</span>
                </div>
                <div>
                  <b>{content.home?.sig?.m2 || '12 flavors'}</b>
                  <span>Custom recipes</span>
                </div>
              </div>
            </div>

            <div
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
                width: '320px',
                height: '200px',
                flexShrink: 0,
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              }}
            >
              <img
                src={content.home?.hero?.image || "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=800&auto=format&fit=crop"}
                alt="Signature cake"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CAKE BUILDER FORM */}
      <section style={{ padding: '0 20px 80px' }}>
        <div className="wrap">
          {orderSuccess && (
            <div
              style={{
                background: 'var(--mint)',
                border: '2px solid var(--green-dark)',
                borderRadius: '18px',
                padding: '20px 24px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <b style={{ color: '#12321f', fontSize: '16px' }}>
                  ✓ WhatsApp Cake Preorder Link Opened!
                </b>
                <p style={{ fontSize: '13px', color: '#12321f', marginTop: '4px' }}>
                  Your custom cake configuration has been formatted. Complete your chat with our bakery team to confirm pickup or delivery time.
                </p>
              </div>
              <button
                type="button"
                className="btn-solid"
                onClick={() => setOrderSuccess(false)}
              >
                Configure Another Cake
              </button>
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="cake-builder-grid">
            {/* LEFT COLUMN: BUILDER STEPS */}
            <div>
              {/* STEP 1: SELECT FLAVOR */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">1</div>
                  <h3>Choose Your Cake Flavor ({flavorsList.length} Available)</h3>
                </div>
                <div className="flavors-grid">
                  {flavorsList.map((flavor) => (
                    <div
                      key={flavor.id}
                      className={`flavor-item ${selectedFlavor?.id === flavor.id ? 'selected' : ''}`}
                      onClick={() => setSelectedFlavor(flavor)}
                    >
                      {flavor.badge && (
                        <span className="flavor-badge">{flavor.badge}</span>
                      )}
                      <div className="flavor-name">
                        <span
                          className="flavor-dot"
                          style={{ backgroundColor: flavor.accentColor }}
                        />
                        {flavor.name}
                      </div>
                      <div className="flavor-desc">{flavor.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 2: SELECT SIZE */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">2</div>
                  <h3>Select Cake Size & Weight</h3>
                </div>
                <div className="sizes-grid">
                  {sizesList.map((size) => (
                    <div
                      key={size.id}
                      className={`size-item ${selectedSize?.id === size.id ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <div className="size-top">
                        <span className="size-name">{size.name}</span>
                        <span className="size-price">{size.basePriceDisplay}</span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>
                        ⚖️ {size.weight} · 🍰 {size.servings}
                      </div>
                      <div className="size-meta">{size.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 3: OCCASION & DECORATION */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">3</div>
                  <h3>Occasion & Decoration Finish</h3>
                </div>

                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  What are you celebrating?
                </label>
                <div className="occasions-wrap" style={{ marginBottom: '20px' }}>
                  {occList.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      className={`occasion-chip ${selectedOccasion?.id === occ.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOccasion(occ)}
                    >
                      <span>{occ.icon}</span>
                      <span>{occ.label}</span>
                    </button>
                  ))}
                </div>

                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Topping & Finishing Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {decosList.map((dec) => (
                    <div
                      key={dec.id}
                      className={`size-item ${selectedDecoration?.id === dec.id ? 'selected' : ''}`}
                      onClick={() => setSelectedDecoration(dec)}
                      style={{ padding: '12px' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{dec.label}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--green-dark)', fontWeight: 600, marginTop: '2px' }}>
                        {dec.extraDisplay}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 4: CUSTOM MESSAGE */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">4</div>
                  <h3>Piped Message & Special Requests</h3>
                </div>

                <div className="form-group">
                  <label>Custom Text on Cake (Free of charge)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Happy 30th Birthday Baraka!"
                    value={cakeMessage}
                    onChange={(e) => setCakeMessage(e.target.value)}
                  />
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    We pipe your text with fresh chocolate lettering or royal icing plaque.
                  </span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Additional Notes / Color Theme / Specific Requests</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g., Gold and pink theme, please add birthday candle pack"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>
              </div>

              {/* STEP 5: CUSTOMER & DATE DETAILS */}
              <div className="step-card">
                <div className="step-header">
                  <div className="step-number">5</div>
                  <h3>Contact & Date Needed</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Your Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Neema Mwambene"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp / Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g., 0768 000 111"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Date Needed *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dateNeeded}
                      onChange={(e) => setDateNeeded(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Pickup or Delivery in Mbeya?</label>
                    <select
                      className="form-select"
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value as 'pickup' | 'delivery')}
                    >
                      <option value="pickup">Store Pickup ({content.biz?.address1 || 'Forest Mpya, Maghorofani'})</option>
                      <option value="delivery">City Delivery to my location</option>
                    </select>
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Select Delivery Area in Mbeya</label>
                    <select
                      className="form-select"
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                    >
                      {zonesList.map((zone) => (
                        <option key={zone.name} value={zone.name}>
                          {zone.name} ({zone.fee})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE CAKE SUMMARY & ORDER BUTTON */}
            <div>
              <div className="cake-summary-card">
                <h3>Order Configuration</h3>

                <div className="summary-row">
                  <span>Flavor:</span>
                  <b>{selectedFlavor?.name}</b>
                </div>

                <div className="summary-row">
                  <span>Size & Slices:</span>
                  <b>{selectedSize?.name} ({selectedSize?.weight})</b>
                </div>

                <div className="summary-row">
                  <span>Servings:</span>
                  <b>{selectedSize?.servings}</b>
                </div>

                <div className="summary-row">
                  <span>Occasion:</span>
                  <b>{selectedOccasion?.label}</b>
                </div>

                <div className="summary-row">
                  <span>Finish:</span>
                  <b>{selectedDecoration?.label}</b>
                </div>

                {cakeMessage && (
                  <div className="summary-row">
                    <span>Message:</span>
                    <b style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>"{cakeMessage}"</b>
                  </div>
                )}

                <div className="summary-row">
                  <span>Fulfillment:</span>
                  <b>{deliveryType === 'pickup' ? 'Store Pickup' : `Delivery (${deliveryZone})`}</b>
                </div>

                <div className="summary-total">
                  <span className="summary-total-label">Estimated Total:</span>
                  <span className="summary-total-val">{totalPriceDisplay}</span>
                </div>

                <p style={{ fontSize: '11.5px', color: '#a89f90', marginTop: '12px', lineHeight: '1.4' }}>
                  Includes food-safe cake board, decorative transparent window box, and celebration ribbon.
                </p>

                <button
                  type="submit"
                  className="btn-solid"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '15px',
                    marginTop: '20px',
                    justifyContent: 'center',
                  }}
                >
                  Preorder on WhatsApp ↗
                </button>

                <div
                  style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: '#cfc6b8',
                  }}
                >
                  📞 Prefer calling? <b>{content.biz?.phone || '+255 768 000 111'}</b>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};
