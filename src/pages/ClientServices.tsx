import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import RequestCustomServiceModal from '../components/client/RequestCustomServiceModal';
import { 
  ArrowLeft, 
  Plus,
  Star,
  FileText,
  Building,
  ArrowRight,
  Zap,
  MessageSquare
} from 'lucide-react';

interface ConsultantService {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  delivery_time_days: number;
  features: string[];
  category: string;
}

const ClientServices = () => {
  const { profile } = useAuth();
  const [consultantServices, setConsultantServices] = useState<ConsultantService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [consultantInfo, setConsultantInfo] = useState<any>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchConsultantServices();
    }
  }, [profile]);

  const fetchConsultantServices = async () => {
    try {
      setLoading(true);
      
      // Get client record to find assigned consultant
      const { data, error } = await supabase
        .from('clients')
        .select('assigned_consultant_id')
        .eq('profile_id', profile?.id)
        .single();

      if (error) {
        console.error('Error fetching client data:', error);
        return;
      }

      if (!data?.assigned_consultant_id) {
        setLoading(false);
        return;
      }

      // Get consultant info
      const { data: consultantData } = await supabase
        .from('profiles')
        .select('id, full_name, email, country')
        .eq('id', data.assigned_consultant_id)
        .single();

      setConsultantInfo(consultantData);

      // Get consultant's custom services
      const { data: servicesData } = await supabase
        .from('custom_services')
        .select('*')
        .eq('consultant_id', data.assigned_consultant_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setConsultantServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching consultant services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link 
              to="/client-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Additional Services</h1>
              <p className="text-gray-600 mt-1">Request custom services from your consultant</p>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Özel Hizmet Talep Et</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Consultant Info */}
        {consultantInfo && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {consultantInfo.full_name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danışmanınız: {consultantInfo.full_name}</h2>
                <p className="text-gray-600">{consultantInfo.email}</p>
                <p className="text-sm text-gray-500">{consultantInfo.country} Uzmanı</p>
              </div>
              <div className="ml-auto">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Mesaj Gönder</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Service Request */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200 mb-8">
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Custom Service</h2>
            <p className="text-lg text-gray-600 mb-6">
              Request the custom service you need from your consultant. 
              A personalized proposal will be prepared for you.
            </p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Request Service</span>
            </button>
          </div>
        </div>

        {/* Consultant's Custom Services */}
        {consultantServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Custom Services from Your Consultant</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {consultantServices.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{service.title}</h3>
                        <p className="text-white/80 text-sm">{service.category.replace('_', ' ').toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                          ${service.price.toLocaleString()}
                          <span className="text-sm font-normal text-gray-500 ml-1">{service.currency}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {service.delivery_time_days} days
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2">
                      <span>Order Service</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Services */}
        <div>
         <h2 className="text-2xl font-bold text-gray-900 mb-6">General Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder for general services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">General Services</h3>
             <p className="text-gray-600 mb-4">View platform-wide services</p>
              <Link
                to="/services"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
               View All Services
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Request Custom Service Modal */}
      <RequestCustomServiceModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={() => {
          alert('Your service request has been sent successfully!');
        }}
      />
    </div>
  );
};

export default ClientServices;