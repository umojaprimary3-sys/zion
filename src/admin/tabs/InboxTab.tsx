import React, { useState } from 'react';
import {
  StoreData,
  InquiryRecord,
  formatWhatsAppNumber,
} from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
  SelectField,
} from '../components/FormFields';

interface InboxTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
  onComposeEmail: (to: string, subject: string) => void;
}

export const InboxTab: React.FC<InboxTabProps> = ({
  store,
  onUpdateStore,
  onToast,
  onComposeEmail,
}) => {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        // If unread, mark read
        if (store.inbox[index]?.status === 'unread') {
          onUpdateStore((prevStore) => {
            const nextInbox = [...prevStore.inbox];
            nextInbox[index] = { ...nextInbox[index], status: 'read' };
            return { ...prevStore, inbox: nextInbox };
          });
        }
      }
      return next;
    });
  };

  const handleAddInquiry = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const newMsg: InquiryRecord = {
      name: '',
      phone: '',
      email: '',
      type: 'General Question',
      message: '',
      date: todayStr,
      status: 'unread',
    };

    onUpdateStore((prev) => ({
      ...prev,
      inbox: [newMsg, ...prev.inbox],
    }));
    setOpenIndices(new Set([0]));
    onToast('Added, fill in the details below');
  };

  const handleUpdate = (index: number, updates: Partial<InquiryRecord>) => {
    onUpdateStore((prev) => {
      const nextInbox = [...prev.inbox];
      nextInbox[index] = { ...nextInbox[index], ...updates };
      return { ...prev, inbox: nextInbox };
    });
  };

  const handleDelete = (index: number) => {
    const gone = store.inbox[index];
    onUpdateStore((prev) => {
      const nextInbox = [...prev.inbox];
      nextInbox.splice(index, 1);
      return { ...prev, inbox: nextInbox };
    });
    onToast(`Removed message from “${gone.name || 'Sender'}”`, true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= store.inbox.length) return;
    onUpdateStore((prev) => {
      const nextInbox = [...prev.inbox];
      const temp = nextInbox[index];
      nextInbox[index] = nextInbox[targetIndex];
      nextInbox[targetIndex] = temp;
      return { ...prev, inbox: nextInbox };
    });
  };

  const handleDuplicate = (index: number) => {
    const copy = JSON.parse(JSON.stringify(store.inbox[index]));
    onUpdateStore((prev) => {
      const nextInbox = [...prev.inbox];
      nextInbox.splice(index + 1, 0, copy);
      return { ...prev, inbox: nextInbox };
    });
    setOpenIndices(new Set([index + 1]));
    onToast('Duplicated message');
  };

  return (
    <section className="za-sec">
      <div className="za-sh">
        <div>
          <div className="za-eb">Operations</div>
          <h2>Messages &amp; inquiries</h2>
          <p>
            Everything customers send through the Contact page. Opening a message
            marks it read.
          </p>
        </div>
      </div>

      {store.inbox.map((m, index) => {
        const isOpen = openIndices.has(index);
        const pillCls =
          m.status === 'unread' ? 'o' : m.status === 'read' ? 'x' : '';
        const waNum = formatWhatsAppNumber(m.phone);

        return (
          <ItemCard
            key={index}
            title={m.name || 'Anonymous Inquiry'}
            subtitle={`${m.type} · ${m.message}`}
            pill={m.status}
            pillClass={pillCls}
            emoji="💬"
            isOpen={isOpen}
            onToggle={() => toggleIndex(index)}
            canMoveUp={index > 0}
            canMoveDown={index < store.inbox.length - 1}
            onMoveUp={() => handleMove(index, 'up')}
            onMoveDown={() => handleMove(index, 'down')}
            onDuplicate={() => handleDuplicate(index)}
            onDelete={() => handleDelete(index)}
            extraActions={
              <>
                {m.email && (
                  <button
                    type="button"
                    className="za-btn za-b3"
                    onClick={() => onComposeEmail(m.email, `Re: ${m.type}`)}
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
                label="Name"
                value={m.name}
                onChange={(val) => handleUpdate(index, { name: val })}
              />
              <TextField
                label="Phone"
                value={m.phone}
                onChange={(val) => handleUpdate(index, { phone: val })}
              />
              <TextField
                label="Email"
                type="email"
                value={m.email}
                onChange={(val) => handleUpdate(index, { email: val })}
              />
              <TextField
                label="Topic"
                value={m.type}
                onChange={(val) => handleUpdate(index, { type: val })}
              />
              <TextField
                label="Received"
                type="date"
                value={m.date}
                onChange={(val) => handleUpdate(index, { date: val })}
              />
              <SelectField
                label="Status"
                value={m.status}
                options={[
                  ['unread', 'Unread'],
                  ['read', 'Read'],
                  ['replied', 'Replied'],
                ]}
                onChange={(val) =>
                  handleUpdate(index, {
                    status: val as InquiryRecord['status'],
                  })
                }
              />
              <TextAreaField
                label="Message"
                value={m.message}
                fullWidth
                onChange={(val) => handleUpdate(index, { message: val })}
              />
            </div>
          </ItemCard>
        );
      })}

      <button
        type="button"
        className="za-add"
        style={{ marginTop: '14px' }}
        onClick={handleAddInquiry}
      >
        ＋ Log a message
      </button>
    </section>
  );
};
