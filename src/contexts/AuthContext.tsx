import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

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
      console.log('🔍 Fetching profile for user:', authUser.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error.message);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('🔧 Profile not found, attempting to create...');
          await createMissingProfile(authUser);
          return;
        }
        
        setProfile(null);
        return;
      }

      console.log('✅ Profile found:', data.email, data.legacy_role);
      setProfile(data as Profile);
    } catch (error) {
      console.error('💥 Profile fetch failed:', error);
      setProfile(null);
    }
  };

  const createMissingProfile = async (authUser: User) => {
    try {
      console.log('🔧 Creating missing profile for:', authUser.email);
      
      // Get default client role
      const { data: clientRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'client')
        .single();

      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert([{
          auth_user_id: authUser.id,
          email: authUser.email!,
          role_id: clientRole?.id,
          legacy_role: 'client',
          full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating profile:', error);
        return;
      }

      console.log('✅ Profile created successfully:', newProfile.email);
      setProfile(newProfile as Profile);
    } catch (error) {
      console.error('💥 Profile creation failed:', error);
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
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          console.log('✅ Session found for user:', session.user.id);
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
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