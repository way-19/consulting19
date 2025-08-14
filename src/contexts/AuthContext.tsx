import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'admin' | 'consultant' | 'client';

export interface Profile {
  id: string;           // auth.users.id ile aynı
  email: string;
  role: Role;
  full_name?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // StrictMode'da effect'in iki kez tetiklenmesini güvenle engelle
  const initRef = useRef(false);

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    console.log('🔍 Fetching profile for user:', uid);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, country, created_at, updated_at')
      .eq('id', uid)              // profiles.id = auth.users.id
      .maybeSingle();

    if (error) {
      console.error('❌ Profile fetch error:', error);
      setProfile(null);
      return null;
    }
    if (!data) {
      console.warn('ℹ️ Profile not found for user:', uid);
      setProfile(null);
      return null;
    }
    setProfile(data as Profile);
    return data as Profile;
  };

  useEffect(() => {
    if (initRef.current) return;     // ikinci çalışmayı engelle
    initRef.current = true;

    const init = async () => {
      console.log('🚀 Initializing auth...');
      const { data: { session } } = await supabase.auth.getSession();
      const current = session?.user ?? null;
      setUser(current);
      if (current) await fetchProfile(current.id);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_evt, session) => {
        const next = session?.user ?? null;
        setUser(next);
        if (next) {
          await fetchProfile(next.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
    // onAuthStateChange tetiklenecek
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) await fetchProfile(user.id);
  };

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signOut, refreshProfile }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};