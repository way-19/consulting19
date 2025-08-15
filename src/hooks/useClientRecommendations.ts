import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ClientRecommendation {
  id: string;
  client_id: string;
  recommendation_type: string;
  title: string;
  description?: string;
  action_url?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  is_active: boolean;
  expires_at?: string;
  metadata: any;
  generated_by: string;
  generated_at: string;
}

export const useClientRecommendations = (clientId?: string) => {
  const [recommendations, setRecommendations] = useState<ClientRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      fetchRecommendations();
    }
  }, [clientId]);

  const fetchRecommendations = async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('client_recommendations')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('client_recommendations')
        .update({ is_read: true })
        .eq('id', recommendationId);

      if (error) throw error;
      
      setRecommendations(prev => 
        prev.map(rec => rec.id === recommendationId ? { ...rec, is_read: true } : rec)
      );
    } catch (err) {
      console.error('Error marking recommendation as read:', err);
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('client_recommendations')
        .update({ is_active: false })
        .eq('id', recommendationId);

      if (error) throw error;
      await fetchRecommendations();
    } catch (err) {
      console.error('Error dismissing recommendation:', err);
    }
  };

  return {
    recommendations,
    loading,
    error,
    markAsRead,
    dismissRecommendation,
    refreshRecommendations: fetchRecommendations
  };
};