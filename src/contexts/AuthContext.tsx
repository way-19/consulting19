import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as SbUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Role = "admin" | "consultant" | "client";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  country?: string;
  auth_user_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: SbUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SbUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Güvenlik ağı: 8 sn içinde illa ki loading kapanır
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error("[AUTH] getSession error:", e);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Not: kolonu gerçekten "auth_user_id" mi? değilse .eq("id", userId) yapın.
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", userId)
        .single();

      if (error) {
        console.warn("[AUTH] fetchProfile error:", error);
        setProfile(null);
        return;
      }
      setProfile(data as Profile);
    } catch (e) {
      console.error("[AUTH] fetchProfile exception:", e);
      setProfile(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false); // onAuthStateChange gelmezse
      throw error;
    }
    // başarılıysa onAuthStateChange loading'i kapatır
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
