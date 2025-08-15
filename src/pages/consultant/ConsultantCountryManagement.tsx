import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Globe, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Users,
  Settings,
  RefreshCw,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Flag,
  Image,
  Languages,
  Tag,
  FileText,
  Calendar,
  Star,
  Upload,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Country {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  primary_language: string;
  supported_languages: string[];
  highlights: string[];
  tags: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags: string[];
  language_code: string;
  is_published: boolean;
  published_at?: string;
  featured_image_url?: string;
  country_id?: string;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  language_code: string;
  sort_order: number;
  is_active: boolean;
  country_id?: string;
  created_at: string;
  updated_at: string;
}

interface CustomService {
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
}

const ConsultantCountryManagement = () => {
  const { profile } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'countries' | 'blog' | 'faq' | 'services'>('countries');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [contentType, setContentType] = useState<'blog' | 'faq' | 'service'>('blog');

  const [contentForm, setContentForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [''],
    language_code: 'en',
    is_published: false,
    country_id: '',
    // FAQ specific
    question: '',
    answer: '',
    sort_order: 0,
    is_active: true,
    // Service specific
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7
  });

  useEffect(() => {
    if (profile?.id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCountries(),
        fetchBlogPosts(),
        fetchFAQs(),
        fetchServices()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountries = async () => {
    try {
      // Get countries assigned to this consultant
      const { data: assignments } = await supabase
        .from('consultant_country_assignments')
        .select('country_id')
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (!assignments || assignments.length === 0) {
        setCountries([]);
        return;
      }

      const countryIds = assignments.map(a => a.country_id);

      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .in('id', countryIds)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('author_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
    }
  };

  const fetchFAQs = async () => {
    try {
      // Get FAQs for countries assigned to this consultant
      const { data: assignments } = await supabase
        .from('consultant_country_assignments')
        .select('country_id')
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (!assignments || assignments.length === 0) {
        setFaqs([]);
        return;
      }

      const countryIds = assignments.map(a => a.country_id);

      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .in('country_id', countryIds)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setFaqs([]);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_services')
        .select('*')
        .eq('consultant_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const handleSubmitContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let data: any = {};
      let table = '';

      if (contentType === 'blog') {
        data = {
          title: contentForm.title,
          slug: generateSlug(contentForm.title),
          content: contentForm.content,
          excerpt: contentForm.excerpt,
          category: contentForm.category,
          tags: contentForm.tags.filter(t => t.trim() !== ''),
          language_code: contentForm.language_code,
          is_published: contentForm.is_published,
          country_id: contentForm.country_id || null,
          author_id: profile?.id,
          published_at: contentForm.is_published ? new Date().toISOString() : null
        };
        table = 'blog_posts';
      } else if (contentType === 'faq') {
        data = {
          question: contentForm.question,
          answer: contentForm.answer,
          category: contentForm.category,
          language_code: contentForm.language_code,
          sort_order: contentForm.sort_order,
          is_active: contentForm.is_active,
          country_id: contentForm.country_id || null
        };
        table = 'faqs';
      } else if (contentType === 'service') {
        data = {
          title: contentForm.title,
          description: contentForm.description,
          features: contentForm.features.filter(f => f.trim() !== ''),
          price: contentForm.price,
          currency: contentForm.currency,
          delivery_time_days: contentForm.delivery_time_days,
          category: contentForm.category,
          is_active: contentForm.is_active,
          country_id: contentForm.country_id || null,
          consultant_id: profile?.id
        };
        table = 'custom_services';
      }

      if (editingContent) {
        const { error } = await supabase
          .from(table)
          .update(data)
          .eq('id', editingContent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(table)
          .insert([data]);
        
        if (error) throw error;
      }

      await fetchData();
      resetForm();
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content: ' + (error as Error).message);
    }
  };

  const handleDeleteContent = async (id: string, type: 'blog' | 'faq' | 'service') => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const table = type === 'blog' ? 'blog_posts' : type === 'faq' ? 'faqs' : 'custom_services';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
      alert('Content deleted successfully!');
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleEditContent = (content: any, type: 'blog' | 'faq' | 'service') => {
    setEditingContent(content);
    setContentType(type);
    
    if (type === 'blog') {
      setContentForm({
        ...contentForm,
        title: content.title,
        content: content.content,
        excerpt: content.excerpt || '',
        category: content.category || '',
        tags: content.tags.length > 0 ? content.tags : [''],
        language_code: content.language_code,
        is_published: content.is_published,
        country_id: content.country_id || ''
      });
    } else if (type === 'faq') {
      setContentForm({
        ...contentForm,
        question: content.question,
        answer: content.answer,
        category: content.category || '',
        language_code: content.language_code,
        sort_order: content.sort_order,
        is_active: content.is_active,
        country_id: content.country_id || ''
      });
    } else if (type === 'service') {
      setContentForm({
        ...contentForm,
        title: content.title,
        description: content.description || '',
        features: content.features.length > 0 ? content.features : [''],
        price: content.price,
        currency: content.currency,
        delivery_time_days: content.delivery_time_days,
        category: content.category,
        is_active: content.is_active,
        country_id: content.country_id || ''
      });
    }
    
    setShowContentModal(true);
  };

  const resetForm = () => {
    setContentForm({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [''],
      language_code: 'en',
      is_published: false,
      country_id: '',
      question: '',
      answer: '',
      sort_order: 0,
      is_active: true,
      description: '',
      features: [''],
      price: 0,
      currency: 'USD',
      delivery_time_days: 7
    });
    setEditingContent(null);
    setShowContentModal(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addArrayField = (field: 'tags' | 'features') => {
    setContentForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'tags' | 'features', index: number, value: string) => {
    setContentForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'tags' | 'features', index: number) => {
    setContentForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const filteredCountries = (countries || []).filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBlogPosts = (blogPosts || []).filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = (faqs || []).filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = (services || []).filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              to="/consultant-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management System</h1>
              <p className="text-gray-600 mt-1">Manage your country pages, blog posts, FAQs, and services</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowContentModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Content</span>
              </button>
              <button
                onClick={fetchData}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'countries', label: 'My Countries', icon: Globe, count: countries.length },
                { key: 'blog', label: 'Blog Posts', icon: FileText, count: blogPosts.length },
                { key: 'faq', label: 'FAQs', icon: CheckCircle, count: faqs.length },
                { key: 'services', label: 'Services', icon: Settings, count: services.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'countries' && (
              <div className="space-y-4">
                {filteredCountries.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Countries</h3>
                    <p className="text-gray-600">You haven't been assigned to any countries yet. Contact admin for assignments.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCountries.map((country) => (
                      <div key={country.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center space-x-4 mb-4">
                          <span className="text-3xl">{country.flag_emoji || '🌍'}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{country.name}</h3>
                            <p className="text-sm text-gray-600">/{country.slug}</p>
                          </div>
                        </div>

                        {country.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {country.description}
                          </p>
                        )}

                        {/* Content Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="text-lg font-bold text-blue-600">
                              {blogPosts.filter(p => p.country_id === country.id).length}
                            </div>
                            <div className="text-xs text-blue-700">Blog Posts</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <div className="text-lg font-bold text-green-600">
                              {faqs.filter(f => f.country_id === country.id).length}
                            </div>
                            <div className="text-xs text-green-700">FAQs</div>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-2">
                            <div className="text-lg font-bold text-purple-600">
                              {services.filter(s => s.country_id === country.id).length}
                            </div>
                            <div className="text-xs text-purple-700">Services</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCountry(country);
                              setContentType('blog');
                              setContentForm(prev => ({ ...prev, country_id: country.id }));
                              setShowContentModal(true);
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Add Blog</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCountry(country);
                              setContentType('faq');
                              setContentForm(prev => ({ ...prev, country_id: country.id }));
                              setShowContentModal(true);
                            }}
                            className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Add FAQ</span>
                          </button>
                          <Link
                            to={`/countries/${country.slug}`}
                            target="_blank"
                            className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-4">
                {filteredBlogPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts</h3>
                    <p className="text-gray-600 mb-6">Create your first blog post to share insights about your countries.</p>
                    <button
                      onClick={() => {
                        setContentType('blog');
                        setShowContentModal(true);
                      }}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create First Blog Post
                    </button>
                  </div>
                ) : (
                  filteredBlogPosts.map((post) => {
                    const country = countries.find(c => c.id === post.country_id);
                    
                    return (
                      <div key={post.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                post.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                              </span>
                              {country && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {country.flag_emoji} {country.name}
                                </span>
                              )}
                            </div>
                            
                            {post.excerpt && (
                              <p className="text-gray-600 mb-3">{post.excerpt}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Category: {post.category || 'Uncategorized'}</span>
                              <span>Language: {post.language_code.toUpperCase()}</span>
                              <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditContent(post, 'blog')}
                              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContent(post.id, 'blog')}
                              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs</h3>
                    <p className="text-gray-600 mb-6">Create FAQs to help clients understand your countries better.</p>
                    <button
                      onClick={() => {
                        setContentType('faq');
                        setShowContentModal(true);
                      }}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create First FAQ
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const country = countries.find(c => c.id === faq.country_id);
                    
                    return (
                      <div key={faq.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                faq.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {faq.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                              {country && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {country.flag_emoji} {country.name}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-600 mb-3 line-clamp-2">{faq.answer}</p>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Category: {faq.category || 'General'}</span>
                              <span>Language: {faq.language_code.toUpperCase()}</span>
                              <span>Order: {faq.sort_order}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditContent(faq, 'faq')}
                              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContent(faq.id, 'faq')}
                              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Services</h3>
                    <p className="text-gray-600 mb-6">Create custom services for your clients.</p>
                    <button
                      onClick={() => {
                        setContentType('service');
                        setShowContentModal(true);
                      }}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create First Service
                    </button>
                  </div>
                ) : (
                  filteredServices.map((service) => {
                    const country = countries.find(c => c.id === service.country_id);
                    
                    return (
                      <div key={service.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {service.is_active ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                              {country && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {country.flag_emoji} {country.name}
                                </span>
                              )}
                            </div>
                            
                            {service.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span>Price: ${service.price} {service.currency}</span>
                              <span>Delivery: {service.delivery_time_days} days</span>
                              <span>Category: {service.category}</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {service.features.slice(0, 3).map((feature, index) => (
                                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                                  {feature}
                                </span>
                              ))}
                              {service.features.length > 3 && (
                                <span className="text-xs text-gray-500">+{service.features.length - 3} more</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditContent(service, 'service')}
                              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContent(service.id, 'service')}
                              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Form Modal */}
      {showContentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContent ? 'Edit' : 'Create'} {contentType === 'blog' ? 'Blog Post' : contentType === 'faq' ? 'FAQ' : 'Service'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitContent} className="p-6 space-y-6">
              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={contentForm.country_id}
                  onChange={(e) => setContentForm(prev => ({ ...prev, country_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Global Content</option>
                  {countries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.flag_emoji} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Blog Post Fields */}
              {contentType === 'blog' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={contentForm.title}
                        onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Blog post title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={contentForm.category}
                        onChange={(e) => setContentForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Market Update"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={contentForm.excerpt}
                      onChange={(e) => setContentForm(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      rows={8}
                      value={contentForm.content}
                      onChange={(e) => setContentForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Write your blog post content..."
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="space-y-2">
                      {contentForm.tags.map((tag, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateArrayField('tags', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Tag name"
                          />
                          {contentForm.tags.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField('tags', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('tags')}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Tag</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={contentForm.is_published}
                      onChange={(e) => setContentForm(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                      Publish immediately
                    </label>
                  </div>
                </>
              )}

              {/* FAQ Fields */}
              {contentType === 'faq' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question *
                    </label>
                    <input
                      type="text"
                      required
                      value={contentForm.question}
                      onChange={(e) => setContentForm(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Frequently asked question..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contentForm.answer}
                      onChange={(e) => setContentForm(prev => ({ ...prev, answer: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Detailed answer..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        type="text"
                        value={contentForm.category}
                        onChange={(e) => setContentForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Company Formation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={contentForm.sort_order}
                        onChange={(e) => setContentForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="faq_is_active"
                      checked={contentForm.is_active}
                      onChange={(e) => setContentForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="faq_is_active" className="text-sm font-medium text-gray-700">
                      FAQ is active and visible
                    </label>
                  </div>
                </>
              )}

              {/* Service Fields */}
              {contentType === 'service' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={contentForm.title}
                      onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Georgia Company Registration"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={contentForm.description}
                      onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Service description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={contentForm.price}
                        onChange={(e) => setContentForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={contentForm.currency}
                        onChange={(e) => setContentForm(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GEL">GEL</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Time (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={contentForm.delivery_time_days}
                        onChange={(e) => setContentForm(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) || 7 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Features
                    </label>
                    <div className="space-y-2">
                      {contentForm.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateArrayField('features', index, e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Feature description"
                          />
                          {contentForm.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField('features', index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayField('features')}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Feature</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="service_is_active"
                      checked={contentForm.is_active}
                      onChange={(e) => setContentForm(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="service_is_active" className="text-sm font-medium text-gray-700">
                      Service is active and available
                    </label>
                  </div>
                </>
              )}

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={contentForm.language_code}
                  onChange={(e) => setContentForm(prev => ({ ...prev, language_code: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="tr">🇹🇷 Türkçe</option>
                  <option value="ka">🇬🇪 ქართული</option>
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                  <option value="ar">🇸🇦 العربية</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingContent ? 'Update' : 'Create'} {contentType === 'blog' ? 'Post' : contentType === 'faq' ? 'FAQ' : 'Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantCountryManagement;