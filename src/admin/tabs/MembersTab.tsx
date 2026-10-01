import React, { useState } from 'react';
import {
  StoreData,
  MemberRecord,
  formatMoney,
  formatWhatsAppNumber,
} from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  SelectField,
  SwitchField,
} from '../components/FormFields';

interface MembersTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
  onComposeEmail: (to: string, subject: string, aud?: string) => void;
  onOpenCsvModal: () => void;
}

export function computeMemberStats(member: MemberRecord, store: StoreData) {
  const cleanPhone = formatWhatsAppNumber(member.phone);
  const matchedOrders = store.orders.filter(
    (o) =>
      o.status !== 'cancelled' &&
      ((o.email && member.email && o.email.toLowerCase() === member.email.toLowerCase()) ||
        (cleanPhone && formatWhatsAppNumber(o.phone) === cleanPhone))
  );

  const spent = matchedOrders.reduce((sum, o) => sum + (+o.total || 0), 0);
  const tier: 'Gold' | 'Silver' | 'Bronze' =
    spent >= 300000 ? 'Gold' : spent >= 100000 ? 'Silver' : 'Bronze';

  return {
    orders: matchedOrders,
    orderCount: matchedOrders.length,
    spent,
    tier,
  };
}

export const MembersTab: React.FC<MembersTabProps> = ({
  store,
  onUpdateStore,
  onToast,
  onComposeEmail,
  onOpenCsvModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const toggleKey = (id: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const members = store.members;
  const q = searchQuery.toLowerCase().trim();
  const filteredMembers = members.filter((m) => {
    if (!q) return true;
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phone || '').toLowerCase().includes(q) ||
      (m.area || '').toLowerCase().includes(q)
    );
  });

  const handleAddMember = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const newId = 'u' + Date.now();
    const newMember: MemberRecord = {
      id: newId,
      name: 'New member',
      phone: '',
      email: '',
      area: '',
      joined: todayStr,
      birthday: '',
      consent: true,
      status: 'active',
      notes: '',
    };

    onUpdateStore((prev) => ({
      ...prev,
      members: [newMember, ...prev.members],
    }));
    setOpenKeys(new Set([newId]));
    onToast('Added, fill in the details below');
  };

  const handleUpdate = (index: number, updates: Partial<MemberRecord>) => {
    onUpdateStore((prev) => {
      const nextMembers = [...prev.members];
      nextMembers[index] = { ...nextMembers[index], ...updates };
      return { ...prev, members: nextMembers };
    });
  };

  const handleDelete = (index: number) => {
    const gone = members[index];
    onUpdateStore((prev) => {
      const nextMembers = [...prev.members];
      nextMembers.splice(index, 1);
      return { ...prev, members: nextMembers };
    });
    onToast(`Removed member “${gone.name}”`, true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;
    onUpdateStore((prev) => {
      const nextMembers = [...prev.members];
      const temp = nextMembers[index];
      nextMembers[index] = nextMembers[targetIndex];
      nextMembers[targetIndex] = temp;
      return { ...prev, members: nextMembers };
    });
  };

  const handleDuplicate = (index: number) => {
    const copy: MemberRecord = {
      ...JSON.parse(JSON.stringify(members[index])),
      id: 'u' + Date.now(),
    };
    onUpdateStore((prev) => {
      const nextMembers = [...prev.members];
      nextMembers.splice(index + 1, 0, copy);
      return { ...prev, members: nextMembers };
    });
    setOpenKeys(new Set([copy.id]));
    onToast('Duplicated member');
  };

  return (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <div className="za-eb">Customers</div>
          <h2>Members</h2>
          <p>
            Your customer list. Spend and tier (Bronze, Silver from 100k, Gold from
            300k) come from their orders.
          </p>
        </div>
      </div>

      <div className="za-chips">
        <input
          type="text"
          placeholder="🔍 Search members…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="button"
          className="za-btn za-b3"
          onClick={onOpenCsvModal}
        >
          ⬇ Export list
        </button>
        <button
          type="button"
          className="za-btn za-b3"
          onClick={() => onComposeEmail('', '', 'all')}
        >
          ✉ Email all members
        </button>
      </div>

      {filteredMembers.map((m) => {
        const actualIndex = members.findIndex((item) => item.id === m.id);
        const stats = computeMemberStats(m, store);
        const isOpen = openKeys.has(m.id);
        const pillCls =
          stats.tier === 'Gold'
            ? ''
            : stats.tier === 'Silver'
            ? 'x'
            : 'o';
        const waNum = formatWhatsAppNumber(m.phone);

        return (
          <ItemCard
            key={m.id}
            title={m.name || 'Untitled Member'}
            subtitle={`${stats.orderCount} orders · ${formatMoney(stats.spent)} · ${
              m.area || 'no area'
            }`}
            pill={stats.tier}
            pillClass={pillCls}
            emoji="👤"
            isOpen={isOpen}
            onToggle={() => toggleKey(m.id)}
            canMoveUp={actualIndex > 0}
            canMoveDown={actualIndex < members.length - 1}
            onMoveUp={() => handleMove(actualIndex, 'up')}
            onMoveDown={() => handleMove(actualIndex, 'down')}
            onDuplicate={() => handleDuplicate(actualIndex)}
            onDelete={() => handleDelete(actualIndex)}
            extraActions={
              <>
                {m.email && (
                  <button
                    type="button"
                    className="za-btn za-b3"
                    onClick={() => onComposeEmail(m.email, 'A note from Zion')}
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
              </>
            }
          >
            <div className="za-g2">
              <TextField
                label="Full name"
                value={m.name}
                onChange={(val) => handleUpdate(actualIndex, { name: val })}
              />
              <TextField
                label="Phone"
                value={m.phone}
                onChange={(val) => handleUpdate(actualIndex, { phone: val })}
              />
              <TextField
                label="Email"
                type="email"
                value={m.email}
                onChange={(val) => handleUpdate(actualIndex, { email: val })}
              />
              <TextField
                label="Area"
                value={m.area}
                onChange={(val) => handleUpdate(actualIndex, { area: val })}
              />
              <TextField
                label="Birthday"
                placeholder="MM-DD"
                value={m.birthday}
                onChange={(val) => handleUpdate(actualIndex, { birthday: val })}
              />
              <TextField
                label="Joined"
                type="date"
                value={m.joined}
                onChange={(val) => handleUpdate(actualIndex, { joined: val })}
              />
              <SelectField
                label="Status"
                value={m.status}
                options={[
                  ['active', 'Active'],
                  ['paused', 'Paused'],
                  ['blocked', 'Blocked'],
                ]}
                onChange={(val) =>
                  handleUpdate(actualIndex, {
                    status: val as MemberRecord['status'],
                  })
                }
              />
              <SwitchField
                label="Agreed to receive emails"
                checked={m.consent}
                onChange={(val) => handleUpdate(actualIndex, { consent: val })}
              />
              <TextAreaField
                label="Private notes"
                value={m.notes}
                fullWidth
                onChange={(val) => handleUpdate(actualIndex, { notes: val })}
              />
            </div>

            <div className="za-hint" style={{ marginTop: '12px' }}>
              {stats.orders.length > 0 ? (
                <>
                  Orders:{' '}
                  {stats.orders
                    .map((o) => `${o.id} (${o.status})`)
                    .join(', ')}
                </>
              ) : (
                'No orders yet.'
              )}
            </div>
          </ItemCard>
        );
      })}

      <button
        type="button"
        className="za-add"
        style={{ marginTop: '14px' }}
        onClick={handleAddMember}
      >
        ＋ Add member
      </button>
    </section>
  );
};
