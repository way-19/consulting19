import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ConsultantLayout from '../../components/consultant/ConsultantLayout';
import { countries } from '../../data/countries';
import { 
  Globe, 
  Eye, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';

interface CountryAssignment {
  id: string;
  consultant_id: string;
  country_id: string;
  is_primary: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  country?: {
    id: string;
    name: string;
    slug: string;
    flag_emoji: string;
    description: string;
  };
}

interface ContentUpdateRequest {
  id: string;
  section: string;
  current_content: string;
  suggested_content: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const CountrySitePage = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<CountryAssignment[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [updateRequests, setUpdateRequests] = useState<ContentUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    section: '',
    current_content: '',
    suggested_content: '',
    reason: ''
  });

  useEffect(() => {
    if (profile?.id) {
      fetchAssignments();
      fetchUpdateRequests();
    }
  }, [profile]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('consultant_country_assignments')
        .select(`
          *,
          country:country_id (
            id,
            name,
            slug,
            flag_emoji,
            description
          )
        `)
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (error) throw error;
      setAssignments(data || []);
      
      // Set first assigned country as selected
      if (data && data.length > 0) {
        setSelectedCountry(data[0].country);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdateRequests = async () => {
    try {
      // Mock data for now - in real implementation this would be from a content_update_requests table
      const mockRequests: ContentUpdateRequest[] = [
        {
          id: '1',
          section: 'Country Description',
          current_content: 'Strategic gateway between Europe and Asia...',
          suggested_content: 'Updated strategic gateway description with new investment opportunities...',
          reason: 'New investment incentives announced by government',
          status: 'pending',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setUpdateRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching update requests:', error);
    }
  };

  const handleSubmitUpdate = async () => {
    if (!updateForm.section || !updateForm.suggested_content || !updateForm.reason) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // In real implementation, this would save to content_update_requests table
      const newRequest: ContentUpdateRequest = {
        id: Date.now().toString(),
        section: updateForm.section,
        current_content: updateForm.current_content,
        suggested_content: updateForm.suggested_content,
        reason: updateForm.reason,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      setUpdateRequests(prev => [newRequest, ...prev]);
      setShowUpdateModal(false);
      setUpdateForm({ section: '', current_content: '', suggested_content: '', reason: '' });
      
      alert('Content update request submitted successfully!');
    } catch (error) {
      console.error('Error submitting update request:', error);
      alert('Failed to submit update request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ConsultantLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ConsultantLayout>
    );
  }

  return (
    <ConsultantLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Country Site Management</h2>
            <p className="text-gray-600">Monitor and suggest updates for your assigned country pages</p>
          </div>
          <button
            onClick={() => setShowUpdateModal(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Edit className="h-5 w-5" />
            <span>Suggest Update</span>
          </button>
        </div>

        {/* Country Selection */}
        {assignments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Assigned Countries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => setSelectedCountry(assignment.country)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedCountry?.id === assignment.country?.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{assignment.country?.flag_emoji}</span>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900">{assignment.country?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {assignment.is_primary ? 'Primary' : 'Secondary'} Assignment
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Country Preview */}
        {selectedCountry && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedCountry.flag_emoji}</span>
                <h3 className="text-lg font-semibold text-gray-900">{selectedCountry.name} Page Preview</h3>
              </div>
              <a
                href={`/countries/${selectedCountry.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Live Page</span>
              </a>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Country Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Country Description</h4>
                    <button
                      onClick={() => {
                        setUpdateForm({
                          section: 'Country Description',
                          current_content: selectedCountry.description,
                          suggested_content: '',
                          reason: ''
                        });
                        setShowUpdateModal(true);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Suggest Update
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm">{selectedCountry.description}</p>
                </div>

                {/* Services Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Available Services</h4>
                    <button
                      onClick={() => {
                        setUpdateForm({
                          section: 'Services',
                          current_content: 'Current services list...',
                          suggested_content: '',
                          reason: ''
                        });
                        setShowUpdateModal(true);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Suggest Update
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      'Company Registration',
                      'Bank Account Opening',
                      'Visa & Residence',
                      'Tax Residency',
                      'Accounting Services',
                      'Legal Consulting'
                    ].map((service, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Content Update Requests</h3>
          </div>
          <div className="p-6">
            {updateRequests.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No update requests submitted yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {updateRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.section}</h4>
                        <p className="text-sm text-gray-600">
                          Submitted: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Reason:</span>
                        <p className="text-gray-600">{request.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Suggested Content:</span>
                        <p className="text-gray-600">{request.suggested_content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Update Request Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Suggest Content Update</h2>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section to Update *
                  </label>
                  <select
                    value={updateForm.section}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select section</option>
                    <option value="Country Description">Country Description</option>
                    <option value="Services">Services</option>
                    <option value="Highlights">Key Highlights</option>
                    <option value="FAQ">FAQ Section</option>
                    <option value="Insights">Country Insights</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Content
                  </label>
                  <textarea
                    rows={3}
                    value={updateForm.current_content}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, current_content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Copy the current content that needs updating..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Content *
                  </label>
                  <textarea
                    rows={5}
                    value={updateForm.suggested_content}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, suggested_content: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your suggested content update..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Update *
                  </label>
                  <textarea
                    rows={3}
                    value={updateForm.reason}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Explain why this update is needed (e.g., new regulations, outdated information, etc.)"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                    <p className="text-blue-800 font-medium">Review Process</p>
                  </div>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• Your request will be reviewed by the content team</li>
                    <li>• You'll receive a response within 48 hours</li>
                    <li>• Approved changes will be implemented within 1 week</li>
                    <li>• You'll be notified when changes go live</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitUpdate}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConsultantLayout>
  );
};

export default CountrySitePage;