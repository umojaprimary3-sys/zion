import React, { useState } from 'react';
import {
  StoreData,
  BizData,
  HourItemData,
  ZoneItemData,
  FaqItemData,
} from '../../data/store';
import { ItemCard } from '../components/ItemCard';
import {
  TextField,
  TextAreaField,
} from '../components/FormFields';

interface BizTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

export const BizTab: React.FC<BizTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [openCardKeys, setOpenCardKeys] = useState<Set<string>>(new Set());

  const toggleKey = (key: string) => {
    setOpenCardKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateBiz = (updates: Partial<BizData>) => {
    onUpdateStore((prev) => ({
      ...prev,
      biz: { ...prev.biz, ...updates },
    }));
  };

  // Hours
  const handleUpdateHour = (index: number, updates: Partial<HourItemData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.hours];
      next[index] = { ...next[index], ...updates };
      return { ...prev, hours: next };
    });
  };

  const handleAddHour = () => {
    const newHour: HourItemData = {
      days: 'Monday – Sunday',
      hours: '08:00 AM – 10:00 PM',
      status: '',
    };
    onUpdateStore((prev) => ({
      ...prev,
      hours: [...prev.hours, newHour],
    }));
    setOpenCardKeys(new Set([`hour-${store.hours.length}`]));
    onToast('Added opening hours row');
  };

  const handleDeleteHour = (index: number) => {
    const gone = store.hours[index];
    onUpdateStore((prev) => {
      const next = [...prev.hours];
      next.splice(index, 1);
      return { ...prev, hours: next };
    });
    onToast(`Removed hours for “${gone.days}”`, true);
  };

  // Zones
  const handleUpdateZone = (index: number, updates: Partial<ZoneItemData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.zones];
      next[index] = { ...next[index], ...updates };
      return { ...prev, zones: next };
    });
  };

  const handleAddZone = () => {
    const newZone: ZoneItemData = {
      name: 'New zone',
      estimate: '20 – 30 mins',
      fee: 'TZS 2,500',
      coverage: '',
    };
    onUpdateStore((prev) => ({
      ...prev,
      zones: [...prev.zones, newZone],
    }));
    setOpenCardKeys(new Set([`zone-${store.zones.length}`]));
    onToast('Added delivery zone');
  };

  const handleDeleteZone = (index: number) => {
    const gone = store.zones[index];
    onUpdateStore((prev) => {
      const next = [...prev.zones];
      next.splice(index, 1);
      return { ...prev, zones: next };
    });
    onToast(`Removed zone “${gone.name}”`, true);
  };

  // FAQ
  const handleUpdateFaq = (index: number, updates: Partial<FaqItemData>) => {
    onUpdateStore((prev) => {
      const next = [...prev.faq];
      next[index] = { ...next[index], ...updates };
      return { ...prev, faq: next };
    });
  };

  const handleAddFaq = () => {
    const newFaq: FaqItemData = {
      q: 'New question?',
      a: '',
    };
    onUpdateStore((prev) => ({
      ...prev,
      faq: [...prev.faq, newFaq],
    }));
    setOpenCardKeys(new Set([`faq-${store.faq.length}`]));
    onToast('Added FAQ question');
  };

  const handleDeleteFaq = (index: number) => {
    const gone = store.faq[index];
    onUpdateStore((prev) => {
      const next = [...prev.faq];
      next.splice(index, 1);
      return { ...prev, faq: next };
    });
    onToast(`Removed FAQ: “${gone.q}”`, true);
  };

  return (
    <div>
      {/* BUSINESS DETAILS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Header · Footer · Contact</div>
            <h2>Business</h2>
            <p>Used in header, footer, About, Contact and order forms.</p>
          </div>
        </div>

        <div className="za-g2">
          <TextField
            label="Business name"
            value={store.biz.name}
            onChange={(val) => updateBiz({ name: val })}
          />
          <TextField
            label="Footer text"
            value={store.biz.footer}
            onChange={(val) => updateBiz({ footer: val })}
          />
          <TextField
            label="Address line 1"
            value={store.biz.address1}
            onChange={(val) => updateBiz({ address1: val })}
          />
          <TextField
            label="City / country"
            value={store.biz.address2}
            onChange={(val) => updateBiz({ address2: val })}
          />
          <TextField
            label="Phone (shown)"
            value={store.biz.phone}
            onChange={(val) => updateBiz({ phone: val })}
          />
          <TextField
            label="WhatsApp number"
            hint="digits only, e.g. 255768000111"
            value={store.biz.whatsapp}
            onChange={(val) => updateBiz({ whatsapp: val })}
          />
          <TextField
            label="Email"
            type="email"
            value={store.biz.email}
            onChange={(val) => updateBiz({ email: val })}
          />
          <TextField
            label="Instagram handle"
            value={store.biz.instagram}
            onChange={(val) => updateBiz({ instagram: val })}
          />
          <TextField
            label="Instagram link"
            value={store.biz.igUrl}
            onChange={(val) => updateBiz({ igUrl: val })}
          />
          <TextField
            label="Google Maps link"
            value={store.biz.mapUrl}
            onChange={(val) => updateBiz({ mapUrl: val })}
          />
          <TextField
            label="Directions link"
            value={store.biz.dirUrl}
            onChange={(val) => updateBiz({ dirUrl: val })}
          />
          <TextField
            label="Google rating"
            value={store.biz.rating}
            onChange={(val) => updateBiz({ rating: val })}
          />
          <TextField
            label="Reviews label"
            value={store.biz.reviewsCount}
            onChange={(val) => updateBiz({ reviewsCount: val })}
          />
          <TextField
            label="Instagram followers"
            value={store.biz.followers}
            onChange={(val) => updateBiz({ followers: val })}
          />
        </div>
      </section>

      {/* OPENING HOURS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Opening hours</h2>
          </div>
        </div>

        {store.hours.map((h, idx) => (
          <ItemCard
            key={idx}
            title={h.days}
            subtitle={h.hours}
            emoji="🕒"
            isOpen={openCardKeys.has(`hour-${idx}`)}
            onToggle={() => toggleKey(`hour-${idx}`)}
            onDelete={() => handleDeleteHour(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Days"
                value={h.days}
                onChange={(val) => handleUpdateHour(idx, { days: val })}
              />
              <TextField
                label="Hours"
                value={h.hours}
                onChange={(val) => handleUpdateHour(idx, { hours: val })}
              />
              <TextField
                label="Note"
                fullWidth
                value={h.status}
                onChange={(val) => handleUpdateHour(idx, { status: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddHour}
        >
          ＋ Add hours row
        </button>
      </section>

      {/* DELIVERY ZONES */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Delivery zones &amp; fees</h2>
            <p>Shown on Contact and in order forms.</p>
          </div>
        </div>

        {store.zones.map((z, idx) => (
          <ItemCard
            key={idx}
            title={z.name}
            subtitle={`${z.estimate} · ${z.fee}`}
            emoji="🛵"
            isOpen={openCardKeys.has(`zone-${idx}`)}
            onToggle={() => toggleKey(`zone-${idx}`)}
            onDelete={() => handleDeleteZone(idx)}
          >
            <div className="za-g2">
              <TextField
                label="Zone name"
                value={z.name}
                onChange={(val) => handleUpdateZone(idx, { name: val })}
              />
              <TextField
                label="Time"
                value={z.estimate}
                onChange={(val) => handleUpdateZone(idx, { estimate: val })}
              />
              <TextField
                label="Fee"
                value={z.fee}
                onChange={(val) => handleUpdateZone(idx, { fee: val })}
              />
              <TextField
                label="Areas covered"
                value={z.coverage}
                onChange={(val) => handleUpdateZone(idx, { coverage: val })}
              />
            </div>
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddZone}
        >
          ＋ Add zone
        </button>
      </section>

      {/* FAQ */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>FAQ</h2>
            <p>Questions on Home and About.</p>
          </div>
        </div>

        {store.faq.map((f, idx) => (
          <ItemCard
            key={idx}
            title={f.q}
            subtitle={f.a}
            emoji="❓"
            isOpen={openCardKeys.has(`faq-${idx}`)}
            onToggle={() => toggleKey(`faq-${idx}`)}
            onDelete={() => handleDeleteFaq(idx)}
          >
            <TextField
              label="Question"
              fullWidth
              value={f.q}
              onChange={(val) => handleUpdateFaq(idx, { q: val })}
            />
            <div style={{ height: '10px' }}></div>
            <TextAreaField
              label="Answer"
              fullWidth
              value={f.a}
              onChange={(val) => handleUpdateFaq(idx, { a: val })}
            />
          </ItemCard>
        ))}

        <button
          type="button"
          className="za-add"
          style={{ marginTop: '14px' }}
          onClick={handleAddFaq}
        >
          ＋ Add question
        </button>
      </section>
    </div>
  );
};
