import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, logAdminAction, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import { useBlogPosts, BlogPost } from '../../hooks/useBlogPosts';
import { useFAQs, FAQ } from '../../hooks/useFAQs';
import { CustomService, useServices } from '../../hooks/useServices';
import { useCountries, Country } from '../../hooks/useCountries';
import { SupportedLanguage } from '../../contexts/LanguageContext';
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
  MessageSquare
} from 'lucide-react';

interface CountryWithStats extends Country {
  consultant_count?: number;
  client_count?: number;
  total_revenue?: number;
}

const ConsultantCountryManagement = () => {
  const { profile } = useAuth();
  const { countries, loading: countriesLoading } = useCountries(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryWithStats | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'blog' | 'faq'>('services');
  
  // Content state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  
  // Editing states
  const [editingService, setEditingService] = useState<CustomService | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // File upload states
  const [selectedPostImageFile, setSelectedPostImageFile] = useState<File | null>(null);

  // Form states
  const [serviceForm, setServiceForm] = useState({
    consultant_id: profile?.id || '',
    country_id: '',
    title: '',
    description: '',
    features: [''],
    price: 0,
    currency: 'USD',
    delivery_time_days: 7,
    category: 'custom',
    is_active: true
  });

  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [''],
    language_code: 'en' as SupportedLanguage,
    is_published: false,
    featured_image_url: '',
    seo_title: '',
    seo_description: '',
    country_id: ''
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    language_code: 'en' as SupportedLanguage,
    sort_order: 0,
    is_active: true,
    country_id: ''
  });

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' }
  ];

  const blogCategories = [
    'Market Updates',
    'Legal Changes',
    'Tax Updates',
    'Business Insights',
    'Country Spotlights',
    'Success Stories',
    'Industry News',
    'Regulatory Updates'
  ];

  const faqCategories = [
    'Company Formation',
    'Banking',
    'Tax & Accounting',
    'Legal Services',
    'Visa & Residence',
    'General',
    'Technical Support'
  ];

  const serviceCategories = [
    { value: 'custom', label: 'Custom Service' },
    { value: 'document', label: 'Document Processing' },
    { value: 'certification', label: 'Certification' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'accounting', label: 'Accounting' },
    { value: 'banking', label: 'Banking' },
    { value: 'tax', label: 'Tax Services' }
  ];

  const handleCountrySelect = async (country: CountryWithStats) => {
    setSelectedCountry(country);
    await fetchCountrySpecificContent(country.id);
  };

  const fetchCountrySpecificContent = async (countryId: string) => {
    setLoading(true);
    try {
      // Fetch services for the selected country
      const { data: servicesData, error: servicesError } = await supabase
        .from('custom_services')
        .select(`
          *,
          consultant:consultant_id (
            id,
            full_name,
            email
          ),
          country:country_id (
            name,
            flag_emoji
          )
        `)
        .eq('country_id', countryId)
        .order('created_at', { ascending: false });
      
      if (servicesError) console.error('Error fetching services:', servicesError);
      setServices(servicesData || []);

      // Fetch blog posts for the selected country
      const { data: blogPostsData, error: blogPostsError } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id (
            full_name,
            email
          )
        `)
        .eq('country_id', countryId)
        .order('created_at', { ascending: false });
      
      if (blogPostsError) console.error('Error fetching blog posts:', blogPostsError);
      setBlogPosts(blogPostsData || []);

      // Fetch FAQs for the selected country
      const { data: faqsData, error: faqsError } = await supabase
        .from('faqs')
        .select('*')
        .eq('country_id', countryId)
        .order('sort_order', { ascending: true });
      
      if (faqsError) console.error('Error fetching FAQs:', faqsError);
      setFaqs(faqsData || []);
    } catch (error) {
      console.error('Error fetching country content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Service Management Handlers
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;

    try {
      const serviceData = {
        ...serviceForm,
        country_id: selectedCountry.id,
        features: serviceForm.features.filter(f => f.trim() !== '')
      };

      if (editingService) {
        const { error } = await supabase
          .from('custom_services')
          .update(serviceData)
          .eq('id', editingService.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('custom_services')
          .insert([serviceData]);
        
        if (error) throw error;
      }

      await fetchCountrySpecificContent(selectedCountry.id);
      resetServiceForm();
      alert('Service saved successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service: ' + (error as Error).message);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    if (!selectedCountry) return;

    try {
      const { error } = await supabase
        .from('custom_services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      
      await fetchCountrySpecificContent(selectedCountry.id);
      alert('Service deleted successfully!');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleEditService = (service: CustomService) => {
    setEditingService(service);
    setServiceForm({
      consultant_id: service.consultant_id,
      country_id: service.country_id || '',
      title: service.title,
      description: service.description || '',
      features: service.features.length > 0 ? service.features : [''],
      price: service.price,
      currency: service.currency,
      delivery_time_days: service.delivery_time_days,
      category: service.category,
      is_active: service.is_active
    });
    setShowServiceModal(true);
  };

  const resetServiceForm = () => {
    setServiceForm({
      consultant_id: profile?.id || '',
      country_id: selectedCountry?.id || '',
      title: '',
      description: '',
      features: [''],
      price: 0,
      currency: 'USD',
      delivery_time_days: 7,
      category: 'custom',
      is_active: true
    });
    setEditingService(null);
    setShowServiceModal(false);
  };

  // Blog Post Management Handlers
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;

    try {
      let imageUrl = postForm.featured_image_url;
      if (selectedPostImageFile) {
        // Check file size before upload (50MB limit)
        if (selectedPostImageFile.size > 50 * 1024 * 1024) {
          alert('Image size must be less than 50MB. Please compress your image and try again.');
          return;
        }
        const filePath = await uploadFileToStorage(selectedPostImageFile, 'blog_images');
        imageUrl = filePath;
      }

      const postData = {
        ...postForm,
        author_id: profile?.id,
        country_id: selectedCountry.id,
        tags: postForm.tags.filter(tag => tag.trim() !== ''),
        published_at: postForm.is_published ? new Date().toISOString() : null,
        featured_image_url: imageUrl
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);
        
        if (error) throw error;
      }

      await fetchCountrySpecificContent(selectedCountry.id);
      resetPostForm();
      alert('Blog post saved successfully!');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    if (!selectedCountry) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      await fetchCountrySpecificContent(selectedCountry.id);
      alert('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.category || '',
      tags: post.tags.length > 0 ? post.tags : [''],
      language_code: post.language_code as SupportedLanguage,
      is_published: post.is_published,
      featured_image_url: post.featured_image_url || '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      country_id: post.country_id || ''
    });
    setShowPostModal(true);
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [''],
      language_code: 'en',
      is_published: false,
      featured_image_url: '',
      seo_title: '',
      seo_description: '',
      country_id: selectedCountry?.id || ''
    });
    setEditingPost(null);
    setSelectedPostImageFile(null);
    setShowPostModal(false);
  };

  // FAQ Management Handlers
  const handleSubmitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountry) return;

    try {
      const faqData = {
        ...faqForm,
        country_id: selectedCountry.id
      };

      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(faqData)
          .eq('id', editingFaq.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([faqData]);
        
        if (error) throw error;
      }

      await fetchCountrySpecificContent(selectedCountry.id);
      resetFaqForm();
      alert('FAQ saved successfully!');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    if (!selectedCountry) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) throw error;
      
      await fetchCountrySpecificContent(selectedCountry.id);
      alert('FAQ deleted successfully!');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      language_code: faq.language_code as SupportedLanguage,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
      country_id: faq.country_id || ''
    });
    setShowFaqModal(true);
  };

  const resetFaqForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: '',
      language_code: 'en',
      sort_order: 0,
      is_active: true,
      country_id: selectedCountry?.id || ''
    });
    setEditingFaq(null);
    setShowFaqModal(false);
  };

  // Utility functions
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addTag = () => {
    setPostForm(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setPostForm(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setPostForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addServiceFeature = () => {
    setServiceForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateServiceFeature = (index: number, value: string) => {
    setServiceForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeServiceFeature = (index: number) => {
    setServiceForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (countriesLoading) {
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
              <h1 className="text-2xl font-bold text-gray-900">Country Content Management</h1>
              <p className="text-gray-600 mt-1">Manage services, blog posts, and FAQs for your assigned countries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Country Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Country to Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map(country => (
              <button
                key={country.id}
                onClick={() => handleCountrySelect(country)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedCountry?.id === country.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <span className="font-medium text-gray-900">{country.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedCountry && (
          <div className="space-y-8">
            {/* Country Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Managing Content for {selectedCountry.flag_emoji} {selectedCountry.name}
              </h2>
              <p className="text-gray-600">{selectedCountry.description}</p>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'services', label: 'Services', icon: Settings, count: services.length },
                    { key: 'blog', label: 'Blog Posts', icon: FileText, count: blogPosts.length },
                    { key: 'faq', label: 'FAQs', icon: MessageSquare, count: faqs.length }
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

              <div className="p-6">
                {/* Services Tab */}
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Services for {selectedCountry.name}</h3>
                      <button
                        onClick={() => setShowServiceModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Service</span>
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : services.length === 0 ? (
                      <div className="text-center py-12">
                        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Services</h3>
                        <p className="text-gray-600 mb-6">No services found for this country.</p>
                        <button
                          onClick={() => setShowServiceModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Add First Service
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {services.map(service => (
                          <div key={service.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-medium text-gray-900">{service.title}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {service.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>${service.price} {service.currency}</span>
                                  <span>{service.delivery_time_days} days</span>
                                  <span>{service.category}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditService(service)}
                                  className="text-blue-600 hover:text-blue-800 p-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteService(service.id)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Blog Posts Tab */}
                {activeTab === 'blog' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Blog Posts for {selectedCountry.name}</h3>
                      <button
                        onClick={() => setShowPostModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Blog Post</span>
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : blogPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts</h3>
                        <p className="text-gray-600 mb-6">No blog posts found for this country.</p>
                        <button
                          onClick={() => setShowPostModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Add First Blog Post
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {blogPosts.map(post => (
                          <div key={post.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    post.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {post.is_published ? 'Published' : 'Draft'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{post.category}</span>
                                  <span>{post.language_code.toUpperCase()}</span>
                                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditPost(post)}
                                  className="text-blue-600 hover:text-blue-800 p-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faq' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">FAQs for {selectedCountry.name}</h3>
                      <button
                        onClick={() => setShowFaqModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                    ) : faqs.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs</h3>
                        <p className="text-gray-600 mb-6">No FAQs found for this country.</p>
                        <button
                          onClick={() => setShowFaqModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Add First FAQ
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {faqs.map(faq => (
                          <div key={faq.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    faq.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {faq.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{faq.answer}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{faq.category}</span>
                                  <span>{faq.language_code.toUpperCase()}</span>
                                  <span>Order: {faq.sort_order}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => handleEditFaq(faq)}
                                  className="text-blue-600 hover:text-blue-800 p-2"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Modal */}
      {showServiceModal && selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingService ? 'Edit Service' : 'Create New Service'} for {selectedCountry.name}
                </h2>
                <button
                  onClick={resetServiceForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Georgia Company Certificate Translation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {serviceCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={serviceForm.currency}
                    onChange={(e) => setServiceForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GEL">GEL</option>
                    <option value="TRY">TRY</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed description of the service..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Features
                </label>
                <div className="space-y-2">
                  {serviceForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateServiceFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Feature description"
                      />
                      {serviceForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeServiceFeature(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addServiceFeature}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Feature</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={serviceForm.delivery_time_days}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, delivery_time_days: parseInt(e.target.value) || 7 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="service_is_active"
                  checked={serviceForm.is_active}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="service_is_active" className="text-sm font-medium text-gray-700">
                  Service is active and available to clients
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingService ? 'Update' : 'Create'} Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Post Modal */}
      {showPostModal && selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'} for {selectedCountry.name}
                </h2>
                <button
                  onClick={resetPostForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitPost} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => {
                      setPostForm(prev => ({ 
                        ...prev, 
                        title: e.target.value,
                        slug: prev.slug || generateSlug(e.target.value)
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Blog post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.slug}
                    onChange={(e) => setPostForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="url-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={postForm.language_code}
                    onChange={(e) => setPostForm(prev => ({ ...prev, language_code: e.target.value as SupportedLanguage }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {supportedLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category...</option>
                    {blogCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  rows={2}
                  value={postForm.excerpt}
                  onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write your blog post content here..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {postForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag name"
                      />
                      {postForm.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTag}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      // Check file size (50MB limit)
                      if (file.size > 50 * 1024 * 1024) {
                        alert('Image size must be less than 50MB. Please compress your image and try again.');
                        e.target.value = '';
                        return;
                      }
                      setSelectedPostImageFile(file);
                    } else {
                      setSelectedPostImageFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
                {selectedPostImageFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {selectedPostImageFile.name}</p>
                )}
                {postForm.featured_image_url && !selectedPostImageFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Current image:</p>
                    <img 
                      src={getPublicImageUrl(postForm.featured_image_url)} 
                      alt="Current Featured" 
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>

              {/* SEO Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={postForm.seo_title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, seo_title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    rows={2}
                    value={postForm.seo_description}
                    onChange={(e) => setPostForm(prev => ({ ...prev, seo_description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO meta description..."
                  />
                </div>
              </div>

              {/* Publish Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={postForm.is_published}
                  onChange={(e) => setPostForm(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetPostForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingPost ? 'Update' : 'Create'} Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && selectedCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFaq ? 'Edit FAQ' : 'Create New FAQ'} for {selectedCountry.name}
                </h2>
                <button
                  onClick={resetFaqForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitFaq} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={faqForm.language_code}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, language_code: e.target.value as SupportedLanguage }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {supportedLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category...</option>
                    {faqCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, question: e.target.value }))}
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
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Detailed answer to the question..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={faqForm.sort_order}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="faq_is_active"
                    checked={faqForm.is_active}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="faq_is_active" className="text-sm font-medium text-gray-700">
                    FAQ is active and visible
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetFaqForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingFaq ? 'Update' : 'Create'} FAQ</span>
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