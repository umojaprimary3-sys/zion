import React, { useState } from 'react';
import {
  StoreData,
  OrderRecord,
  formatMoney,
  formatWhatsAppNumber,
  generateOrderId,
} from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  NumberField,
  SelectField,
} from '../components/FormFields';

interface OrdersTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
  onComposeEmail: (to: string, subject: string) => void;
}

const STAT_OPTIONS: Array<[string, string]> = [
  ['new', '🆕 New'],
  ['confirmed', '✅ Confirmed'],
  ['preparing', '👩‍🍳 Preparing'],
  ['ready', '🛍️ Ready'],
  ['out', '🛵 On the way'],
  ['done', '🎉 Completed'],
  ['cancelled', '✖ Cancelled'],
];

const STAT_LABELS: Record<string, string> = Object.fromEntries(STAT_OPTIONS);

export const OrdersTab: React.FC<OrdersTabProps> = ({
  store,
  onUpdateStore,
  onToast,
  onComposeEmail,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const toggleKey = (k: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const orders = store.orders;
  const filteredOrders = orders.filter((o) =>
    filter === 'all' ? true : o.status === filter
  );

  const handleAddOrder = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const newId = generateOrderId(store.cfg.prefix || 'ZN', orders);
    const newOrder: OrderRecord = {
      id: newId,
      type: 'delivery',
      status: 'new',
      name: '',
      phone: '',
      email: '',
      zone: store.zones[0]?.name || '—',
      items: '',
      total: 0,
      pay: 'unpaid',
      date: todayStr,
      notes: '',
      src: 'Added by admin',
    };

    onUpdateStore((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
    }));
    setFilter('all');
    setOpenKeys(new Set([newId]));
    onToast('Added, fill in the details below');
  };

  const handleUpdateOrder = (index: number, updates: Partial<OrderRecord>) => {
    onUpdateStore((prev) => {
      const nextOrders = [...prev.orders];
      nextOrders[index] = { ...nextOrders[index], ...updates };
      return { ...prev, orders: nextOrders };
    });
  };

  const handleDuplicate = (index: number) => {
    const o = orders[index];
    const copy: OrderRecord = {
      ...JSON.parse(JSON.stringify(o)),
      id: generateOrderId(store.cfg.prefix || 'ZN', orders),
    };
    onUpdateStore((prev) => {
      const nextOrders = [...prev.orders];
      nextOrders.splice(index + 1, 0, copy);
      return { ...prev, orders: nextOrders };
    });
    setOpenKeys(new Set([copy.id]));
    onToast('Duplicated order');
  };

  const handleDelete = (index: number) => {
    const gone = orders[index];
    onUpdateStore((prev) => {
      const nextOrders = [...prev.orders];
      nextOrders.splice(index, 1);
      return { ...prev, orders: nextOrders };
    });
    onToast(`Removed order “${gone.id}”`, true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orders.length) return;
    onUpdateStore((prev) => {
      const nextOrders = [...prev.orders];
      const temp = nextOrders[index];
      nextOrders[index] = nextOrders[targetIndex];
      nextOrders[targetIndex] = temp;
      return { ...prev, orders: nextOrders };
    });
  };

  const handleSaveAsMember = (order: OrderRecord) => {
    const cleanPhone = formatWhatsAppNumber(order.phone);
    const existing = store.members.some(
      (m) =>
        (order.email && m.email === order.email) ||
        (cleanPhone && formatWhatsAppNumber(m.phone) === cleanPhone)
    );
    if (existing) {
      onToast('Already a member');
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const newMember = {
      id: 'u' + Date.now(),
      name: order.name || 'Valued Customer',
      phone: order.phone,
      email: order.email,
      area: order.zone !== '—' ? order.zone : '',
      joined: todayStr,
      birthday: '',
      consent: !!order.email,
      status: 'active' as const,
      notes: `Saved from order ${order.id}`,
    };
    onUpdateStore((prev) => ({
      ...prev,
      members: [newMember, ...prev.members],
    }));
    onToast('Added to Members ✓');
  };

  const zoneOptions: Array<[string, string]> = [
    ['—', 'None (pickup)'],
    ...store.zones.map((z) => [z.name, `${z.name} · ${z.fee}`] as [string, string]),
  ];

  return (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <div className="za-eb">Operations</div>
          <h2>Orders</h2>
          <p>
            Every order from the website forms and phone calls. Move each one along
            as the kitchen works.
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="za-chips">
        <button
          type="button"
          className={`za-chip ${filter === 'all' ? 'on' : ''}`}
          onClick={() => setFilter('all')}
        >
          All · {orders.length}
        </button>
        {STAT_OPTIONS.map(([val, label]) => {
          const count = orders.filter((o) => o.status === val).length;
          return (
            <button
              key={val}
              type="button"
              className={`za-chip ${filter === val ? 'on' : ''}`}
              onClick={() => setFilter(val)}
            >
              {label} · {count}
            </button>
          );
        })}
      </div>

      {/* Order List */}
      {filteredOrders.map((o) => {
        const actualIndex = orders.findIndex((orig) => orig.id === o.id);
        const isOpen = openKeys.has(o.id);
        const pillCls =
          o.status === 'cancelled'
            ? 'r'
            : o.status === 'done'
            ? 'x'
            : o.status === 'new'
            ? 'o'
            : '';
        const waNum = formatWhatsAppNumber(o.phone);

        return (
          <ItemCard
            key={o.id}
            title={o.name || 'Anonymous Customer'}
            subtitle={`${o.id} · ${
              o.type === 'cake'
                ? '🎂 Custom cake'
                : o.type === 'pickup'
                ? '🛍️ Pickup'
                : '🛵 Delivery'
            } · ${o.date}`}
            pill={`${STAT_LABELS[o.status] || o.status} · ${formatMoney(o.total)}`}
            pillClass={pillCls}
            emoji={
              o.type === 'cake' ? '🎂' : o.type === 'pickup' ? '🛍️' : '🛵'
            }
            isOpen={isOpen}
            onToggle={() => toggleKey(o.id)}
            canMoveUp={actualIndex > 0}
            canMoveDown={actualIndex < orders.length - 1}
            onMoveUp={() => handleMove(actualIndex, 'up')}
            onMoveDown={() => handleMove(actualIndex, 'down')}
            onDuplicate={() => handleDuplicate(actualIndex)}
            onDelete={() => handleDelete(actualIndex)}
            extraActions={
              <>
                {o.email && (
                  <button
                    type="button"
                    className="za-btn za-b3"
                    onClick={() => onComposeEmail(o.email, `Your Zion order ${o.id}`)}
                  >
                    ✉ Email
                  </button>
                )}
                {waNum && (
                  <a
                    className="za-btn za-b3"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://wa.me/${waNum}`}
                  >
                    💬 WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  className="za-btn za-b3"
                  onClick={() => handleSaveAsMember(o)}
                >
                  ＋ Save as member
                </button>
              </>
            }
          >
            <div className="za-g3">
              <SelectField
                label="Status"
                value={o.status}
                options={STAT_OPTIONS}
                onChange={(val) =>
                  handleUpdateOrder(actualIndex, {
                    status: val as OrderRecord['status'],
                  })
                }
              />
              <SelectField
                label="Type"
                value={o.type}
                options={[
                  ['delivery', '🛵 Delivery'],
                  ['pickup', '🛍️ Pickup'],
                  ['cake', '🎂 Custom cake'],
                ]}
                onChange={(val) =>
                  handleUpdateOrder(actualIndex, {
                    type: val as OrderRecord['type'],
                  })
                }
              />
              <SelectField
                label="Payment"
                value={o.pay}
                options={[
                  ['unpaid', 'Unpaid'],
                  ['deposit', 'Deposit paid'],
                  ['paid', 'Paid in full'],
                ]}
                onChange={(val) =>
                  handleUpdateOrder(actualIndex, {
                    pay: val as OrderRecord['pay'],
                  })
                }
              />
            </div>

            <div className="za-g2">
              <TextField
                label="Customer"
                value={o.name}
                onChange={(val) => handleUpdateOrder(actualIndex, { name: val })}
              />
              <TextField
                label="Phone"
                value={o.phone}
                onChange={(val) => handleUpdateOrder(actualIndex, { phone: val })}
              />
              <TextField
                label="Email"
                type="email"
                value={o.email}
                onChange={(val) => handleUpdateOrder(actualIndex, { email: val })}
              />
              <TextField
                label="Date needed"
                type="date"
                value={o.date}
                onChange={(val) => handleUpdateOrder(actualIndex, { date: val })}
              />
              <SelectField
                label="Delivery zone"
                value={o.zone}
                options={zoneOptions}
                onChange={(val) => handleUpdateOrder(actualIndex, { zone: val })}
              />
              <NumberField
                label="Total (TZS)"
                value={o.total}
                step={1000}
                onChange={(val) => handleUpdateOrder(actualIndex, { total: val })}
              />
              <TextAreaField
                label="Items / cake details"
                value={o.items}
                fullWidth
                onChange={(val) => handleUpdateOrder(actualIndex, { items: val })}
              />
              <TextAreaField
                label="Notes"
                value={o.notes}
                fullWidth
                onChange={(val) => handleUpdateOrder(actualIndex, { notes: val })}
              />
            </div>
          </ItemCard>
        );
      })}

      <button
        type="button"
        className="za-add"
        style={{ marginTop: '14px' }}
        onClick={handleAddOrder}
      >
        ＋ Add phone or walk-in order
      </button>
    </section>
  );
};
