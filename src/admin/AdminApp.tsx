import React, { useState, useEffect, useRef } from 'react';
import './admin.css';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  useStore,
  StoreData,
  DEFAULT_STORE,
  formatMoney,
  formatWhatsAppNumber,
} from '../data/store';
import { extractImages } from './tabs/MediaTab';
import { computeMemberStats } from './tabs/MembersTab';

import { OverviewTab } from './tabs/OverviewTab';
import { OrdersTab } from './tabs/OrdersTab';
import { InboxTab } from './tabs/InboxTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { MembersTab } from './tabs/MembersTab';
import { MailTab } from './tabs/MailTab';
import { HomeTab } from './tabs/HomeTab';
import { MenuTab } from './tabs/MenuTab';
import { CakeTab } from './tabs/CakeTab';
import { GalleryTab } from './tabs/GalleryTab';
import { PagesTab } from './tabs/PagesTab';
import { MediaTab } from './tabs/MediaTab';
import { BizTab } from './tabs/BizTab';
import { EngineerTab } from './tabs/EngineerTab';

interface TabDef {
  id: string;
  icon: string;
  title: string;
  sub: string;
  group: 'OPERATIONS' | 'WEBSITE' | 'SYSTEM';
}

const TABS: TabDef[] = [
  { id: 'overview', icon: '📋', title: 'Overview', sub: 'Live summary of orders, messages and content', group: 'OPERATIONS' },
  { id: 'orders', icon: '🧾', title: 'Orders', sub: 'Website and phone orders, from new to delivered', group: 'OPERATIONS' },
  { id: 'inbox', icon: '💬', title: 'Messages', sub: 'Inquiries sent from the Contact page', group: 'OPERATIONS' },
  { id: 'revs', icon: '⭐', title: 'Reviews', sub: 'Approve, reply to or hide customer reviews', group: 'OPERATIONS' },
  { id: 'members', icon: '👥', title: 'Members', sub: 'Customer list, tiers and contact details', group: 'OPERATIONS' },
  { id: 'mail', icon: '✉️', title: 'Email Center', sub: 'Write and send emails to customers', group: 'OPERATIONS' },
  { id: 'home', icon: '🏠', title: 'Home & Hero', sub: 'Appears on Home, About', group: 'WEBSITE' },
  { id: 'menu', icon: '🍽️', title: 'Menu', sub: 'Appears on Menu', group: 'WEBSITE' },
  { id: 'cake', icon: '🎂', title: 'Cake Studio', sub: 'Appears on Custom Cake page', group: 'WEBSITE' },
  { id: 'gallery', icon: '🖼️', title: 'Gallery', sub: 'Appears on Reviews, Home', group: 'WEBSITE' },
  { id: 'pages', icon: '📝', title: 'Pages', sub: 'Banners, navigation, About, Contact, Footer', group: 'WEBSITE' },
  { id: 'media', icon: '🎞️', title: 'All Images', sub: 'Every photo on the website in one place', group: 'WEBSITE' },
  { id: 'biz', icon: '📍', title: 'Business & Delivery', sub: 'Header, footer, About, Contact, order forms', group: 'WEBSITE' },
  { id: 'eng', icon: '🛠️', title: 'Engineer', sub: 'Database and email connection', group: 'SYSTEM' },
];

export default function AdminApp() {
  const [store, setStore] = useStore();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Auth & Lock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('zl') === '1';
    } catch {
      return false;
    }
  });
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(null);

  // Login form inputs
  const [loginMethod, setLoginMethod] = useState<'passcode' | 'supabase'>('passcode');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [passcodeError, setPasscodeError] = useState('');

  // Check if a Supabase auth user has admin permissions
  const checkIfUserIsAdmin = async (user: any): Promise<boolean> => {
    if (!user) return false;
    // Customer accounts explicitly have role 'customer'
    if (user.user_metadata?.role === 'customer') return false;
    // Admin role in metadata
    if (user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin') return true;
    
    // Check database admins table if configured
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!error && data) return true;
    } catch {
      // Table may not exist yet
    }

    // Default admin email fallback
    if (user.email && (user.email.toLowerCase().includes('admin') || user.email === 'orders@zioncakesmbeya.com')) {
      return true;
    }
    return false;
  };

  // Check Supabase session on mount
  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (data?.session?.user) {
          const isAdmin = await checkIfUserIsAdmin(data.session.user);
          if (isAdmin) {
            setIsUnlocked(true);
            setAdminUserEmail(data.session.user.email || 'Admin');
          } else {
            // Logged in as customer: DO NOT unlock AdminApp!
            setAdminUserEmail(null);
          }
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const isAdmin = await checkIfUserIsAdmin(session.user);
          if (isAdmin) {
            setIsUnlocked(true);
            setAdminUserEmail(session.user.email || 'Admin');
          } else {
            setAdminUserEmail(null);
          }
        } else if (!sessionStorage.getItem('zl')) {
          setAdminUserEmail(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Save status & snapshot history for undo
  const [isSaving, setIsSaving] = useState(false);
  const historySnapshotRef = useRef<string | null>(null);

  // Modals & toast state
  const [ioModalOpen, setIoModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [ioText, setIoText] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastCanUndo, setToastCanUndo] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const expectedPasscode =
    import.meta.env.VITE_ADMIN_PASSCODE || 'zion2026';

  const handlePasscodeLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passcodeInput === expectedPasscode) {
      try {
        sessionStorage.setItem('zl', '1');
      } catch {
        // Ignored
      }
      setIsUnlocked(true);
      setPasscodeError('');
    } else {
      setPasscodeError('Wrong passcode — try again');
    }
  };

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setPasscodeError('Please enter email and password');
      return;
    }
    setAuthLoading(true);
    setPasscodeError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (error) {
        setPasscodeError(error.message);
      } else if (data?.user) {
        const isAdmin = await checkIfUserIsAdmin(data.user);
        if (!isAdmin) {
          await supabase.auth.signOut();
          setPasscodeError('Access denied: This is a customer account and does not have administrator permissions.');
          return;
        }
        setIsUnlocked(true);
        setAdminUserEmail(data.user.email || 'Admin');
        try {
          sessionStorage.setItem('zl', '1');
        } catch {
          // Ignored
        }
      }
    } catch (err: unknown) {
      setPasscodeError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('zl');
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignored
    }
    setIsUnlocked(false);
    setAdminUserEmail(null);
    setPasscodeInput('');
    setAuthEmail('');
    setAuthPassword('');
  };

  const showToast = (msg: string, allowUndo = false) => {
    setToastMessage(msg);
    setToastCanUndo(allowUndo);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(
      () => {
        setToastMessage(null);
      },
      allowUndo ? 6000 : 2500
    );
  };

  const handleUndo = () => {
    if (historySnapshotRef.current) {
      try {
        const restored = JSON.parse(historySnapshotRef.current);
        setStore(restored);
        historySnapshotRef.current = null;
        showToast('Restored ✓');
      } catch {
        showToast('Could not undo');
      }
    }
  };

  const handleUpdateStoreWithHistory = (
    updater: (prev: StoreData) => StoreData
  ) => {
    historySnapshotRef.current = JSON.stringify(store);
    setIsSaving(true);
    setStore((prev) => {
      const next = updater(prev);
      return next;
    });
    setTimeout(() => {
      setIsSaving(false);
    }, 400);
  };

  // Open Export / Import Modal
  const openIoModal = () => {
    setIoText(JSON.stringify(store, null, 2));
    setIoModalOpen(true);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(ioText);
      if (!parsed || !parsed.menu || !parsed.orders) {
        throw new Error('Invalid format');
      }
      historySnapshotRef.current = JSON.stringify(store);
      setStore(parsed);
      setIoModalOpen(false);
      showToast('Imported ✓', true);
    } catch {
      showToast('That text is not a valid backup');
    }
  };

  const handleResetToDefault = () => {
    historySnapshotRef.current = JSON.stringify(store);
    setStore(JSON.parse(JSON.stringify(DEFAULT_STORE)));
    setResetModalOpen(false);
    showToast('Reset to original', true);
  };

  const handleComposeEmail = (to: string, subject: string, aud?: string) => {
    setStore((prev) => ({
      ...prev,
      draft: {
        ...prev.draft,
        aud: aud || 'custom',
        to: to || prev.draft.to,
        subj: subject || prev.draft.subj,
        body: to
          ? 'Hi {{name}},\n\n\n\nZion Cakes & Bites'
          : prev.draft.body,
      },
    }));
    setActiveTab('mail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CSV generation for members
  const generateMembersCsv = () => {
    const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Phone', 'Email', 'Area', 'Tier', 'Orders', 'Spent', 'Emails OK'],
      ...store.members.map((m) => {
        const stats = computeMemberStats(m, store);
        return [
          m.name,
          m.phone,
          m.email,
          m.area,
          stats.tier,
          stats.orderCount,
          stats.spent,
          m.consent ? 'yes' : 'no',
        ];
      }),
    ];
    return rows.map((r) => r.map(q).join(',')).join('\n');
  };

  const currentTabDef =
    TABS.find((t) => t.id === activeTab) || TABS[0];

  // Tab Badge counts
  const getBadgeCount = (id: string): number | string => {
    switch (id) {
      case 'orders':
        return store.orders.filter((o) => o.status === 'new').length;
      case 'inbox':
        return store.inbox.filter((m) => m.status === 'unread').length;
      case 'revs':
        return store.reviews.filter((r) => r.status === 'pending').length;
      case 'members':
        return store.members.length;
      case 'menu':
        return store.menu.length;
      case 'cake':
        return store.flavors.length;
      case 'gallery':
        return store.gallery.length;
      case 'media':
        return extractImages(store).length;
      case 'biz':
        return store.zones.length;
      default:
        return '';
    }
  };

  return (
    <div className="zion-admin">
      {/* AUTH / PASSCODE LOCK SCREEN */}
      {!isUnlocked && (
        <div className="za-lk" id="admin-passcode-overlay">
          <div className="za-mb" style={{ maxWidth: '400px' }}>
            <div className="za-f" style={{ fontSize: '28px', letterSpacing: '1px' }}>
              ZION ADMIN
            </div>
            <p style={{ color: 'var(--za-mu)', margin: '6px 0 16px' }}>
              Sign in to manage Zion Cakes &amp; Bites
            </p>

            {/* TAB SELECTOR: PASSCODE OR SUPABASE AUTH */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.06)',
                padding: '4px',
                borderRadius: '12px',
                marginBottom: '16px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                className={`za-btn ${loginMethod === 'passcode' ? 'za-b1' : 'za-b3'}`}
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                onClick={() => {
                  setLoginMethod('passcode');
                  setPasscodeError('');
                }}
              >
                🔑 Passcode
              </button>
              <button
                type="button"
                className={`za-btn ${loginMethod === 'supabase' ? 'za-b1' : 'za-b3'}`}
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                onClick={() => {
                  setLoginMethod('supabase');
                  setPasscodeError('');
                }}
              >
                ⚡ Supabase Auth
              </button>
            </div>

            {loginMethod === 'passcode' ? (
              <form onSubmit={handlePasscodeLogin}>
                <input
                  type="password"
                  placeholder="Preview Passcode (zion2026)"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
                <p
                  style={{
                    color: 'var(--za-red)',
                    fontSize: '12px',
                    minHeight: '20px',
                    marginTop: '4px',
                  }}
                >
                  {passcodeError}
                </p>
                <button
                  type="submit"
                  className="za-btn za-b1"
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  Unlock Admin Panel
                </button>
                <p className="za-hint" style={{ margin: '14px 0 0' }}>
                  Preview passcode: <b>zion2026</b>. For production RLS enforcement, use Supabase Auth.
                </p>
              </form>
            ) : (
              <form onSubmit={handleSupabaseLogin}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="email"
                    placeholder="Admin Email (e.g. admin@zion.com)"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <p
                  style={{
                    color: 'var(--za-red)',
                    fontSize: '12px',
                    minHeight: '20px',
                    marginTop: '4px',
                  }}
                >
                  {passcodeError}
                </p>
                <button
                  type="submit"
                  className="za-btn za-b1"
                  disabled={authLoading}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {authLoading ? 'Verifying with Supabase…' : 'Sign In with Supabase'}
                </button>
                <p className="za-hint" style={{ margin: '14px 0 0' }}>
                  Signs in with Supabase Auth to establish authenticated RLS session token.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MAIN ADMIN APP */}
      <div className="za-app">
        {/* SIDEBAR NAVIGATION */}
        <aside className="za-aside">
          <div className="za-logo">
            <b>
              ZION
              <br />
              ADMIN
            </b>
            <span>CAKES &amp; BITES</span>
          </div>

          {['OPERATIONS', 'WEBSITE', 'SYSTEM'].map((groupName) => {
            const groupTabs = TABS.filter((t) => t.group === groupName);
            return (
              <React.Fragment key={groupName}>
                <div className="za-grp">{groupName}</div>
                {groupTabs.map((t) => {
                  const cnt = getBadgeCount(t.id);
                  const isCurrent = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`za-tab ${isCurrent ? 'on' : ''}`}
                      onClick={() => {
                        setActiveTab(t.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <i>{t.icon}</i>
                      {t.title}
                      {cnt !== '' && Number(cnt) > 0 && <em>{cnt}</em>}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}

          <div className="za-side-foot">
            <b>{store.biz.name}</b>
            {store.biz.address2}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="za-main">
          {/* TOP STICKY BAR */}
          <div className="za-top">
            <div style={{ flex: 1, minWidth: '150px' }}>
              <h1>
                {currentTabDef.icon} {currentTabDef.title}
              </h1>
              <small>{currentTabDef.sub}</small>
            </div>

            <span className={`za-st ${isSaving ? 'd' : ''}`}>
              {isSaving ? 'Saving…' : 'All changes saved'}
            </span>

            {adminUserEmail && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--za-mu)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                👤 {adminUserEmail}
              </span>
            )}

            <button
              type="button"
              className="za-btn za-b2 za-hm"
              onClick={openIoModal}
            >
              ⇅ Export / Import
            </button>

            <button
              type="button"
              className="za-btn za-b1"
              onClick={() => {
                setStore({ ...store });
                showToast('Saved ✓ Your changes are stored');
              }}
            >
              ✓ Save
            </button>

            <button
              type="button"
              className="za-btn za-b3 za-bd"
              onClick={handleLogout}
              title="Lock admin session / Sign out"
              style={{ padding: '6px 12px', fontSize: '13px' }}
            >
              🔒 Lock
            </button>
          </div>

          {/* ACTIVE TAB VIEW */}
          {activeTab === 'overview' && (
            <OverviewTab
              store={store}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenIoModal={openIoModal}
              onOpenResetModal={() => setResetModalOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
              onComposeEmail={handleComposeEmail}
            />
          )}

          {activeTab === 'inbox' && (
            <InboxTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
              onComposeEmail={handleComposeEmail}
            />
          )}

          {activeTab === 'revs' && (
            <ReviewsTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
              onComposeEmail={handleComposeEmail}
              onOpenCsvModal={() => setCsvModalOpen(true)}
            />
          )}

          {activeTab === 'mail' && (
            <MailTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'home' && (
            <HomeTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'menu' && (
            <MenuTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'cake' && (
            <CakeTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'gallery' && (
            <GalleryTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'pages' && (
            <PagesTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'media' && (
            <MediaTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'biz' && (
            <BizTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
            />
          )}

          {activeTab === 'eng' && (
            <EngineerTab
              store={store}
              onUpdateStore={handleUpdateStoreWithHistory}
              onToast={showToast}
              onOpenIoModal={openIoModal}
              onOpenResetModal={() => setResetModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* EXPORT / IMPORT MODAL */}
      <div
        className={`za-mo ${ioModalOpen ? 'on' : ''}`}
        onClick={() => setIoModalOpen(false)}
      >
        <div className="za-mb" onClick={(e) => e.stopPropagation()}>
          <div className="za-eb">Backup</div>
          <h2>Export / Import</h2>
          <p style={{ color: 'var(--za-mu)', fontSize: '12.5px' }}>
            Copy this text to back up everything, or paste a backup here and
            press Import.
          </p>
          <textarea
            value={ioText}
            onChange={(e) => setIoText(e.target.value)}
          />
          <div className="za-acts" style={{ margin: 0 }}>
            <button
              type="button"
              className="za-btn za-b1"
              onClick={() => {
                navigator.clipboard.writeText(ioText);
                showToast('Copied ✓');
              }}
            >
              Copy
            </button>
            <button
              type="button"
              className="za-btn za-b2"
              onClick={handleImportJson}
            >
              Import pasted data
            </button>
            <button
              type="button"
              className="za-btn za-b3"
              style={{ marginLeft: 'auto' }}
              onClick={() => setIoModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* RESET TO DEFAULT MODAL */}
      <div
        className={`za-mo ${resetModalOpen ? 'on' : ''}`}
        onClick={() => setResetModalOpen(false)}
      >
        <div className="za-mb" onClick={(e) => e.stopPropagation()}>
          <h2>Reset everything?</h2>
          <p style={{ margin: '10px 0 16px', color: 'var(--za-mu)' }}>
            This replaces all your edits with the original website content.
          </p>
          <div className="za-acts" style={{ margin: 0 }}>
            <button
              type="button"
              className="za-btn za-b1 za-bd"
              style={{ background: 'var(--za-red)', color: '#fff' }}
              onClick={handleResetToDefault}
            >
              Yes, reset
            </button>
            <button
              type="button"
              className="za-btn za-b3"
              onClick={() => setResetModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* MEMBERS CSV MODAL */}
      <div
        className={`za-mo ${csvModalOpen ? 'on' : ''}`}
        onClick={() => setCsvModalOpen(false)}
      >
        <div className="za-mb" onClick={(e) => e.stopPropagation()}>
          <div className="za-eb">Members</div>
          <h2>Export list</h2>
          <textarea readOnly value={generateMembersCsv()} />
          <div className="za-acts" style={{ margin: 0 }}>
            <button
              type="button"
              className="za-btn za-b1"
              onClick={() => {
                navigator.clipboard.writeText(generateMembersCsv());
                showToast('Copied ✓');
              }}
            >
              Copy (paste into Excel)
            </button>
            <button
              type="button"
              className="za-btn za-b3"
              style={{ marginLeft: 'auto' }}
              onClick={() => setCsvModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`za-toast ${toastMessage ? 'on' : ''}`}>
        <span>{toastMessage}</span>
        {toastCanUndo && (
          <button type="button" onClick={handleUndo}>
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
