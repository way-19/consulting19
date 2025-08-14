import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CustomService {
  id: string;
  consultant_id: string;
  country_id?: string;
  title: string;
  description?: string;
  features: string[];
  price: number;
  currency: string;
  delivery_time_days: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  consultant?: {
    id: string;
    full_name: string;
    email: string;
  };
  country?: {
    name: string;
    flag_emoji: string;
  };
}

export const useServices = (activeOnly: boolean = true, countryId?: string) => {
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [activeOnly, countryId]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('custom_services')
        .select(`
          *,
          consultant:consultant_id (
            id,
            full_name,
            email
          ),
          country:country_id (
            name,
            flag_emoji
          )
        `)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      if (countryId) {
        query = query.eq('country_id', countryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const refreshServices = () => {
    fetchServices();
  };

  return {
    services,
    loading,
    error,
    refreshServices
  };
};

export const useService = (serviceId: string) => {
  const [service, setService] = useState<CustomService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('custom_services')
        .select(`
          *,
          consultant:consultant_id (
            id,
            full_name,
            email
          ),
          country:country_id (
            name,
            flag_emoji
          )
        `)
        .eq('id', serviceId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setService(data);
    } catch (err) {
      console.error('Error fetching service:', err);
      setError(err instanceof Error ? err.message : 'Service not found');
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    service,
    loading,
    error,
    refreshService: fetchService
  };
};

// Service categories helper
export const useServiceCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select('category')
        .eq('is_active', true);

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(data?.map(s => s.category) || []));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
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