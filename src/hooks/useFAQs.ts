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
        console.warn('Supabase configuration missing. Using fallback data.');
        setFaqs([]);
        setLoading(false);
        return;
      }

      console.log('🔍 useFAQs: Fetching FAQs with filters:', filters);

      let query = supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
        console.log('📋 useFAQs: Filtering by is_active:', filters.isActive);
      }
      if (filters?.languageCode) {
        query = query.eq('language_code', filters.languageCode);
        console.log('🌐 useFAQs: Filtering by language:', filters.languageCode);
      }
      if (filters?.countryId) {
        query = query.eq('country_id', filters.countryId);
        console.log('🏳️ useFAQs: Filtering by country_id:', filters.countryId);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
        console.log('📂 useFAQs: Filtering by category:', filters.category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ useFAQs: Database error:', error);
        throw error;
      }
      
      console.log('✅ useFAQs: Successfully fetched', data?.length || 0, 'FAQs');
      console.log('📊 useFAQs: FAQ data sample:', data?.slice(0, 2));
      
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      // Gracefully handle connection errors
      console.warn('FAQs unavailable, using fallback');
      setFaqs([]);
      setError(err instanceof Error ? err.message : 'Failed to load FAQs');
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