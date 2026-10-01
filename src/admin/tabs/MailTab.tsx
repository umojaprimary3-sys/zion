import React, { useState } from 'react';
import { StoreData, DraftRecord, SentEmailRecord } from '../../data/store';
import { sendEmail } from '../api';
import { computeMemberStats } from './MembersTab';
import {
  TextField,
  TextAreaField,
  SelectField,
} from '../components/FormFields';

interface MailTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
}

const TEMPLATES: Array<[string, string, string]> = [
  [
    'Thank you',
    'Thank you for your order, {{name}}!',
    'Hi {{name}},\n\nThank you for choosing Zion Cakes & Bites. We hope you loved it! Tell us how we did, we read every review.\n\nWarm regards,\nZion Cakes & Bites',
  ],
  [
    'Weekend special',
    'This weekend at Zion 🎂',
    'Hi {{name}},\n\nFresh-baked treats, live music and cake preorders are open this weekend. Order on WhatsApp or visit us at Forest Mpya, Maghorofani.\n\nSee you soon!\nZion Cakes & Bites',
  ],
  [
    'Happy birthday',
    'Happy birthday, {{name}}! 🎉',
    'Hi {{name}},\n\nHappy birthday from all of us at Zion! Enjoy a free slice of cake on us this week. Just show this email.\n\nZion Cakes & Bites',
  ],
  [
    'Order update',
    'About your order',
    'Hi {{name}},\n\nA quick update on your order: ',
  ],
];

export const MailTab: React.FC<MailTabProps> = ({
  store,
  onUpdateStore,
  onToast,
}) => {
  const [sending, setSending] = useState(false);
  const draft = store.draft;

  const handleUpdateDraft = (updates: Partial<DraftRecord>) => {
    onUpdateStore((prev) => ({
      ...prev,
      draft: { ...prev.draft, ...updates },
    }));
  };

  const getRecipients = () => {
    const a = draft.aud;
    if (a === 'custom') {
      return (draft.to || '')
        .split(/[\s,;]+/)
        .filter((x) => x.includes('@'))
        .map((e) => ({
          email: e,
          name:
            store.members.find(
              (m) => m.email.toLowerCase() === e.toLowerCase()
            )?.name || 'there',
        }));
    }

    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

    return store.members.filter((m) => {
      if (!m.email || !m.consent || m.status !== 'active') return false;
      if (a === 'all') return true;
      if (a === 'bday') return (m.birthday || '').startsWith(currentMonth);

      const stats = computeMemberStats(m, store);
      return stats.tier.toLowerCase() === a.toLowerCase();
    });
  };

  const recipients = getRecipients();
  const sampleRecipient = recipients[0] || { name: 'Anna' };

  const fillTemplate = (text: string, name: string) => {
    const firstName = (name || 'there').split(' ')[0];
    return String(text || '').replace(/\{\{\s*name\s*\}\}/g, firstName);
  };

  const handleApplyTemplate = (index: number) => {
    const tpl = TEMPLATES[index];
    handleUpdateDraft({
      subj: tpl[1],
      body: tpl[2],
    });
  };

  const handleSend = async () => {
    if (!draft.subj || !draft.body) {
      onToast('Add a subject and a message first');
      return;
    }
    if (recipients.length === 0) {
      onToast('No recipients found for this audience');
      return;
    }

    setSending(true);
    onToast('Sending…');

    const payload = {
      from: store.cfg.from || 'orders@zioncakesmbeya.com',
      fromName: store.cfg.fromName || 'Zion Cakes & Bites',
      subject: draft.subj,
      messages: recipients.map((r) => ({
        to: r.email,
        subject: fillTemplate(draft.subj, r.name),
        body: fillTemplate(draft.body, r.name),
      })),
    };

    try {
      const status = await sendEmail(payload, store.cfg.api);
      const todayStr = new Date().toISOString().slice(0, 10);
      const newMailRecord: SentEmailRecord = {
        date: todayStr,
        subject: draft.subj,
        count: recipients.length,
        status,
        body: draft.body,
      };

      onUpdateStore((prev) => ({
        ...prev,
        mail: [newMailRecord, ...prev.mail],
      }));

      onToast(status === 'sent' ? 'Sent ✓' : `Recorded: ${status}`);
    } catch {
      onToast('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSentMail = (index: number) => {
    onUpdateStore((prev) => {
      const nextMail = [...prev.mail];
      nextMail.splice(index, 1);
      return { ...prev, mail: nextMail };
    });
    onToast('Sent mail record deleted');
  };

  const mailtoBcc = encodeURIComponent(recipients.map((r) => r.email).join(','));
  const mailtoSubject = encodeURIComponent(fillTemplate(draft.subj, 'there'));
  const mailtoBody = encodeURIComponent(fillTemplate(draft.body, 'there'));

  return (
    <div>
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Email</div>
            <h2>Email center</h2>
            <p>
              Write once, send to one person or a whole group. Group sends only
              include members who agreed to emails.
            </p>
          </div>
        </div>

        {/* Template buttons */}
        <div className="za-chips">
          <span style={{ fontSize: '12px', color: 'var(--za-mu)' }}>
            Start from:
          </span>
          {TEMPLATES.map((x, i) => (
            <button
              key={i}
              type="button"
              className="za-chip"
              onClick={() => handleApplyTemplate(i)}
            >
              {x[0]}
            </button>
          ))}
        </div>

        <div className="za-g2">
          <SelectField
            label="Send to"
            value={draft.aud}
            options={[
              ['all', 'All members (opted in)'],
              ['gold', 'Gold members'],
              ['silver', 'Silver members'],
              ['bronze', 'Bronze members'],
              ['bday', 'Birthdays this month'],
              ['custom', 'Specific emails…'],
            ]}
            onChange={(val) => handleUpdateDraft({ aud: val })}
          />

          {draft.aud === 'custom' ? (
            <TextAreaField
              label="Email addresses"
              hint="comma or new line"
              value={draft.to}
              onChange={(val) => handleUpdateDraft({ to: val })}
            />
          ) : (
            <div className="za-fld">
              <label>Recipients</label>
              <div>
                <span
                  className="za-pill"
                  style={{ display: 'inline-block', marginTop: '8px' }}
                >
                  {recipients.length} people
                </span>
              </div>
            </div>
          )}

          <TextField
            label="Subject"
            hint="{{name}} becomes the first name"
            fullWidth
            value={draft.subj}
            onChange={(val) => handleUpdateDraft({ subj: val })}
          />

          <TextAreaField
            label="Message"
            rows={5}
            fullWidth
            value={draft.body}
            onChange={(val) => handleUpdateDraft({ body: val })}
          />
        </div>

        {/* Preview */}
        <div className="za-hint" style={{ margin: '14px 0 8px' }}>
          Preview for <b>{sampleRecipient.name}</b>
        </div>
        <div className="za-item" style={{ padding: '16px' }}>
          <b className="za-f" style={{ fontSize: '16px' }}>
            {fillTemplate(draft.subj, sampleRecipient.name) || '(no subject)'}
          </b>
          <p
            style={{
              whiteSpace: 'pre-wrap',
              marginTop: '8px',
              fontSize: '13px',
              color: 'var(--za-mu)',
            }}
          >
            {fillTemplate(draft.body, sampleRecipient.name)}
          </p>
        </div>

        <div className="za-acts">
          <button
            type="button"
            className="za-btn za-b1"
            disabled={recipients.length === 0 || sending}
            onClick={handleSend}
          >
            ✉ Send to {recipients.length}
          </button>
          <a
            className="za-btn za-b3"
            href={`mailto:?bcc=${mailtoBcc}&subject=${mailtoSubject}&body=${mailtoBody}`}
          >
            Open in my email app
          </a>
        </div>
      </section>

      {/* Sent History */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Sent history</h2>
          </div>
        </div>

        {store.mail.length > 0 ? (
          store.mail.map((m, i) => (
            <div key={i} className="za-ap">
              <span>
                <b>{m.subject}</b>
                <br />
                <small style={{ color: 'var(--za-mu)' }}>
                  {m.date} · {m.count} recipients · {m.status}
                </small>
              </span>
              <button
                type="button"
                className="za-btn za-b3 za-bd"
                onClick={() => handleDeleteSentMail(i)}
              >
                🗑
              </button>
            </div>
          ))
        ) : (
          <p className="za-hint">Nothing sent yet.</p>
        )}
      </section>
    </div>
  );
};
