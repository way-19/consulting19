import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  language_code: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  country_id?: string;
}

export const useFAQs = (filters?: { isActive?: boolean; languageCode?: string; countryId?: string; category?: string }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, [filters]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration missing. Please check your .env file.');
      }

      let query = supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.languageCode) {
        query = query.eq('language_code', filters.languageCode);
      }
      if (filters?.countryId) {
        query = query.eq('country_id', filters.countryId);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to database. Please check your internet connection and Supabase configuration.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshFAQs = () => {
    fetchFAQs();
  };

  return {
    faqs,
    loading,
    error,
    refreshFAQs
  };
};

export const useFAQ = (id: string) => {
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFAQ();
    }
  }, [id]);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setFaq(data);
    } catch (err) {
      console.error('Error fetching FAQ:', err);
      setError(err instanceof Error ? err.message : 'FAQ not found');
      setFaq(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    faq,
    loading,
    error,
    refreshFAQ: fetchFAQ
  };
};

// FAQ categories helper
export const useFAQCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(data?.map(f => f.category).filter(Boolean) || []));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching FAQ categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    refreshCategories: fetchCategories
  };
};