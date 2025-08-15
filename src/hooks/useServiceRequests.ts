import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ServiceRequest {
  id: string;
  client_id: string;
  consultant_id?: string;
  title: string;
  description?: string;
  requested_service_type: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget_range?: string;
  preferred_timeline?: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  client?: {
    company_name: string;
    profile?: {
      full_name: string;
      email: string;
    };
  };
  consultant?: {
    full_name: string;
    email: string;
  };
}

export const useServiceRequests = (clientId?: string, consultantId?: string) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [clientId, consultantId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('service_requests')
        .select(`
          *,
          client:client_id (
            company_name,
            profile:profile_id (
              full_name,
              email
            )
          ),
          consultant:consultant_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      if (consultantId) {
        query = query.eq('consultant_id', consultantId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching service requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: Partial<ServiceRequest>) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert([requestData]);

      if (error) throw error;
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error creating service request:', err);
      throw err;
    }
  };

  const updateRequest = async (requestId: string, updates: Partial<ServiceRequest>) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .update(updates)
        .eq('id', requestId);

      if (error) throw error;
      await fetchRequests();
      return true;
    } catch (err) {
      console.error('Error updating service request:', err);
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    createRequest,
    updateRequest,
    refreshRequests: fetchRequests
  };
};