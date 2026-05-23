import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const USERNAME_TO_EMAIL: Record<string, string> = {
  'admin-ashtaar': 'admin-ashtaar@ashtaar.local',
};

export function usernameToEmail(username: string): string {
  const trimmed = username.trim().toLowerCase();
  if (USERNAME_TO_EMAIL[trimmed]) return USERNAME_TO_EMAIL[trimmed];
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@ashtaar.local`;
}

export function isAdminSession(session: Session | null): boolean {
  if (!session?.user) return false;
  const role = (session.user.app_metadata as { role?: string } | undefined)?.role;
  return role === 'admin';
}

export type AuthState = {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
};

export function useAdminAuth(): AuthState & {
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} {
  const [state, setState] = useState<AuthState>({
    session: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        session: data.session,
        isAdmin: isAdminSession(data.session),
        loading: false,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (!mounted) return;
      setState({
        session,
        isAdmin: isAdminSession(session),
        loading: false,
      });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (username: string, password: string) => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, signIn, signOut };
}
