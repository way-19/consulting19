```typescript
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
  country_id?: string; // Added country_id
}

export const useFAQs = (filters?: { isActive?: boolean; languageCode?: string; countryId?: string }) => {
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

      const { data, error } = await query;

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  return {
    faqs,
    loading,
    error,
    refreshFAQs: fetchFAQs
  };
};
```