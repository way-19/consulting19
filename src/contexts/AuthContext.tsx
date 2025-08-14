import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Role = "admin" | "consultant" | "client";

export interface Profile {
  id: string;
  email: string;
  role: Role;
  full_name?: string;
  country?: string;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    try {
      console.log("🔍 Fetching profile for user:", uid);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", uid)
        .maybeSingle(); // 0 satırda hata atmaz

      if (error) {
        console.warn("⚠️ Profile fetch error:", error);
        return null;
      }
      if (!data) {
        console.warn("ℹ️ Profile not found for user:", uid);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error("❌ fetchProfile exception:", e);
      return null;
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    (async () => {
      console.log("🚀 Initializing auth...");
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) setProfile(await fetchProfile(session.user.id));
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state changed:", event);
      setUser(session?.user ?? null);
      setProfile(null);
      if (session?.user) setProfile(await fetchProfile(session.user.id));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error);
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};