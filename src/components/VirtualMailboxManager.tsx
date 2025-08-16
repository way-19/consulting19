import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import StripeCheckout from './StripeCheckout';
import { 
  Package, 
  Download, 
  Eye, 
  Truck, 
  MapPin, 
  DollarSign, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  CreditCard,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  Save
} from 'lucide-react';

interface VirtualMailboxItem {
  id: string;
  client_id: string;
  consultant_id: string;
  document_type: string;
  document_name: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  status: 'pending' | 'sent' | 'delivered' | 'viewed' | 'downloaded';
  tracking_number?: string;
  shipping_fee: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  created_at: string;
  updated_at: string;
  shipping_option?: string;
  shipping_address?: any;
}

interface ShippingAddress {
  full_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

interface VirtualMailboxManagerProps {
  clientId?: string;
  viewMode: 'client' | 'consultant';
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({ 
  clientId, 
  viewMode 
}) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<VirtualMailboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showShippingAddressModal, setShowShippingAddressModal] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [currentShippingItem, setCurrentShippingItem] = useState<VirtualMailboxItem | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    company_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (clientId || profile?.id) {
      fetchItems();
    }
  }, [clientId, profile]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('virtual_mailbox_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (viewMode === 'client') {
        const targetClientId = clientId || await getClientIdFromProfile();
        if (targetClientId) {
          query = query.eq('client_id', targetClientId);
        }
      } else if (viewMode === 'consultant') {
        query = query.eq('consultant_id', profile?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching virtual mailbox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClientIdFromProfile = async () => {
    if (!profile?.id) return null;
    
    const { data } = await supabase
      .from('clients')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    
    return data?.id || null;
  };

  const handleRequestPhysicalShipping = (item: VirtualMailboxItem) => {
    setCurrentShippingItem(item);
    setShippingAddress(prev => ({
      ...prev,
      full_name: profile?.full_name || '',
      email: profile?.email || ''
    }));
    setShowShippingAddressModal(true);
  };

  const handleShippingAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['full_name', 'address_line_1', 'city', 'state_province', 'postal_code', 'country', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field as keyof ShippingAddress]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    console.log('📋 Address form submitted, opening payment modal');
    // Close address modal and open payment modal
    setShowShippingAddressModal(false);
    setShowStripeCheckout(true);
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      console.log('💳 Payment successful:', paymentIntentId);
      if (!currentShippingItem) return;

      // Update item with shipping address and payment info
      const { error } = await supabase
        .from('virtual_mailbox_items')
        .update({
          shipping_option: 'physical',
          shipping_address: shippingAddress,
          payment_status: 'paid',
          shipping_fee: currentShippingItem.shipping_fee
        })
        .eq('id', currentShippingItem.id);

      if (error) throw error;

      // Notify consultant about shipping request
      await supabase
        .from('notifications')
        .insert([{
          user_id: currentShippingItem.consultant_id,
          type: 'physical_shipping_requested',
          title: 'Physical Shipping Requested',
          message: `Client has requested physical shipping for ${currentShippingItem.document_name}`,
          priority: 'normal',
          related_table: 'virtual_mailbox_items',
          related_id: currentShippingItem.id,
          action_url: '/consultant/documents'
        }]);

      setShowStripeCheckout(false);
      setCurrentShippingItem(null);
      setShippingAddress({
        full_name: '',
        company_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
        phone: '',
        email: ''
      });
      
      await fetchItems();
      alert('Physical shipping request submitted successfully! Your consultant will process the shipment.');
    } catch (error) {
      console.error('Error processing shipping request:', error);
      alert('Failed to process shipping request. Please try again.');
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    alert('Payment failed: ' + error);
  };

  const handleDownload = async (item: VirtualMailboxItem) => {
    if (!item.file_url) return;

    try {
      // Update viewed/downloaded status
      const updates: any = {};
      if (!item.viewed_date) {
        updates.viewed_date = new Date().toISOString();
      }
      if (!item.downloaded_date) {
        updates.downloaded_date = new Date().toISOString();
      }
      if (item.status === 'sent' || item.status === 'delivered') {
        updates.status = 'downloaded';
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('virtual_mailbox_items')
          .update(updates)
          .eq('id', item.id);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.document_name;
      link.click();

      await fetchItems();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const handlePreview = async (item: VirtualMailboxItem) => {
    if (!item.file_url) return;

    try {
      // Update viewed status
      if (!item.viewed_date) {
        await supabase
          .from('virtual_mailbox_items')
          .update({
            viewed_date: new Date().toISOString(),
            status: item.status === 'sent' ? 'viewed' : item.status
          })
          .eq('id', item.id);
      }

      // Open in new tab
      window.open(item.file_url, '_blank');
      await fetchItems();
    } catch (error) {
      console.error('Error previewing document:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'downloaded': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'waived': return 'bg-blue-100 text-blue-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      case 'viewed': return <Eye className="h-4 w-4" />;
      case 'downloaded': return <Download className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Virtual Mailbox</h3>
          <p className="text-gray-600">Receive official documents digitally and request physical shipping when needed</p>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-purple-600" />
          <span className="text-sm text-gray-600">{items.length} items</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
          <p className="text-gray-600">
            {viewMode === 'client' 
              ? 'Your consultant will send documents to your virtual mailbox as they become available.'
              : 'No documents have been sent to clients yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.document_name}</h4>
                      <p className="text-sm text-gray-600">{item.document_type}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(item.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-gray-700 mb-3">{item.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Tracking:</span> {item.tracking_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Shipping Fee:</span> ${item.shipping_fee}
                    </div>
                    <div>
                      <span className="font-medium">Payment:</span>
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.payment_status)}`}>
                        {item.payment_status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span> {item.file_size ? formatFileSize(item.file_size) : 'N/A'}
                    </div>
                  </div>

                  {item.sent_date && (
                    <div className="text-xs text-gray-500">
                      Sent: {new Date(item.sent_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {item.file_url && (
                    <>
                      <button
                        onClick={() => handlePreview(item)}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      
                      <button
                        onClick={() => handleDownload(item)}
                        className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </>
                  )}

                  {viewMode === 'client' && item.status === 'sent' && item.payment_status === 'unpaid' && (
                    <button
                      onClick={() => handleRequestPhysicalShipping(item)}
                      className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 transition-colors flex items-center space-x-2"
                    >
                      <Truck className="h-4 w-4" />
                      <span>Physical Shipping</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowItemDetail(true);
                    }}
                    className="bg-gray-50 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shipping Address Modal */}
      {showShippingAddressModal && currentShippingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                <button
                  onClick={() => {
                    setShowShippingAddressModal(false);
                    setCurrentShippingItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Please provide your shipping address for: <strong>{currentShippingItem.document_name}</strong>
              </p>
            </div>

            <form onSubmit={handleShippingAddressSubmit} className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={shippingAddress.full_name}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={shippingAddress.company_name}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, company_name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Your Company LLC"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={shippingAddress.address_line_1}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={shippingAddress.address_line_2}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state_province}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state_province: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="TR">Turkey</option>
                    <option value="GE">Georgia</option>
                    <option value="EE">Estonia</option>
                    <option value="AE">UAE</option>
                    <option value="MT">Malta</option>
                  </select>
                </div>
              </div>

              {/* Shipping Cost Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Shipping Cost</h4>
                </div>
                <div className="text-sm text-blue-800">
                  <p>Document: <strong>{currentShippingItem.document_name}</strong></p>
                  <p>Shipping Fee: <strong>${currentShippingItem.shipping_fee}</strong></p>
                  <p>Estimated Delivery: <strong>5-10 business days</strong></p>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowShippingAddressModal(false);
                    setCurrentShippingItem(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Continue to Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stripe Checkout Modal */}
      {showStripeCheckout && currentShippingItem && (
        <StripeCheckout
          isOpen={showStripeCheckout}
          onClose={() => {
            setShowStripeCheckout(false);
            setCurrentShippingItem(null);
          }}
          amount={currentShippingItem.shipping_fee}
          currency="USD"
          orderId={currentShippingItem.id}
          orderDetails={{
            serviceName: `Physical Shipping - ${currentShippingItem.document_name}`,
            consultantName: 'Consulting19 Shipping',
            deliveryTime: 7
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {/* Item Detail Modal */}
      {showItemDetail && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Document Details</h2>
                <button
                  onClick={() => setShowItemDetail(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">{selectedItem.document_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Type:</span>
                      <p className="font-medium">{selectedItem.document_type}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedItem.payment_status)}`}>
                        {selectedItem.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Tracking Number:</span>
                      <p className="font-medium font-mono">{selectedItem.tracking_number || 'Not assigned'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Shipping Fee:</span>
                      <p className="font-medium">${selectedItem.shipping_fee}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">File Size:</span>
                      <p className="font-medium">{selectedItem.file_size ? formatFileSize(selectedItem.file_size) : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{selectedItem.description}</p>
                </div>
              )}

              {/* Shipping Address */}
              {selectedItem.shipping_address && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{selectedItem.shipping_address.full_name}</p>
                      {selectedItem.shipping_address.company_name && (
                        <p>{selectedItem.shipping_address.company_name}</p>
                      )}
                      <p>{selectedItem.shipping_address.address_line_1}</p>
                      {selectedItem.shipping_address.address_line_2 && (
                        <p>{selectedItem.shipping_address.address_line_2}</p>
                      )}
                      <p>
                        {selectedItem.shipping_address.city}, {selectedItem.shipping_address.state_province} {selectedItem.shipping_address.postal_code}
                      </p>
                      <p>{selectedItem.shipping_address.country}</p>
                      <p className="text-gray-600 mt-2">
                        Phone: {selectedItem.shipping_address.phone}
                      </p>
                      <p className="text-gray-600">
                        Email: {selectedItem.shipping_address.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Document Created</p>
                      <p className="text-sm text-blue-700">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {selectedItem.sent_date && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Truck className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Document Sent</p>
                        <p className="text-sm text-green-700">{new Date(selectedItem.sent_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.viewed_date && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Document Viewed</p>
                        <p className="text-sm text-purple-700">{new Date(selectedItem.viewed_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedItem.downloaded_date && (
                    <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <Download className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-medium text-indigo-900">Document Downloaded</p>
                        <p className="text-sm text-indigo-700">{new Date(selectedItem.downloaded_date).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                {selectedItem.file_url && (
                  <>
                    <button
                      onClick={() => handlePreview(selectedItem)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Preview</span>
                    </button>
                    
                    <button
                      onClick={() => handleDownload(selectedItem)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </button>
                  </>
                )}

                {viewMode === 'client' && selectedItem.status === 'sent' && selectedItem.payment_status === 'unpaid' && (
                  <button
                    onClick={() => {
                      setShowItemDetail(false);
                      handleRequestPhysicalShipping(selectedItem);
                    }}
                    className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    <Truck className="h-5 w-5" />
                    <span>Request Physical Shipping</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMailboxManager;