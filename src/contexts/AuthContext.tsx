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

  const fetchProfile = async (userEmail: string, userId: string) => {
    console.log('🔍 Fetching profile for:', userEmail, 'ID:', userId);
    
    try {
      // Use mock profile data for now to avoid database issues
      console.log('📝 Using mock profile data for user:', userEmail);
      
      // Determine role based on email
      let role: 'admin' | 'consultant' | 'client' = 'client';
      let fullName = null;
      
      if (userEmail === 'admin@consulting19.com') {
        role = 'admin';
        fullName = 'Platform Administrator';
      } else if (userEmail === 'georgia@consulting19.com') {
        role = 'consultant';
        fullName = 'Georgia Consultant';
      } else if (userEmail === 'client.georgia@consulting19.com') {
        role = 'client';
        fullName = 'Test Client';
      } else if (userEmail === 'support@consulting19.com') {
        role = 'admin';
        fullName = 'Customer Support';
      }
      
      const mockProfile = {
        id: userId,
        auth_user_id: userId,
        email: userEmail,
        role: role,
        full_name: fullName,
        country: role === 'consultant' ? 'Georgia' : null
      };
      
      console.log('✅ Mock profile created:', mockProfile.email, mockProfile.role);
      return mockProfile;
      
    } catch (error) {
      console.error('💥 fetchProfile crashed:', error);
      if (error instanceof Error) {
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
      }
      return null;
    }
  };

  const navigateBasedOnRole = (userProfile: Profile) => {
    console.log('🧭 Navigating based on role:', userProfile.role);
    
    // Don't navigate if already on the correct page
    const currentPath = window.location.pathname;
    let targetPath = '';
    
    switch (userProfile.role) {
      case 'admin':
        targetPath = '/admin-dashboard';
        break;
      case 'consultant':
        targetPath = '/consultant-dashboard';
        break;
      case 'client':
        targetPath = '/client-accounting';
        break;
      default:
        targetPath = '/';
    }
    
    // For consultants, allow all consultant-related pages
    const consultantPages = [
      '/consultant-dashboard',
      '/consultant-services', 
      '/legacy-orders',
      '/accounting-management',
      '/customers-management',
      '/consultant-payments',
      '/site-management',
      '/payments'
    ];
    
    // For clients, allow all client-related pages  
    const clientPages = [
      '/client-accounting',
      '/client-services'
    ];
    
    // For admins, allow all admin-related pages
    const adminPages = [
      '/admin-dashboard'
    ];
    
    let allowedPages: string[] = [];
    if (userProfile.role === 'consultant') allowedPages = consultantPages;
    else if (userProfile.role === 'client') allowedPages = clientPages;
    else if (userProfile.role === 'admin') allowedPages = adminPages;
    
    // Only navigate if not already on an allowed page
    const isOnAllowedPage = allowedPages.some(page => 
      currentPath === page || 
      currentPath.startsWith(page) ||
      (page === '/consultant-payments' && currentPath === '/payments')
    );
    
    if (!isOnAllowedPage) {
      console.log(`➡️ Navigating from ${currentPath} to ${targetPath}`);
      navigate(targetPath);
    } else {
      console.log(`✅ Already on correct path: ${currentPath}`);
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing auth...');
    
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('👤 Session found:', session.user.email);
          setUser(session.user);
          
          const userProfile = await fetchProfile(session.user.email!, session.user.id);
          if (userProfile) {
            console.log('✅ Profile loaded successfully, navigating...');
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile');
          }
        } else {
          console.log('👤 No session found');
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
          
          const userProfile = await fetchProfile(session.user.email!, session.user.id);
          if (userProfile) {
            console.log('✅ Profile loaded after sign in, navigating...');
            setProfile(userProfile);
            navigateBasedOnRole(userProfile);
          } else {
            console.error('❌ Could not load profile after sign in');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });
      
      if (error) {
        console.error('❌ Sign in error:', error.message);
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
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{
      loading,
      user,
      profile,
      signIn,
      signOut
    }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthCtx);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};