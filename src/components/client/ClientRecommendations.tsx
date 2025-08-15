import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Lightbulb, 
  ArrowRight, 
  X, 
  Star, 
  Award, 
  FileText, 
  Globe, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useClientRecommendations } from '../../hooks/useClientRecommendations';

interface ClientRecommendationsProps {
  clientId: string;
}

const ClientRecommendations: React.FC<ClientRecommendationsProps> = ({ clientId }) => {
  const { recommendations, loading, markAsRead, dismissRecommendation } = useClientRecommendations(clientId);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'service': return <Star className="h-5 w-5 text-purple-600" />;
      case 'certificate': return <Award className="h-5 w-5 text-green-600" />;
      case 'blog_post': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'country': return <Globe className="h-5 w-5 text-orange-600" />;
      case 'optimization': return <TrendingUp className="h-5 w-5 text-indigo-600" />;
      default: return <Lightbulb className="h-5 w-5 text-yellow-600" />;
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

  const handleRecommendationClick = async (recommendation: any) => {
    if (!recommendation.is_read) {
      await markAsRead(recommendation.id);
    }
    
    if (recommendation.action_url) {
      if (recommendation.action_url.startsWith('http')) {
        window.open(recommendation.action_url, '_blank');
      } else {
        // Internal link
        window.location.href = recommendation.action_url;
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz Öneri Yok</h3>
          <p className="text-gray-600">
            İş süreciniz ilerledikçe size özel öneriler burada görünecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">Sizin İçin Öneriler</h2>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
            {recommendations.filter(r => !r.is_read).length} yeni
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Sektörünüze ve ihtiyaçlarınıza özel öneriler
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {recommendations.slice(0, 5).map((recommendation) => (
            <div
              key={recommendation.id}
              className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                getPriorityColor(recommendation.priority)
              } ${!recommendation.is_read ? 'shadow-sm' : ''}`}
              onClick={() => handleRecommendationClick(recommendation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    {getRecommendationIcon(recommendation.recommendation_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                      {!recommendation.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{recommendation.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(recommendation.generated_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <span className="capitalize">{recommendation.recommendation_type}</span>
                      {recommendation.expires_at && (
                        <div className="flex items-center space-x-1 text-orange-600">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Süresi: {new Date(recommendation.expires_at).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {recommendation.action_url && (
                    <div className="bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                      <ArrowRight className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissRecommendation(recommendation.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length > 5 && (
          <div className="mt-4 text-center">
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              Tüm Önerileri Görüntüle ({recommendations.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRecommendations;