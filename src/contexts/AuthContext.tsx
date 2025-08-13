import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

type Role = 'admin' | 'consultant' | 'client';

export type Profile = {
  id: string;
  auth_user_id: string;
  email: string;
  role: Role;
  country?: string | null;
  full_name?: string | null;
};

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      console.log('📧 Attempting to fetch profile by email...');
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔍 Session check:', session ? `Found session for ${session.user.email}` : 'No session');
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return null;
      }
      
      if (!session?.user?.email) {
        console.error('❌ No session or email found in session');
        return null;
      }
      
      console.log('📧 User email from session:', session.user.email);
      console.log('🔍 Querying profiles table...');
      
      // Query profile by email
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle();
      
      console.log('🔍 Profile query result:', { profile, error });
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // If no profile found, try to create one
        if (error.code === 'PGRST116' || !profile) {
          console.log('📝 Profile not found, creating new profile...');
          
          const newProfile = {
            id: userId,
            auth_user_id: userId,
            email: session.user.email,
            role: 'client' as const,
            full_name: session.user.user_metadata?.full_name || null,
            country: null
          };
          
          console.log('📝 Creating profile with data:', newProfile);
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .maybeSingle();
          
          console.log('📝 Profile creation result:', { createdProfile, createError });
          
          if (createError) {
            console.error('❌ Error creating profile:', createError.message);
            return null;
          }
          
          console.log('✅ Profile created successfully:', createdProfile);
          return createdProfile;
        }
        
        return null;
      }
      
      if (!profile) {
        console.error('❌ Profile is null but no error returned');
        return null;
      }
      
      console.log('✅ Profile found successfully:', {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        auth_user_id: profile.auth_user_id
      });
      
      return profile;
    } catch (error) {
      console.error('💥 Unexpected error in fetchProfile:', error);
      return null;
    }
  };

  const navigateBasedOnRole = (userProfile: Profile) => {
    console.log('🧭 Navigating based on role:', userProfile.role);
    
    switch (userProfile.role) {
      case 'admin':
        console.log('➡️ Navigating to admin dashboard');
        navigate('/admin-dashboard');
        break;
      case 'consultant':
        console.log('➡️ Navigating to consultant dashboard');
        navigate('/consultant-dashboard');
        break;
      case 'client':
        console.log('➡️ Navigating to client dashboard');
        navigate('/client-accounting');
        break;
      default:
        console.log('➡️ Navigating to home (unknown role)');
        navigate('/');
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth...');
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('👤 Session found:', session.user.email);
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            console.log('✅ Profile loaded successfully, navigating...');
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile after session found. User will stay on current page.');
            console.error('❌ This means the user exists in auth.users but not in profiles table.');
          }
        }
      } catch (error) {
        console.error('💥 Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            console.log('✅ Profile loaded after sign in, navigating...');
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile after sign in. This is a critical issue.');
            console.error('❌ User authenticated but profile missing from database.');
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
          navigate('/');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Signing in:', email);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) {
        console.error('❌ Sign in error:', error.message);
        console.error('❌ Full sign in error:', error);
        setLoading(false);
        throw error;
      }
      
      console.log('✅ Sign in successful');
      // Navigation will happen in auth state change handler
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    navigate('/');
    console.log('✅ Sign out successful');
  };

  return (
    <AuthCtx.Provider value={{ loading, user, profile, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};