import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  DataAdapter,
  StoreData,
  DEFAULT_STORE,
  OrderRecord,
  InquiryRecord,
  ReviewRecord,
  MenuItemData,
  MenuCat,
  MemberRecord,
  notifyStoreSubscribers,
} from './store';

const STORAGE_CACHE_KEY = 'zion-admin-v2';

export class SupabaseDataAdapter implements DataAdapter {
  private inMemoryData: StoreData | null = null;
  private realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
  private hasSubscribedRealtime = false;

  constructor() {
    this.initRealtime();
  }

  /**
   * Initializes Supabase Realtime channel to subscribe to live updates.
   */
  private initRealtime() {
    if (!isSupabaseConfigured() || this.hasSubscribedRealtime) return;

    try {
      this.realtimeChannel = supabase
        .channel('zion-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            this.handleOrderChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          (payload) => {
            this.handleReviewChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inquiries' },
          (payload) => {
            this.handleInquiryChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'menu_items' },
          () => {
            // Refetch menu items
            this.refreshMenu();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'site_content' },
          (payload) => {
            this.handleContentChange(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.hasSubscribedRealtime = true;
          }
        });
    } catch (err) {
      console.warn('Could not initialize Supabase Realtime:', err);
    }
  }

  private handleOrderChange(payload: any) {
    if (!this.inMemoryData) return;
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const currentOrders = [...this.inMemoryData.orders];

    if (eventType === 'INSERT') {
      const mapped = this.mapOrderFromRow(newRecord);
      if (!currentOrders.some((o) => o.id === mapped.id)) {
        this.inMemoryData.orders = [mapped, ...currentOrders];
        notifyStoreSubscribers(this.inMemoryData);
      }
    } else if (eventType === 'UPDATE') {
      const mapped = this.mapOrderFromRow(newRecord);
      const index = currentOrders.findIndex((o) => o.id === mapped.id);
      if (index !== -1) {
        currentOrders[index] = mapped;
        this.inMemoryData.orders = currentOrders;
        notifyStoreSubscribers(this.inMemoryData);
      }
    } else if (eventType === 'DELETE') {
      this.inMemoryData.orders = currentOrders.filter((o) => o.id !== oldRecord.id);
      notifyStoreSubscribers(this.inMemoryData);
    }
  }

  private handleReviewChange(payload: any) {
    if (!this.inMemoryData) return;
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const currentReviews = [...this.inMemoryData.reviews];

    if (eventType === 'INSERT') {
      const mapped = this.mapReviewFromRow(newRecord);
      if (!currentReviews.some((r) => r.id === mapped.id || (r.author === mapped.author && r.comment === mapped.comment))) {
        this.inMemoryData.reviews = [mapped, ...currentReviews];
        notifyStoreSubscribers(this.inMemoryData);
      }
    } else if (eventType === 'UPDATE') {
      const mapped = this.mapReviewFromRow(newRecord);
      const index = currentReviews.findIndex((r) => r.id === mapped.id);
      if (index !== -1) {
        currentReviews[index] = mapped;
        this.inMemoryData.reviews = currentReviews;
        notifyStoreSubscribers(this.inMemoryData);
      }
    } else if (eventType === 'DELETE') {
      this.inMemoryData.reviews = currentReviews.filter((r) => r.id !== oldRecord.id);
      notifyStoreSubscribers(this.inMemoryData);
    }
  }

  private handleInquiryChange(payload: any) {
    if (!this.inMemoryData) return;
    const { eventType, new: newRecord, old: oldRecord } = payload;
    const currentInbox = [...this.inMemoryData.inbox];

    if (eventType === 'INSERT') {
      const mapped = this.mapInquiryFromRow(newRecord);
      this.inMemoryData.inbox = [mapped, ...currentInbox];
      notifyStoreSubscribers(this.inMemoryData);
    } else if (eventType === 'UPDATE') {
      const mapped = this.mapInquiryFromRow(newRecord);
      const index = currentInbox.findIndex((i) => i.name === mapped.name && i.date === mapped.date);
      if (index !== -1) {
        currentInbox[index] = mapped;
        this.inMemoryData.inbox = currentInbox;
        notifyStoreSubscribers(this.inMemoryData);
      }
    } else if (eventType === 'DELETE') {
      this.inMemoryData.inbox = currentInbox.filter((i) => i.name !== oldRecord.name || i.message !== oldRecord.message);
      notifyStoreSubscribers(this.inMemoryData);
    }
  }

  private handleContentChange(payload: any) {
    if (!this.inMemoryData) return;
    const { new: newRecord } = payload;
    if (newRecord?.key && newRecord?.value) {
      const key = newRecord.key;
      const val = newRecord.value;
      if (key === 'main_content') {
        this.inMemoryData = { ...this.inMemoryData, ...val };
        notifyStoreSubscribers(this.inMemoryData);
      } else if (key in this.inMemoryData) {
        (this.inMemoryData as any)[key] = val;
        notifyStoreSubscribers(this.inMemoryData);
      }
    }
  }

  private async refreshMenu() {
    try {
      const { data } = await supabase.from('menu_items').select('*').order('sort_order', { ascending: true });
      if (data && data.length > 0 && this.inMemoryData) {
        this.inMemoryData.menu = data.map((row) => this.mapMenuItemFromRow(row));
        notifyStoreSubscribers(this.inMemoryData);
      }
    } catch (e) {
      console.warn('refreshMenu error:', e);
    }
  }

  /**
   * Reads cached data from localStorage for instant, zero-latency initial rendering.
   */
  private getCachedData(): StoreData {
    try {
      const raw = localStorage.getItem(STORAGE_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.orders || parsed.menu)) {
          return {
            ...DEFAULT_STORE,
            ...parsed,
            pg: { ...DEFAULT_STORE.pg, ...(parsed.pg || {}) },
            home: { ...DEFAULT_STORE.home, ...(parsed.home || {}) },
            banners: { ...DEFAULT_STORE.banners, ...(parsed.banners || {}) },
            biz: { ...DEFAULT_STORE.biz, ...(parsed.biz || {}) },
            cfg: { ...DEFAULT_STORE.cfg, ...(parsed.cfg || {}) },
          };
        }
      }
    } catch {
      // Ignored
    }
    return JSON.parse(JSON.stringify(DEFAULT_STORE));
  }

  /**
   * Persists to local cache.
   */
  private saveCachedData(data: StoreData) {
    try {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Storage quota or disabled
    }
  }

  /**
   * Main getData entry point.
   */
  async getData(): Promise<StoreData> {
    if (!isSupabaseConfigured()) {
      const local = this.getCachedData();
      this.inMemoryData = local;
      return local;
    }

    try {
      // Parallel fetch from Supabase tables
      const [
        ordersRes,
        inqRes,
        revRes,
        memRes,
        menuRes,
        catRes,
        contentRes,
      ] = await Promise.allSettled([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('members').select('*'),
        supabase.from('menu_items').select('*'),
        supabase.from('menu_categories').select('*'),
        supabase.from('site_content').select('*'),
      ]);

      const base = this.getCachedData();
      const merged: StoreData = { ...base };

      // Process orders
      if (ordersRes.status === 'fulfilled' && !ordersRes.value.error && ordersRes.value.data) {
        if (ordersRes.value.data.length > 0) {
          merged.orders = ordersRes.value.data.map((row) => this.mapOrderFromRow(row));
        }
      }

      // Process inquiries
      if (inqRes.status === 'fulfilled' && !inqRes.value.error && inqRes.value.data) {
        if (inqRes.value.data.length > 0) {
          merged.inbox = inqRes.value.data.map((row) => this.mapInquiryFromRow(row));
        }
      } else {
        // Fallback check table 'messages'
        try {
          const { data: msgData, error: msgErr } = await supabase.from('messages').select('*');
          if (!msgErr && msgData && msgData.length > 0) {
            merged.inbox = msgData.map((row) => this.mapInquiryFromRow(row));
          }
        } catch {
          // Table doesn't exist
        }
      }

      // Process reviews
      if (revRes.status === 'fulfilled' && !revRes.value.error && revRes.value.data) {
        if (revRes.value.data.length > 0) {
          merged.reviews = revRes.value.data.map((row) => this.mapReviewFromRow(row));
        }
      }

      // Process members
      if (memRes.status === 'fulfilled' && !memRes.value.error && memRes.value.data) {
        if (memRes.value.data.length > 0) {
          merged.members = memRes.value.data.map((row) => this.mapMemberFromRow(row));
        }
      }

      // Process menu items
      if (menuRes.status === 'fulfilled' && !menuRes.value.error && menuRes.value.data) {
        if (menuRes.value.data.length > 0) {
          merged.menu = menuRes.value.data.map((row) => this.mapMenuItemFromRow(row));
        }
      }

      // Process menu categories
      if (catRes.status === 'fulfilled' && !catRes.value.error && catRes.value.data) {
        if (catRes.value.data.length > 0) {
          merged.cats = catRes.value.data.map((row: any) => ({
            id: row.id,
            label: row.label || row.name || row.title,
            icon: row.icon || '🍽️',
          }));
        }
      }

      // Process site content
      if (contentRes.status === 'fulfilled' && !contentRes.value.error && contentRes.value.data) {
        for (const row of contentRes.value.data) {
          const k = row.key || row.id;
          const v = row.value || row.data || row.content;
          if (k === 'main_content' && typeof v === 'object') {
            Object.assign(merged, v);
          } else if (k && v && typeof v === 'object' && k in merged) {
            (merged as any)[k] = { ...(merged as any)[k], ...v };
          } else if (k && v && k in merged) {
            (merged as any)[k] = v;
          }
        }
      }

      this.inMemoryData = merged;
      this.saveCachedData(merged);
      return merged;
    } catch (err) {
      console.warn('Supabase getData encountered an issue, serving local data:', err);
      const fallback = this.getCachedData();
      this.inMemoryData = fallback;
      return fallback;
    }
  }

  /**
   * Saves updated store data back to Supabase.
   */
  async saveData(data: StoreData): Promise<void> {
    this.inMemoryData = data;
    this.saveCachedData(data);
    notifyStoreSubscribers(data);

    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      // 1. Sync site_content (general settings, home, biz, banners, pg, etc.)
      const contentPayload = {
        key: 'main_content',
        value: {
          biz: data.biz,
          banners: data.banners,
          home: data.home,
          pg: data.pg,
          hours: data.hours,
          zones: data.zones,
          faq: data.faq,
          cfg: data.cfg,
          gallery: data.gallery,
          sizes: data.sizes,
          flavors: data.flavors,
          occ: data.occ,
          decos: data.decos,
          addons: data.addons,
        },
        updated_at: new Date().toISOString(),
      };

      await supabase.from('site_content').upsert(contentPayload, { onConflict: 'key' });

      // 2. Sync individual tables in background without blocking UI
      // Menu items upsert
      if (data.menu && data.menu.length > 0) {
        try {
          const rows = data.menu.map((m, idx) => ({
            id: m.id,
            name: m.name,
            category: m.category,
            description: m.description,
            price: m.price,
            image: m.image,
            popular: !!m.popular,
            serves: m.serves || '',
            prep_time: m.prepTime || '',
            sort_order: idx,
          }));
          await supabase.from('menu_items').upsert(rows, { onConflict: 'id' });
        } catch (e) {
          console.warn('menu_items upsert:', e);
        }
      }

      // Categories upsert
      if (data.cats && data.cats.length > 0) {
        try {
          const catRows = data.cats.map((c, idx) => ({
            id: c.id,
            label: c.label,
            icon: c.icon,
            sort_order: idx,
          }));
          await supabase.from('menu_categories').upsert(catRows, { onConflict: 'id' });
        } catch (e) {
          console.warn('menu_categories upsert:', e);
        }
      }

      // Members upsert
      if (data.members && data.members.length > 0) {
        try {
          const memRows = data.members.map((m) => ({
            id: m.id,
            user_id: m.user_id || null,
            name: m.name,
            phone: m.phone,
            email: m.email,
            area: m.area,
            joined: m.joined,
            birthday: m.birthday,
            consent: !!m.consent,
            status: m.status,
            notes: m.notes,
          }));
          await supabase.from('members').upsert(memRows, { onConflict: 'id' });
        } catch (e) {
          console.warn('members upsert:', e);
        }
      }

      // Orders upsert
      if (data.orders && data.orders.length > 0) {
        try {
          const orderRows = data.orders.map((o) => ({
            id: o.id,
            user_id: o.user_id || null,
            member_id: o.member_id || null,
            type: o.type,
            status: o.status,
            name: o.name,
            phone: o.phone,
            email: o.email,
            zone: o.zone,
            items: o.items,
            total: o.total,
            pay: o.pay,
            date: o.date,
            notes: o.notes,
            src: o.src,
          }));
          await supabase.from('orders').upsert(orderRows, { onConflict: 'id' });
        } catch (e) {
          console.warn('orders upsert:', e);
        }
      }

      // Reviews upsert
      if (data.reviews && data.reviews.length > 0) {
        try {
          const reviewRows = data.reviews.map((r, idx) => ({
            id: r.id || `rev-${idx}-${r.author.toLowerCase().replace(/\s+/g, '_')}`,
            author: r.author,
            location: r.location,
            rating: r.rating,
            comment: r.comment,
            date: r.date,
            occasion: r.occasion,
            verified: !!r.verified,
            status: r.status,
            reply: r.reply || '',
            featured: !!r.featured,
          }));
          await supabase.from('reviews').upsert(reviewRows, { onConflict: 'id' });
        } catch (e) {
          console.warn('reviews upsert:', e);
        }
      }
    } catch (err) {
      console.warn('Supabase saveData error:', err);
    }
  }

  /**
   * Insert a new order into Supabase.
   */
  async createOrder(order: OrderRecord): Promise<void> {
    // 1. Optimistic update
    const current = this.inMemoryData || this.getCachedData();
    const updated = {
      ...current,
      orders: [order, ...current.orders.filter((o) => o.id !== order.id)],
    };
    this.inMemoryData = updated;
    this.saveCachedData(updated);
    notifyStoreSubscribers(updated);

    if (!isSupabaseConfigured()) return;

    try {
      const row = {
        id: order.id,
        user_id: order.user_id || null,
        member_id: order.member_id || null,
        type: order.type,
        status: order.status || 'new',
        name: order.name,
        phone: order.phone || '',
        email: order.email || '',
        zone: order.zone || '',
        items: order.items || '',
        total: order.total || 0,
        pay: order.pay || 'unpaid',
        date: order.date || new Date().toISOString().slice(0, 10),
        notes: order.notes || '',
        src: order.src || 'Website order pop-up',
      };

      const { error } = await supabase.from('orders').insert(row);
      if (error) {
        console.error('Failed to insert order into Supabase:', error.message);
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Supabase createOrder failed:', err);
      throw err;
    }
  }

  /**
   * Insert a new inquiry / contact message into Supabase.
   */
  async createInquiry(inquiry: InquiryRecord): Promise<void> {
    // 1. Optimistic update
    const current = this.inMemoryData || this.getCachedData();
    const updated = {
      ...current,
      inbox: [inquiry, ...current.inbox],
    };
    this.inMemoryData = updated;
    this.saveCachedData(updated);
    notifyStoreSubscribers(updated);

    if (!isSupabaseConfigured()) return;

    try {
      const row = {
        name: inquiry.name,
        phone: inquiry.phone || '',
        email: inquiry.email || '',
        type: inquiry.type || 'General Question',
        message: inquiry.message || '',
        date: inquiry.date || new Date().toISOString().slice(0, 10),
        status: inquiry.status || 'unread',
      };

      const { error } = await supabase.from('inquiries').insert(row);
      if (error) {
        // Fallback to table 'messages'
        const { error: msgErr } = await supabase.from('messages').insert(row);
        if (msgErr) {
          console.error('Failed to insert inquiry into Supabase:', msgErr.message);
          throw new Error(msgErr.message);
        }
      }
    } catch (err) {
      console.error('Supabase createInquiry failed:', err);
      throw err;
    }
  }

  /**
   * Insert a new customer review into Supabase (status strictly 'pending' by default).
   */
  async createReview(review: ReviewRecord): Promise<void> {
    // Force status 'pending' as required
    const pendingReview: ReviewRecord = {
      ...review,
      status: 'pending',
      id: review.id || `rev-${Date.now()}`,
    };

    // 1. Optimistic update
    const current = this.inMemoryData || this.getCachedData();
    const updated = {
      ...current,
      reviews: [pendingReview, ...current.reviews],
    };
    this.inMemoryData = updated;
    this.saveCachedData(updated);
    notifyStoreSubscribers(updated);

    if (!isSupabaseConfigured()) return;

    try {
      const row = {
        id: pendingReview.id,
        author: pendingReview.author,
        location: pendingReview.location || 'Mbeya',
        rating: pendingReview.rating || 5,
        comment: pendingReview.comment || '',
        date: pendingReview.date || new Date().toISOString().slice(0, 10),
        occasion: pendingReview.occasion || '',
        verified: !!pendingReview.verified,
        status: 'pending',
        reply: '',
        featured: false,
      };

      const { error } = await supabase.from('reviews').insert(row);
      if (error) {
        console.error('Failed to insert review into Supabase:', error.message);
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Supabase createReview failed:', err);
      throw err;
    }
  }

  // Row mappers to ensure strict safety and handle snake_case vs camelCase
  private mapOrderFromRow(row: any): OrderRecord {
    return {
      id: String(row.id || ''),
      user_id: row.user_id ? String(row.user_id) : undefined,
      member_id: row.member_id ? String(row.member_id) : undefined,
      type: row.type || 'delivery',
      status: row.status || 'new',
      name: row.name || 'Customer',
      phone: row.phone || '',
      email: row.email || '',
      zone: row.zone || '',
      items: row.items || '',
      total: Number(row.total) || 0,
      pay: row.pay || 'unpaid',
      date: row.date || (row.created_at ? String(row.created_at).slice(0, 10) : ''),
      notes: row.notes || '',
      src: row.src || 'Website order',
    };
  }

  private mapInquiryFromRow(row: any): InquiryRecord {
    return {
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      type: row.type || 'General Question',
      message: row.message || '',
      date: row.date || (row.created_at ? String(row.created_at).slice(0, 10) : ''),
      status: row.status || 'unread',
    };
  }

  private mapReviewFromRow(row: any): ReviewRecord {
    return {
      id: String(row.id || ''),
      author: row.author || 'Anonymous',
      location: row.location || 'Mbeya',
      rating: Number(row.rating) || 5,
      comment: row.comment || '',
      date: row.date || (row.created_at ? String(row.created_at).slice(0, 10) : ''),
      occasion: row.occasion || '',
      verified: row.verified !== false,
      status: row.status || 'approved',
      reply: row.reply || '',
      featured: !!row.featured,
    };
  }

  private mapMemberFromRow(row: any): MemberRecord {
    return {
      id: String(row.id || ''),
      user_id: row.user_id ? String(row.user_id) : undefined,
      name: row.name || '',
      phone: row.phone || '',
      email: row.email || '',
      area: row.area || '',
      joined: row.joined || (row.created_at ? String(row.created_at).slice(0, 10) : ''),
      birthday: row.birthday || '',
      consent: row.consent !== false,
      status: row.status || 'active',
      notes: row.notes || '',
    };
  }

  private mapMenuItemFromRow(row: any): MenuItemData {
    return {
      id: String(row.id || ''),
      name: row.name || '',
      category: row.category || 'cakes',
      description: row.description || '',
      price: Number(row.price) || 0,
      image: row.image || '',
      popular: !!row.popular,
      serves: row.serves || '',
      prepTime: row.prep_time || row.prepTime || '',
    };
  }
}
