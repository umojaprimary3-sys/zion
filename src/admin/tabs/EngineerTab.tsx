import React, { useState, useEffect } from 'react';
import { StoreData, ConfigRecord } from '../../data/store';
import { TextField } from '../components/FormFields';
import {
  checkSupabaseHealth,
  SupabaseHealthResult,
  activeSupabaseUrl,
  activeSupabaseAnonKey,
  isSupabaseConfigured,
  STORAGE_BUCKET,
} from '../../lib/supabase';

interface EngineerTabProps {
  store: StoreData;
  onUpdateStore: (updater: (prev: StoreData) => StoreData) => void;
  onToast: (msg: string, undo?: boolean) => void;
  onOpenIoModal: () => void;
  onOpenResetModal: () => void;
}

export const EngineerTab: React.FC<EngineerTabProps> = ({
  store,
  onUpdateStore,
  onToast,
  onOpenIoModal,
  onOpenResetModal,
}) => {
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState<SupabaseHealthResult | null>(null);

  // Manual URL/Key override for preview / testing
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(activeSupabaseUrl || '');
  const [supabaseAnonKeyInput, setSupabaseAnonKeyInput] = useState(activeSupabaseAnonKey || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Run an initial quick health check on mount if configured
    if (isSupabaseConfigured()) {
      checkSupabaseHealth().then(setHealthResult).catch(() => {});
    }
  }, []);

  const updateCfg = (updates: Partial<ConfigRecord>) => {
    onUpdateStore((prev) => ({
      ...prev,
      cfg: { ...prev.cfg, ...updates },
    }));
  };

  const handleSaveSupabaseConfig = () => {
    const url = supabaseUrlInput.trim();
    const key = supabaseAnonKeyInput.trim();
    if (url) sessionStorage.setItem('zion_supabase_url', url);
    else sessionStorage.removeItem('zion_supabase_url');

    if (key) sessionStorage.setItem('zion_supabase_anon_key', key);
    else sessionStorage.removeItem('zion_supabase_anon_key');

    onToast('Supabase settings updated. Reloading data…');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    onToast('Testing Supabase connection…');

    try {
      const res = await checkSupabaseHealth();
      setHealthResult(res);
      if (res.ok) {
        onToast(`Supabase connected (${res.latencyMs}ms) ✓`);
      } else {
        onToast(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reach Supabase';
      onToast(`Error: ${msg}`);
      setHealthResult({
        ok: false,
        latencyMs: 0,
        configured: isSupabaseConfigured(),
        message: msg,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      {/* SUPABASE CONNECTION STATUS */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <div className="za-eb">Database & Storage</div>
            <h2>Supabase Connection</h2>
            <p>
              Direct real-time connection to Supabase PostgreSQL and Supabase Storage bucket <code>{STORAGE_BUCKET}</code>.
            </p>
          </div>
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                background: isSupabaseConfigured() ? '#1a3826' : '#3d2b1f',
                color: isSupabaseConfigured() ? '#74d99f' : '#f5a65b',
                border: `1px solid ${isSupabaseConfigured() ? '#2a5e3d' : '#6b4329'}`,
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isSupabaseConfigured() ? '#3dd68c' : '#f5a65b',
                }}
              />
              {isSupabaseConfigured() ? 'Supabase Configured' : 'Local Fallback Mode'}
            </span>
          </div>
        </div>

        <div className="za-g2">
          <TextField
            label="Supabase URL (VITE_SUPABASE_URL)"
            placeholder="https://YOUR-PROJECT.supabase.co"
            hint="from Project Settings -> API"
            value={supabaseUrlInput}
            onChange={setSupabaseUrlInput}
          />

          <div className="za-fld">
            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
                <span style={{ color: 'var(--text-muted)' }}> · public client key</span>
              </span>
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--za-acc, #c87d32)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: 0,
                }}
              >
                {showKey ? 'Hide key' : 'Show key'}
              </button>
            </label>
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={supabaseAnonKeyInput}
              onChange={(e) => setSupabaseAnonKeyInput(e.target.value)}
            />
          </div>

          <TextField
            label="Order number prefix"
            value={store.cfg?.prefix || 'ZN'}
            onChange={(val) => updateCfg({ prefix: val })}
          />

          <TextField
            label="Email sender name"
            value={store.cfg?.fromName || 'Zion Cakes & Bites'}
            onChange={(val) => updateCfg({ fromName: val })}
          />

          <TextField
            label="Email sender address"
            type="email"
            value={store.cfg?.from || 'orders@zioncakesmbeya.com'}
            onChange={(val) => updateCfg({ from: val })}
          />

          <TextField
            label="Send new-order alerts to"
            type="email"
            value={store.cfg?.notify || 'orders@zioncakesmbeya.com'}
            onChange={(val) => updateCfg({ notify: val })}
          />
        </div>

        <div className="za-acts" style={{ gap: '10px', marginTop: '16px' }}>
          <button
            type="button"
            className="za-btn za-b2"
            disabled={testing}
            onClick={handleTestConnection}
          >
            {testing ? 'Checking database…' : '⚡ Test Supabase Connection'}
          </button>

          {(supabaseUrlInput !== activeSupabaseUrl || supabaseAnonKeyInput !== activeSupabaseAnonKey) && (
            <button
              type="button"
              className="za-btn za-b1"
              onClick={handleSaveSupabaseConfig}
            >
              Save & Apply Credentials
            </button>
          )}
        </div>

        {/* HEALTH CHECK RESULTS */}
        {healthResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '14px',
              background: healthResult.ok ? 'rgba(46, 125, 50, 0.15)' : 'rgba(198, 40, 40, 0.15)',
              border: `1px solid ${healthResult.ok ? '#2e7d32' : '#c62828'}`,
              color: healthResult.ok ? '#a5d6a7' : '#ef9a9a',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            <b>{healthResult.ok ? '✓ Connection Verified' : '✕ Connection Diagnostic'}</b>
            <p style={{ margin: '4px 0 8px', color: '#e0e0e0' }}>{healthResult.message}</p>
            {healthResult.tables && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  marginTop: '10px',
                  fontSize: '12px',
                }}
              >
                <div>orders: {healthResult.tables.orders ? '🟢 Active' : '⚪ Not found'}</div>
                <div>inquiries: {healthResult.tables.inquiries ? '🟢 Active' : '⚪ Not found'}</div>
                <div>reviews: {healthResult.tables.reviews ? '🟢 Active' : '⚪ Not found'}</div>
                <div>members: {healthResult.tables.members ? '🟢 Active' : '⚪ Not found'}</div>
                <div>menu_items: {healthResult.tables.menu_items ? '🟢 Active' : '⚪ Not found'}</div>
                <div>site_content: {healthResult.tables.site_content ? '🟢 Active' : '⚪ Not found'}</div>
              </div>
            )}
            {healthResult.userRole && (
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: '#cfcfcf' }}>
                Auth Client Role: <b>{healthResult.userRole}</b>
              </div>
            )}
          </div>
        )}
      </section>

      {/* SCHEMA GUIDE */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Supabase Architecture & Table Schema</h2>
            <p>
              The application communicates directly with Supabase via <code>@supabase/supabase-js</code>.
              No intermediate proxy or server required.
            </p>
          </div>
        </div>

        <pre
          style={{
            font: '12px/1.8 monospace',
            whiteSpace: 'pre-wrap',
            background: 'var(--za-dark, #1c1815)',
            color: '#cfc6b8',
            padding: '16px',
            borderRadius: '16px',
            overflowX: 'auto',
          }}
        >
{`-- 1. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  type text not null default 'delivery',
  status text not null default 'new',
  name text not null,
  phone text default '',
  email text default '',
  zone text default '',
  items text default '',
  total numeric default 0,
  pay text default 'unpaid',
  date text default '',
  notes text default '',
  src text default 'Website order pop-up',
  created_at timestamptz default now()
);

-- 2. INQUIRIES / MESSAGES TABLE
create table if not exists public.inquiries (
  id bigint generated always as identity primary key,
  name text not null,
  phone text default '',
  email text default '',
  type text default 'General Question',
  message text default '',
  date text default '',
  status text default 'unread',
  created_at timestamptz default now()
);

-- 3. REVIEWS TABLE (Default status 'pending' for moderation)
create table if not exists public.reviews (
  id text primary key,
  author text not null,
  location text default 'Mbeya',
  rating integer default 5,
  comment text default '',
  date text default '',
  occasion text default '',
  verified boolean default false,
  status text default 'pending',
  reply text default '',
  featured boolean default false,
  created_at timestamptz default now()
);

-- 4. MEMBERS TABLE
create table if not exists public.members (
  id text primary key,
  name text not null,
  phone text default '',
  email text default '',
  area text default '',
  joined text default '',
  birthday text default '',
  consent boolean default true,
  status text default 'active',
  notes text default '',
  created_at timestamptz default now()
);

-- 5. MENU ITEMS & CATEGORIES
create table if not exists public.menu_items (
  id text primary key,
  name text not null,
  category text not null,
  description text default '',
  price numeric default 0,
  image text default '',
  popular boolean default false,
  serves text default '',
  prep_time text default '',
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 6. SITE CONTENT & CONFIG (Home, banners, cake studio, biz, hours, zones)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- 7. SUPABASE STORAGE BUCKET
-- Create public bucket named 'images' (or 'zion-images')`}
        </pre>
      </section>

      {/* DATA BACKUP & RESTORE */}
      <section className="za-sec">
        <div className="za-sh">
          <div>
            <h2>Data Backup & Local Snapshot</h2>
            <p>Back up, restore or reset application records.</p>
          </div>
        </div>
        <div className="za-acts" style={{ margin: 0 }}>
          <button
            type="button"
            className="za-btn za-b2"
            onClick={onOpenIoModal}
          >
            ⇅ Export / Import
          </button>
          <button
            type="button"
            className="za-btn za-b3 za-bd"
            onClick={onOpenResetModal}
          >
            ↺ Reset to original
          </button>
        </div>
      </section>
    </div>
  );
};
