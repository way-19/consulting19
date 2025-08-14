import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, Profile, ensureProfile } from '../lib/supabase';

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (authUser: User) => {
    try {
      console.log('🔍 Fetching profile for user:', authUser.id, authUser.email);
      
      // First try to get existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, use ensure_profile function
        console.log('🔧 Profile not found, ensuring profile creation...');
        const profileData = await ensureProfile();
        
        if (profileData && profileData.error) {
          console.error('❌ Error ensuring profile:', profileData.error);
          setProfile(null);
          return;
        }
        
        if (profileData) {
          console.log('✅ Profile ensured:', profileData.email, profileData.legacy_role);
          setProfile(profileData as Profile);
          return;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', error.message);
        setProfile(null);
        return;
      }

      if (data) {
        console.log('✅ Profile found:', data.email, data.legacy_role);
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('💥 Profile fetch failed:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          console.log('✅ Session found for user:', session.user.id, session.user.email);
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          console.log('🔍 No active session');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('🔔 Auth state changed:', event);

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('❌ Sign in error:', error.message);
      throw error;
    }
    console.log('✅ Sign in successful');
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ 
      loading, 
      user, 
      profile, 
      signIn, 
      signOut, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};