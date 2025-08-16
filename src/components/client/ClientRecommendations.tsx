import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useClientRecommendations } from '../../hooks/useClientRecommendations';
import { 
  Lightbulb, 
  Star, 
  Clock, 
  Eye, 
  X, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Award,
  Building,
  FileText,
  DollarSign,
  Calendar,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ClientRecommendation {
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

interface ClientRecommendationsProps {
  clientId?: string;
}

const ClientRecommendations: React.FC<ClientRecommendationsProps> = ({ clientId }) => {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<ClientRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId || profile?.id) {
      fetchRecommendations();
    }
  }, [clientId, profile]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetClientId = clientId;

      if (!targetClientId && profile?.id) {
        // Get client ID from profile
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (!clientData) {
          setRecommendations([]);
          return;
        }
        targetClientId = clientData.id;
      }

      if (!targetClientId) {
        setRecommendations([]);
        return;
      }

      const { data, error } = await supabase
        .from('client_recommendations')
        .select('*')
        .eq('client_id', targetClientId)
        .eq('is_active', true)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      setRecommendations([]);
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

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'service_upgrade': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'document_required': return <FileText className="h-5 w-5 text-orange-600" />;
      case 'tax_optimization': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'compliance_update': return <Shield className="h-5 w-5 text-red-600" />;
      case 'business_opportunity': return <Target className="h-5 w-5 text-purple-600" />;
      case 'deadline_reminder': return <Calendar className="h-5 w-5 text-yellow-600" />;
      default: return <Lightbulb className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffInDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3;
  };

  const unreadCount = recommendations.filter(r => !r.is_read).length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Recommendations</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recommendations for You</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Personalized recommendations tailored to your business needs
          </p>
        </div>
        <div className="p-6 text-center">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600">
            Personalized recommendations will appear here as your business process progresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Recommendations for You</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={fetchRecommendations}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Recommendations tailored to your industry and needs
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                getPriorityColor(recommendation.priority)
              } ${!recommendation.is_read ? 'shadow-sm' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getRecommendationIcon(recommendation.recommendation_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-semibold ${
                        !recommendation.is_read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {recommendation.title}
                      </h4>
                      {!recommendation.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getPriorityBadgeColor(recommendation.priority)
                      }`}>
                        {recommendation.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    {recommendation.description && (
                      <p className={`text-sm mb-2 ${
                        !recommendation.is_read ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {recommendation.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTimeAgo(recommendation.generated_at)}</span>
                      <span>•</span>
                      <span className="capitalize">{recommendation.recommendation_type.replace('_', ' ')}</span>
                      {recommendation.expires_at && (
                        <>
                          <span>•</span>
                          <span className={isExpiringSoon(recommendation.expires_at) ? 'text-red-600 font-medium' : ''}>
                            Expires: {new Date(recommendation.expires_at).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {recommendation.action_url && (
                    <a
                      href={recommendation.action_url}
                      onClick={() => {
                        if (!recommendation.is_read) {
                          markAsRead(recommendation.id);
                        }
                      }}
                      className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg font-medium hover:bg-purple-100 transition-colors text-sm flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View</span>
                    </a>
                  )}
                  <button
                    onClick={() => dismissRecommendation(recommendation.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Dismiss recommendation"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expiry Warning */}
              {recommendation.expires_at && isExpiringSoon(recommendation.expires_at) && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-800 font-medium">
                      This recommendation expires in {Math.ceil((new Date(recommendation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All Link */}
        {recommendations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <button
              onClick={() => {
                // Navigate to full recommendations page
                window.location.href = '/client/recommendations';
              }}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 mx-auto"
            >
              <span>View All Recommendations</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRecommendations;