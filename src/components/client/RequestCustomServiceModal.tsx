import React, { useState } from 'react';
import { X, Send, FileText, Globe, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface RequestCustomServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RequestCustomServiceModal: React.FC<RequestCustomServiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requested_service_type: 'custom',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    budget_range: '',
    preferred_timeline: '',
    notes: ''
  });

  const serviceTypes = [
    { value: 'custom', label: 'Custom Service', description: 'Tailored service for your specific needs' },
    { value: 'certificate', label: 'Certificate Service', description: 'Document certification, apostille, translation' },
    { value: 'other_country', label: 'Other Country Service', description: 'Business formation or services in different countries' },
    { value: 'legal_consultation', label: 'Legal Consultation', description: 'Specialized legal advice and consultation' },
    { value: 'tax_advisory', label: 'Tax Advisory', description: 'Tax optimization and planning services' },
    { value: 'compliance', label: 'Compliance Services', description: 'Legal compliance and reporting services' }
  ];

  const budgetRanges = [
    { value: 'under_500', label: '$500\'den az' },
    { value: '500_1000', label: '$500 - $1,000' },
    { value: '1000_2500', label: '$1,000 - $2,500' },
    { value: '2500_5000', label: '$2,500 - $5,000' },
    { value: 'over_5000', label: '$5,000\'den fazla' },
    { value: 'flexible', label: 'Esnek bütçe' }
  ];

  const timelines = [
    { value: 'urgent', label: '1-3 gün (Acil)' },
    { value: 'fast', label: '1 hafta' },
    { value: 'normal', label: '2-4 hafta' },
    { value: 'flexible', label: 'Esnek zaman' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      // Get client ID
      const { data: clientData } = await supabase
        .from('clients')
        .select('id, assigned_consultant_id')
        .eq('profile_id', profile?.id)
        .single();

      if (!clientData) {
        throw new Error('Client profile not found');
      }

      const requestData = {
        ...formData,
        client_id: clientData.id,
        consultant_id: clientData.assigned_consultant_id
      };

      const { error } = await supabase
        .from('service_requests')
        .insert([requestData]);

      if (error) throw error;
      
      onSuccess();
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Error submitting service request:', error);
      alert('Hizmet talebi gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      requested_service_type: 'custom',
      priority: 'medium',
      budget_range: '',
      preferred_timeline: '',
      notes: ''
    });
  };

  const selectedServiceType = serviceTypes.find(type => type.value === formData.requested_service_type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Request Custom Service</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Describe the custom service you need in detail. Your consultant will prepare a personalized proposal for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Service Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, requested_service_type: type.value }))}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    formData.requested_service_type === type.value
                      ? 'border-purple-500 bg-purple-50 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900 mb-1">{type.label}</h4>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Company formation consulting in Germany"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe the service you need in detail..."
            />
          </div>

          {/* Budget and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.budget_range}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget_range: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select budget...</option>
                  {budgetRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Timeline
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={formData.preferred_timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_timeline: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select timeline...</option>
                  {timelines.map(timeline => (
                    <option key={timeline.value} value={timeline.value}>{timeline.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
                { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
                { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
                { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                    formData.priority === priority.value
                      ? 'border-purple-500 bg-purple-50 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Any additional information, special requests or questions..."
            />
          </div>

          {/* Service Type Info */}
          {selectedServiceType && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Selected Service Type</h4>
              </div>
              <p className="text-sm text-blue-800">{selectedServiceType.description}</p>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Important Information</h4>
            </div>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Your request will be reviewed by your consultant</p>
              <p>• You will receive a response within 24-48 hours</p>
              <p>• Separate pricing may apply for custom services</p>
              <p>• Service will begin after proposal approval</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.title || !formData.description}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCustomServiceModal;