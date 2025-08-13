import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus,
  FileText,
  Send,
  Eye,
  Download,
  Upload,
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  Search,
  Filter,
  X,
  Save,
  Trash2,
  Mail,
  Truck,
  CreditCard,
  AlertCircle,
  MapPin,
} from 'lucide-react';

interface VirtualMailboxItem {
  id: string;
  document_type: string;
  document_name: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  status: 'pending' | 'sent' | 'delivered' | 'viewed' | 'downloaded';
  tracking_number: string;
  shipping_fee: number;
  payment_status: 'unpaid' | 'paid' | 'waived';
  sent_date?: string;
  delivered_date?: string;
  viewed_date?: string;
  downloaded_date?: string;
  created_at: string;
}

interface VirtualMailboxManagerProps {
  viewMode?: 'consultant' | 'client';
}

const VirtualMailboxManager: React.FC<VirtualMailboxManagerProps> = ({ viewMode = 'consultant' }) => {
  const { user, profile } = useAuth();
  const [mailboxItems, setMailboxItems] = useState<VirtualMailboxItem[]>([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedMailboxItem, setSelectedMailboxItem] = useState<VirtualMailboxItem | null>(null);
  const [shippingOption, setShippingOption] = useState<'standard' | 'express'>('standard');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VirtualMailboxItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // New document form state
  const [newDocument, setNewDocument] = useState({
    document_type: '',
    document_name: '',
    description: '',
    file: null as File | null
  });

  useEffect(() => {
    fetchMailboxItems();
  }, []);

  const fetchMailboxItems = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      const mockItems: VirtualMailboxItem[] = [
        {
          id: '1',
          document_type: 'Tax Registration Document',
          document_name: 'dfgdf',
          description: 'Tax registration certificate for your company',
          file_url: 'https://example.com/doc1.pdf',
          file_size: 116600,
          status: 'pending',
          tracking_number: '',
          shipping_fee: 0,
          payment_status: 'unpaid',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          document_type: 'Bank Account Information',
          document_name: 'kjlkl',
          description: 'Bank account setup documents',
          file_url: 'https://example.com/doc2.pdf',
          file_size: 116600,
          status: 'sent',
          tracking_number: 'VM20250813-AA512107',
          shipping_fee: 15,
          payment_status: 'paid',
          sent_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setMailboxItems(mockItems);
    } catch (error) {
      console.error('Error fetching mailbox items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.document_name || !newDocument.document_type) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newItem: VirtualMailboxItem = {
        id: Date.now().toString(),
        document_type: newDocument.document_type,
        document_name: newDocument.document_name,
        description: newDocument.description,
        file_url: newDocument.file ? URL.createObjectURL(newDocument.file) : undefined,
        file_size: newDocument.file?.size,
        status: 'pending',
        tracking_number: '',
        shipping_fee: 0,
        payment_status: 'unpaid',
        created_at: new Date().toISOString()
      };

      setMailboxItems(prev => [newItem, ...prev]);
      setShowAddModal(false);
      setNewDocument({
        document_type: '',
        document_name: '',
        description: '',
        file: null
      });
    } catch (error) {
      console.error('Error adding document:', error);
      alert('Error adding document');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (item: VirtualMailboxItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
    
    // Update status to viewed if not already
    if (item.status === 'delivered' || item.status === 'sent') {
      setMailboxItems(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, status: 'viewed', viewed_date: new Date().toISOString() }
            : i
        )
      );
    }
  };

  const handleDownloadDocument = (item: VirtualMailboxItem) => {
    if (item.file_url) {
      // Simulate download
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.document_name;
      link.click();
      
      // Update status to downloaded
      setMailboxItems(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, status: 'downloaded', downloaded_date: new Date().toISOString() }
            : i
        )
      );
      
      alert('Document "' + item.document_name + '" downloaded successfully!');
    }
  };

  const handleShipDocument = (item: VirtualMailboxItem) => {
    setSelectedMailboxItem(item);
    setShowShippingModal(true);
  };

  const handleShippingPayment = async () => {
    if (!selectedMailboxItem) return;
    
    setPaymentLoading(true);
    try {
      const shippingFee = shippingOption === 'standard' ? 15 : 25;
      const trackingNumber = `VM${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      // Update the item with payment and tracking info
      setMailboxItems(prev => 
        prev.map(item => 
          item.id === selectedMailboxItem.id 
            ? {
                ...item,
                shipping_fee: shippingFee,
                payment_status: 'paid' as const,
                status: 'sent' as const,
                tracking_number: trackingNumber,
                sent_date: new Date().toISOString()
              }
            : item
        )
      );
      
      setShowShippingModal(false);
      setSelectedMailboxItem(null);
      
      alert(`Payment successful! Your document will be shipped via ${shippingOption} delivery ($${shippingFee}). Tracking number: ${trackingNumber}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'downloaded': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'waived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = mailboxItems.filter(item => {
    const matchesSearch = item.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || item.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: mailboxItems.length,
    pending: mailboxItems.filter(item => item.status === 'pending').length,
    unpaid: mailboxItems.filter(item => item.payment_status === 'unpaid' && item.status !== 'pending').length,
    revenue: mailboxItems.reduce((sum, item) => sum + (item.payment_status === 'paid' ? item.shipping_fee : 0), 0)
  };

  if (viewMode === 'client') {
    return (
      <div className="space-y-6">
        {/* Client View Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Virtual Mailbox</h3>
            <p className="text-sm text-gray-600">Receive and download your official documents</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="viewed">Viewed</option>
            <option value="downloaded">Downloaded</option>
          </select>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">Your virtual mailbox is empty or no documents match your search.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <h4 className="text-lg font-medium text-gray-900">{item.document_name}</h4>
                      <span className={'px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <p className="font-medium text-gray-900">{item.document_type}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Size:</span>
                        <p className="font-medium text-gray-900">
                          {item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {item.tracking_number && (
                        <div>
                          <span className="text-gray-500">Tracking:</span>
                          <p className="font-medium text-gray-900">{item.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewDocument(item)}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    {item.file_url && (
                      <button
                        onClick={() => handleDownloadDocument(item)}
                        className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    )}
                    
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleShipDocument(item)}
                        className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors flex items-center space-x-2"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Ship to Address</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Document Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Document Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Document Name:</label>
                        <p className="font-medium text-gray-900">{selectedItem.document_name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Type:</label>
                        <p className="font-medium text-gray-900">{selectedItem.document_type}</p>
                      </div>
                      {selectedItem.tracking_number && (
                        <div>
                          <label className="text-sm text-gray-600">Tracking Number:</label>
                          <p className="font-medium text-gray-900">{selectedItem.tracking_number}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Payment */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Status & Payment</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600">Status:</label>
                        <span className={'ml-2 px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(selectedItem.status)}>
                          {selectedItem.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Shipping Fee:</label>
                        <p className="font-medium text-gray-900">${selectedItem.shipping_fee}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Payment Status:</label>
                        <span className={'ml-2 px-3 py-1 rounded-full text-xs font-medium ' + getPaymentStatusColor(selectedItem.payment_status)}>
                          {selectedItem.payment_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Timeline */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Document Created</p>
                        <p className="text-sm text-gray-600">{new Date(selectedItem.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {selectedItem.sent_date && (
                      <div className="flex items-center space-x-3">
                        <Truck className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">Document Shipped</p>
                          <p className="text-sm text-gray-600">{new Date(selectedItem.sent_date).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedItem.delivered_date && (
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">Document Delivered</p>
                          <p className="text-sm text-gray-600">{new Date(selectedItem.delivered_date).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedItem.viewed_date && (
                      <div className="flex items-center space-x-3">
                        <Eye className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="font-medium text-gray-900">Document Viewed</p>
                          <p className="text-sm text-gray-600">{new Date(selectedItem.viewed_date).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedItem.downloaded_date && (
                      <div className="flex items-center space-x-3">
                        <Download className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="font-medium text-gray-900">Document Downloaded</p>
                          <p className="text-sm text-gray-600">{new Date(selectedItem.downloaded_date).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  {selectedItem.file_url && (
                    <button
                      onClick={() => handleDownloadDocument(selectedItem)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Modal */}
        {showShippingModal && selectedMailboxItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Ship Document</h3>
                  <button
                    onClick={() => setShowShippingModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Document Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedMailboxItem.document_name}</h4>
                  <p className="text-sm text-gray-600">{selectedMailboxItem.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">Document Type:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMailboxItem.document_type}</span>
                  </div>
                </div>

                {/* Shipping Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Option</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingOption === 'standard'}
                        onChange={(e) => setShippingOption(e.target.value as 'standard' | 'express')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Standard Shipping</span>
                          <span className="font-bold text-gray-900">$15</span>
                        </div>
                        <p className="text-sm text-gray-600">5-7 business days</p>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingOption === 'express'}
                        onChange={(e) => setShippingOption(e.target.value as 'standard' | 'express')}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Express Shipping</span>
                          <span className="font-bold text-gray-900">$25</span>
                        </div>
                        <p className="text-sm text-gray-600">2-3 business days</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Shipping Address</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Shipping Fee:</span>
                    <span className="font-bold text-gray-900">${shippingOption === 'standard' ? '15' : '25'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Delivery Time:</span>
                    <span className="text-gray-900">{shippingOption === 'standard' ? '5-7 days' : '2-3 days'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowShippingModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShippingPayment}
                    disabled={paymentLoading || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.country}
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {paymentLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Pay ${shippingOption === 'standard' ? '15' : '25'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Consultant View
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid</p>
              <p className="text-3xl font-bold text-red-600">{stats.unpaid}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-green-600">${stats.revenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Virtual Mailbox Management</h2>
              <p className="text-sm text-gray-600">Send official documents to clients via virtual mailbox</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Document</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="viewed">Viewed</option>
              <option value="downloaded">Downloaded</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="waived">Waived</option>
            </select>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">No documents match your current filters.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{item.document_name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.document_type}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {item.tracking_number && (
                            <span>Tracking: {item.tracking_number}</span>
                          )}
                          <span>Shipping Fee: ${item.shipping_fee}</span>
                          <span>Payment: 
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${getPaymentStatusColor(item.payment_status)}`}>
                              {item.payment_status.toUpperCase()}
                            </span>
                          </span>
                          <span>Size: {item.file_size ? `${(item.file_size / 1024).toFixed(1)} KB` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDocument(item)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </button>
                      
                      {item.status === 'pending' && (
                        <button
                          className="bg-green-50 text-green-600 px-3 py-1 rounded text-sm font-medium hover:bg-green-100 transition-colors flex items-center space-x-1"
                        >
                          <Send className="h-3 w-3" />
                          <span>Send</span>
                        </button>
                      )}
                      
                      {item.shipping_fee > 0 && (
                        <button className="bg-purple-50 text-purple-600 px-3 py-1 rounded text-sm font-medium hover:bg-purple-100 transition-colors">
                          Waive Fee
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Document</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
                  <input
                    type="text"
                    value={newDocument.document_name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, document_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter document name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select
                    value={newDocument.document_type}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select document type</option>
                    <option value="Tax Registration Document">Tax Registration Document</option>
                    <option value="Bank Account Information">Bank Account Information</option>
                    <option value="Business License">Business License</option>
                    <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                  <input
                    type="file"
                    onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDocument}
                  disabled={loading || !newDocument.document_name || !newDocument.document_type}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Add Document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualMailboxManager;