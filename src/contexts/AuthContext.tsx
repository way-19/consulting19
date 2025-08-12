import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupaUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/supabase';

type AuthState = {
  loading: boolean;
  user: SupaUser | null;
  profile: Profile | null;
  profileLoaded: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchOrCreateProfile = useCallback(async (authUser: SupaUser) => {
    console.log('🔍 Fetching/creating profile for user:', authUser.id, authUser.email);
    
    try {
      // 1) Check if profile exists
      const { data: existing, error: selErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (selErr) {
        console.error('❌ Error fetching profile:', selErr);
        throw selErr;
      }

      if (existing) {
        console.log('✅ Profile found:', existing.email, existing.role);
        setProfile(existing as Profile);
        setProfileLoaded(true);
        return;
      }

      console.log('⚠️ No profile found, creating new profile...');
      
      // 2) Create profile if doesn't exist (will be created by trigger)
      // The trigger should handle this, but let's wait a moment and try again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: retryProfile, error: retryErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (retryErr) {
        console.error('❌ Error on retry fetch:', retryErr);
        throw retryErr;
      }

      if (retryProfile) {
        console.log('✅ Profile found on retry:', retryProfile.email, retryProfile.role);
        setProfile(retryProfile as Profile);
        setProfileLoaded(true);
        return;
      }

      console.log('❌ Profile still not found after retry');
      setProfile(null);
      setProfileLoaded(true);
    } catch (error) {
      console.error('💥 Error in fetchOrCreateProfile:', error);
      setProfile(null);
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      console.log('🚀 AuthProvider initializing...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Initial session check:', session ? `Session found for ${session.user.email}` : 'No session');

        if (!mounted) return;
        
        const u = session?.user ?? null;
        setUser(u);
        
        if (u) {
          console.log('👤 Loading profile for user:', u.id);
          await fetchOrCreateProfile(u);
        } else {
          setProfile(null);
          setProfileLoaded(true);
        }
        
        if (mounted) {
          console.log('🏁 Auth initialization complete');
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setProfileLoaded(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session ? `Session for ${session.user.email}` : 'No session');
      
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out, clearing state');
        setUser(null);
        setProfile(null);
        setProfileLoaded(true);
        setLoading(false);
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const u = session?.user || null;
        console.log('🔑 Setting user from auth state change:', u?.email);
        setUser(u);
        setProfile(null);
        setProfileLoaded(false);
        
        if (u) {
          console.log('👤 Loading profile after auth state change for:', u.id);
          await fetchOrCreateProfile(u);
        } else {
          setProfile(null);
          setProfileLoaded(true);
        }
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchOrCreateProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('🔐 Attempting sign in for:', email);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error.message);
      setLoading(false);
      throw error;
    } else {
      console.log('✅ Sign in successful');
      // onAuthStateChange will handle the rest
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ loading, user, profile, profileLoaded, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};