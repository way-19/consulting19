import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  primary_language: string;
  supported_languages: string[];
  highlights: string[];
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useCountries = (activeOnly: boolean = true) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
  }, [activeOnly]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase configuration missing. Using fallback data.');
        setCountries([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('countries')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(50); // Ensure we get all countries

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
      // Gracefully handle connection errors
      console.warn('Countries unavailable, using fallback');
      setCountries([]);
      setError(null); // Don't show error to user, just use empty state
    } finally {
      setLoading(false);
    }
  };

  const refreshCountries = () => {
    fetchCountries();
  };

  return {
    countries,
    loading,
    error,
    refreshCountries
  };
};

export const useCountry = (slug: string) => {
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCountry();
    }
  }, [slug]);

  const fetchCountry = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase configuration missing. Using fallback data.');
        setCountry(null);
        setError('Database connection unavailable');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setCountry(data);
    } catch (err) {
      console.error('Error fetching country:', err);
      // Gracefully handle connection errors
      console.warn('Country data unavailable');
      setError('Country not found');
      setCountry(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    country,
    loading,
    error,
    refreshCountry: fetchCountry
  };
};