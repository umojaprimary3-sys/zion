import { createClient, SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://epmbgzhhhdfxduqjqfjw.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwbWJnemhoaGRmeGR1cWpxZmp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3Nzc5NzAsImV4cCI6MjEwNjM1Mzk3MH0.lW9N2_CwN2hCRGN2WftVH1NDbqBkJlRGo8r8FiLhnHo';

// Read credentials strictly from import.meta.env as required
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || defaultUrl).trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey).trim();

// Runtime configuration fallback (e.g. if configured through Engineer tab in preview)
let runtimeUrl = '';
let runtimeAnonKey = '';

try {
  runtimeUrl = sessionStorage.getItem('zion_supabase_url') || '';
  runtimeAnonKey = sessionStorage.getItem('zion_supabase_anon_key') || '';
} catch {
  // Session storage not accessible
}

export const activeSupabaseUrl = rawUrl || runtimeUrl || '';
export const activeSupabaseAnonKey = rawAnonKey || runtimeAnonKey || '';

export const isSupabaseConfigured = (): boolean => {
  const url = activeSupabaseUrl;
  const key = activeSupabaseAnonKey;
  if (!url || !key) return false;
  if (url.includes('YOUR-PROJECT') || key.includes('YOUR_PUBLIC_ANON_KEY')) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

// Fallback safe URL so createClient does not crash if env vars are missing during initial build
const safeUrl = isSupabaseConfigured() ? activeSupabaseUrl : defaultUrl;
const safeKey = isSupabaseConfigured() ? activeSupabaseAnonKey : defaultAnonKey;

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const STORAGE_BUCKET = 'images';
export const FALLBACK_BUCKET = 'zion-images';

/**
 * Upload an image file to Supabase Storage and retrieve its public URL.
 */
export async function uploadImageToSupabase(
  file: File | Blob,
  folder = 'media'
): Promise<{ url: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      url: '',
      error: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const rawName = (file as File).name || 'upload.jpg';
  const cleanExt = rawName.includes('.') ? rawName.split('.').pop() : 'jpg';
  const cleanBase = rawName.substring(0, rawName.lastIndexOf('.')) || 'photo';
  const sanitized = cleanBase.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filePath = `${folder}/${Date.now()}_${sanitized}.${cleanExt}`;

  // Try default bucket, then fallback bucket
  const bucketsToTry = [STORAGE_BUCKET, FALLBACK_BUCKET, 'media', 'public'];
  let lastError = '';

  for (const bucket of bucketsToTry) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (!error && data) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);
        return { url: publicUrl };
      }
      if (error) {
        lastError = error.message;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    url: '',
    error: `Storage upload failed: ${lastError || 'Could not access storage bucket'}. Please create an '${STORAGE_BUCKET}' public bucket in your Supabase project.`,
  };
}

/**
 * Health check to verify connection to Supabase and list accessible tables.
 */
export interface SupabaseHealthResult {
  ok: boolean;
  latencyMs: number;
  message: string;
  configured: boolean;
  userRole?: string;
  tables?: {
    orders: boolean;
    inquiries: boolean;
    reviews: boolean;
    members: boolean;
    menu_items: boolean;
    site_content: boolean;
  };
}

export async function checkSupabaseHealth(): Promise<SupabaseHealthResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      latencyMs: 0,
      configured: false,
      message: 'Supabase credentials are not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    };
  }

  const start = performance.now();
  const tablesStatus = {
    orders: false,
    inquiries: false,
    reviews: false,
    members: false,
    menu_items: false,
    site_content: false,
  };

  try {
    // Check connection using an innocuous query
    const [ordersRes, inqRes, revRes, memRes, menuRes, contentRes] = await Promise.allSettled([
      supabase.from('orders').select('id').limit(1),
      supabase.from('inquiries').select('id').limit(1),
      supabase.from('reviews').select('id').limit(1),
      supabase.from('members').select('id').limit(1),
      supabase.from('menu_items').select('id').limit(1),
      supabase.from('site_content').select('key').limit(1),
    ]);

    const latencyMs = Math.round(performance.now() - start);

    if (ordersRes.status === 'fulfilled' && !ordersRes.value.error) tablesStatus.orders = true;
    if (inqRes.status === 'fulfilled' && !inqRes.value.error) tablesStatus.inquiries = true;
    if (revRes.status === 'fulfilled' && !revRes.value.error) tablesStatus.reviews = true;
    if (memRes.status === 'fulfilled' && !memRes.value.error) tablesStatus.members = true;
    if (menuRes.status === 'fulfilled' && !menuRes.value.error) tablesStatus.menu_items = true;
    if (contentRes.status === 'fulfilled' && !contentRes.value.error) tablesStatus.site_content = true;

    // Get current auth session
    const { data: authData } = await supabase.auth.getSession();
    const role = authData?.session?.user ? `authenticated (${authData.session.user.email})` : 'anon (public)';

    const anyTableAccessible = Object.values(tablesStatus).some(Boolean);

    return {
      ok: true,
      latencyMs,
      configured: true,
      userRole: role,
      tables: tablesStatus,
      message: anyTableAccessible
        ? `Connected to Supabase in ${latencyMs}ms. Database active.`
        : `Connected to Supabase endpoint in ${latencyMs}ms. Ready for database sync.`,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      latencyMs,
      configured: true,
      message: `Failed to reach Supabase: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
