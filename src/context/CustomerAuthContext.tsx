import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MemberRecord, OrderRecord } from '../data/store';

export interface CustomerAuthContextType {
  user: User | null;
  member: MemberRecord | null;
  customerOrders: OrderRecord[];
  loading: boolean;
  isLoggedIn: boolean;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    area?: string;
    birthday?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: {
    name?: string;
    phone?: string;
    area?: string;
    birthday?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshCustomerData: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch or create member record corresponding to authenticated auth user
  const fetchOrSyncMember = useCallback(async (authUser: User): Promise<MemberRecord | null> => {
    if (!isSupabaseConfigured()) {
      // Local fallback for offline/preview
      const cached = localStorage.getItem(`zion_customer_member_${authUser.id}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // ignore
        }
      }
      const fallbackMember: MemberRecord = {
        id: `u_${authUser.id.slice(0, 8)}`,
        user_id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Customer',
        phone: authUser.user_metadata?.phone || '',
        email: authUser.email || '',
        area: authUser.user_metadata?.area || '',
        joined: new Date().toISOString().slice(0, 10),
        birthday: authUser.user_metadata?.birthday || '',
        consent: true,
        status: 'active',
        notes: '',
      };
      localStorage.setItem(`zion_customer_member_${authUser.id}`, JSON.stringify(fallbackMember));
      return fallbackMember;
    }

    try {
      // 1. Look up the member by user_id first. If not found, wait 700ms and try once more (the database trigger may still be creating it).
      let { data: byUserId, error: errUserId } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (!byUserId && !errUserId) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const retryRes = await supabase
          .from('members')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();
        byUserId = retryRes.data;
        errUserId = retryRes.error;
      }

      if (byUserId && !errUserId) {
        return {
          id: String(byUserId.id),
          user_id: String(byUserId.user_id),
          name: byUserId.name || authUser.user_metadata?.full_name || 'Customer',
          phone: byUserId.phone || authUser.user_metadata?.phone || '',
          email: byUserId.email || authUser.email || '',
          area: byUserId.area || authUser.user_metadata?.area || '',
          joined: byUserId.joined || (byUserId.created_at ? String(byUserId.created_at).slice(0, 10) : ''),
          birthday: byUserId.birthday || '',
          consent: byUserId.consent !== false,
          status: byUserId.status || 'active',
          notes: byUserId.notes || '',
        };
      }

      // 2. If not found by user_id, try finding member by email to link existing customer
      // Use .eq('email', authUser.email.trim().toLowerCase()) with .limit(1) instead of .ilike and .maybeSingle
      if (authUser.email) {
        const cleanEmail = authUser.email.trim().toLowerCase();
        const { data: emailRows, error: errEmail } = await supabase
          .from('members')
          .select('*')
          .eq('email', cleanEmail)
          .limit(1);

        const byEmail = emailRows && emailRows.length > 0 ? emailRows[0] : null;

        if (byEmail && !errEmail) {
          // Link this member to auth user_id if not linked
          await supabase
            .from('members')
            .update({ user_id: authUser.id })
            .eq('id', byEmail.id);

          return {
            id: String(byEmail.id),
            user_id: authUser.id,
            name: byEmail.name || authUser.user_metadata?.full_name || 'Customer',
            phone: byEmail.phone || authUser.user_metadata?.phone || '',
            email: byEmail.email || authUser.email,
            area: byEmail.area || authUser.user_metadata?.area || '',
            joined: byEmail.joined || (byEmail.created_at ? String(byEmail.created_at).slice(0, 10) : ''),
            birthday: byEmail.birthday || '',
            consent: byEmail.consent !== false,
            status: byEmail.status || 'active',
            notes: byEmail.notes || '',
          };
        }
      }

      // 3. Remove the frontend insert into "members" (the database trigger does this now).
      // If no row exists after retrying, return a local fallback member object but do not insert.
      const fallbackMember: MemberRecord = {
        id: `u_${authUser.id.slice(0, 8)}`,
        user_id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Valued Customer',
        phone: authUser.user_metadata?.phone || '',
        email: authUser.email || '',
        area: authUser.user_metadata?.area || '',
        joined: new Date().toISOString().slice(0, 10),
        birthday: authUser.user_metadata?.birthday || '',
        consent: true,
        status: 'active',
        notes: 'Registered customer account',
      };

      return fallbackMember;
    } catch (e) {
      console.warn('fetchOrSyncMember exception:', e);
      return null;
    }
  }, []);

  // Fetch only this customer's orders
  const fetchCustomerOrders = useCallback(async (authUser: User, memberRec: MemberRecord | null) => {
    if (!isSupabaseConfigured()) {
      // Local fallback
      try {
        const rawStore = localStorage.getItem('zion-admin-v2');
        if (rawStore) {
          const parsed = JSON.parse(rawStore);
          const allOrders: OrderRecord[] = parsed.orders || [];
          const userOrders = allOrders.filter(
            (o) =>
              (o.user_id && o.user_id === authUser.id) ||
              (authUser.email && o.email && o.email.toLowerCase() === authUser.email.toLowerCase()) ||
              (memberRec?.phone && o.phone && o.phone.replace(/\D/g, '') === memberRec.phone.replace(/\D/g, ''))
          );
          setCustomerOrders(userOrders);
          return;
        }
      } catch {
        // ignore
      }
      setCustomerOrders([]);
      return;
    }

    try {
      // Query database for orders belonging to this user
      // Security: Row Level Security will ensure that only authorized rows are returned
      let query = supabase.from('orders').select('*');

      if (authUser.email) {
        query = query.or(`user_id.eq.${authUser.id},email.eq.${authUser.email}`);
      } else {
        query = query.eq('user_id', authUser.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        const mappedOrders: OrderRecord[] = data.map((row: any) => ({
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
        }));
        setCustomerOrders(mappedOrders);
      }
    } catch (e) {
      console.warn('fetchCustomerOrders error:', e);
    }
  }, []);

  const refreshCustomerData = useCallback(async () => {
    if (!user) return;
    const mem = await fetchOrSyncMember(user);
    setMember(mem);
    await fetchCustomerOrders(user, mem);
  }, [user, fetchOrSyncMember, fetchCustomerOrders]);

  // Initial session check and auth state listener
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          const mem = await fetchOrSyncMember(session.user);
          if (isMounted) {
            setMember(mem);
            await fetchCustomerOrders(session.user, mem);
          }
        } else if (isMounted) {
          setUser(null);
          setMember(null);
          setCustomerOrders([]);
        }
      } catch (err) {
        console.warn('Customer auth session check error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          if (!isMounted) return;
          fetchOrSyncMember(session.user)
            .then((mem) => {
              if (!isMounted) return;
              setMember(mem);
              return fetchCustomerOrders(session.user, mem);
            })
            .catch((err) => {
              console.warn('onAuthStateChange sync error:', err);
            })
            .finally(() => {
              if (isMounted) setLoading(false);
            });
        }, 0);
      } else {
        setUser(null);
        setMember(null);
        setCustomerOrders([]);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchOrSyncMember, fetchCustomerOrders]);

  // Realtime subscription for customer's own orders
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel(`customer-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const rec: any = payload.new || payload.old;
          // Only react if order belongs to this customer
          if (
            rec?.user_id === user.id ||
            (user.email && rec?.email && rec.email.toLowerCase() === user.email.toLowerCase())
          ) {
            refreshCustomerData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refreshCustomerData]);

  // Customer Sign Up
  const signUp = async ({
    email,
    password,
    fullName,
    phone,
    area = '',
    birthday = '',
  }: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    area?: string;
    birthday?: string;
  }) => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'The website is not connected to the database yet. Please contact Zion Cakes.',
      };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim();

      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      if (!cleanName) {
        return { success: false, error: 'Please enter your full name.' };
      }
      if (!cleanPhone) {
        return { success: false, error: 'Please enter your phone number for order updates.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            area,
            birthday,
            role: 'customer',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'This email is already registered. Please sign in instead.',
        };
      }

      if (!data?.session) {
        return {
          success: false,
          error: 'Account created, but you are not signed in yet. Please check your email to confirm, then sign in.',
        };
      }

      if (data.user) {
        setUser(data.user);
        const mem = await fetchOrSyncMember(data.user);
        setMember(mem);
        await fetchCustomerOrders(data.user, mem);
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred during registration.',
      };
    }
  };

  // Customer Sign In
  const signIn = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        error: 'The website is not connected to the database yet. Please contact Zion Cakes.',
      };
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter your registered email address.' };
      }
      if (!password) {
        return { success: false, error: 'Please enter your password.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (
          error.message.includes('Email not confirmed') ||
          error.message.toLowerCase().includes('email not confirmed')
        ) {
          return {
            success: false,
            error: 'Please confirm your email first. Check your inbox.',
          };
        }
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. Please check your credentials.',
          };
        }
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        const mem = await fetchOrSyncMember(data.user);
        setMember(mem);
        await fetchCustomerOrders(data.user, mem);
        return { success: true };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login failed. Please try again.',
      };
    }
  };

  // Customer Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setUser(null);
    setMember(null);
    setCustomerOrders([]);
  };

  // Send Password Reset
  const sendPasswordReset = async (email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      const redirectUrl = `${window.location.origin}/#reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to send password reset email.',
      };
    }
  };

  // Update Password (when resetting or changing password)
  const updatePassword = async (newPassword: string) => {
    try {
      if (newPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update password.',
      };
    }
  };

  // Update Profile
  const updateProfile = async (updates: {
    name?: string;
    phone?: string;
    area?: string;
    birthday?: string;
  }) => {
    if (!user) {
      return { success: false, error: 'You must be logged in to update your profile.' };
    }

    try {
      // 1. Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: updates.name,
          phone: updates.phone,
          area: updates.area,
          birthday: updates.birthday,
        },
      });

      // 2. Update member table
      if (member) {
        const updatePayload: any = {};
        if (updates.name !== undefined) updatePayload.name = updates.name.trim();
        if (updates.phone !== undefined) updatePayload.phone = updates.phone.trim();
        if (updates.area !== undefined) updatePayload.area = updates.area.trim();
        if (updates.birthday !== undefined) updatePayload.birthday = updates.birthday.trim();

        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from('members')
            .update(updatePayload)
            .eq('id', member.id);

          if (error) {
            console.warn('Member table update error:', error.message);
          }
        }

        // Update local state
        setMember((prev) => (prev ? { ...prev, ...updatePayload } : null));
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Could not save profile changes.',
      };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        member,
        customerOrders,
        loading,
        isLoggedIn: !!user,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        updatePassword,
        updateProfile,
        refreshCustomerData,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
