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
        throw new Error('Supabase configuration missing. Please check your .env file.');
      }

      let query = supabase
        .from('countries')
        .select('*')
        .order('sort_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      // Temporarily remove is_active filter until database migration is run
      // if (activeOnly) {
      //   query = query.eq('is_active', true);
      // }

      const { data, error } = await query;

      if (error) throw error;
      setCountries(data || []);
    } catch (err) {
      console.error('Error fetching countries:', err);
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to database. Please check your internet connection and Supabase configuration.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch countries');
      }
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

      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        // Temporarily remove is_active filter until database migration is run
        // .eq('is_active', true)
        .single();

      if (error) throw error;
      setCountry(data);
    } catch (err) {
      console.error('Error fetching country:', err);
      setError(err instanceof Error ? err.message : 'Country not found');
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