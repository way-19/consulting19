import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import { useBlogPosts, BlogPost } from '../../hooks/useBlogPosts';
import { useFAQs, FAQ } from '../../hooks/useFAQs';
import { useCountries } from '../../hooks/useCountries';
import { 
  ArrowLeft, 
  Globe, 
  FileText, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Upload,
  Image,
  Languages,
  CheckCircle,
  AlertTriangle,
  Tag,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';

const ConsultantCountryManagement = () => {
  const { profile } = useAuth();
  const { countries, loading: countriesLoading, refreshCountries } = useCountries();
  const { blogPosts, loading: blogLoading, refreshBlogPosts } = useBlogPosts();
  const { faqs, loading: faqLoading, refreshFAQs } = useFAQs();
  
  const [activeTab, setActiveTab] = useState<'countries' | 'blog' | 'faq'>('countries');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  
  // Country management
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(null);
  const [selectedCountryImageFile, setSelectedCountryImageFile] = useState<File | null>(null);
  const [countryForm, setCountryForm] = useState({
    name: '',
    slug: '',
    flag_emoji: '',
    description: '',
    image_url: '',
    primary_language: 'en',
    supported_languages: ['en'],
    highlights: [''],
    tags: [''],
    is_active: true,
    sort_order: 0
  });

  // Blog management
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [selectedBlogImageFile, setSelectedBlogImageFile] = useState<File | null>(null);
  const [blogForm, setBlogForm] = useState({
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
    country_id: ''
  });

  // FAQ management
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    language_code: 'en',
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

  // Country Management Functions
  const handleSubmitCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = countryForm.image_url;

      // Upload new image if selected
      if (selectedCountryImageFile) {
        try {
          const imagePath = await uploadFileToStorage(selectedCountryImageFile, 'countries');
          imageUrl = imagePath;
        } catch (uploadError) {
          console.error('Error uploading country image:', uploadError);
          alert('Failed to upload image. Saving without image.');
        }
      }

      const countryData = {
        ...countryForm,
        image_url: imageUrl,
        supported_languages: countryForm.supported_languages.filter(lang => lang.trim() !== ''),
        highlights: countryForm.highlights.filter(h => h.trim() !== ''),
        tags: countryForm.tags.filter(t => t.trim() !== '')
      };

      if (editingCountry) {
        const { error } = await supabase
          .from('countries')
          .update(countryData)
          .eq('id', editingCountry.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('countries')
          .insert([countryData]);
        
        if (error) throw error;
      }

      await refreshCountries();
      resetCountryForm();
      alert('Country saved successfully!');
    } catch (error) {
      console.error('Error saving country:', error);
      alert('Failed to save country: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCountry = (country: any) => {
    setEditingCountry(country);
    setCountryForm({
      name: country.name,
      slug: country.slug,
      flag_emoji: country.flag_emoji || '',
      description: country.description || '',
      image_url: country.image_url || '',
      primary_language: country.primary_language,
      supported_languages: country.supported_languages || ['en'],
      highlights: country.highlights?.length > 0 ? country.highlights : [''],
      tags: country.tags?.length > 0 ? country.tags : [''],
      is_active: country.is_active,
      sort_order: country.sort_order || 0
    });
    setShowCountryModal(true);
  };

  const resetCountryForm = () => {
    setCountryForm({
      name: '',
      slug: '',
      flag_emoji: '',
      description: '',
      image_url: '',
      primary_language: 'en',
      supported_languages: ['en'],
      highlights: [''],
      tags: [''],
      is_active: true,
      sort_order: 0
    });
    setEditingCountry(null);
    setSelectedCountryImageFile(null);
    setShowCountryModal(false);
  };

  // Blog Management Functions
  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = blogForm.featured_image_url;

      // Upload new image if selected
      if (selectedBlogImageFile) {
        try {
          const imagePath = await uploadFileToStorage(selectedBlogImageFile, 'blog');
          imageUrl = imagePath;
        } catch (uploadError) {
          console.error('Error uploading blog image:', uploadError);
          alert('Failed to upload image. Saving without image.');
        }
      }

      const blogData = {
        ...blogForm,
        author_id: profile?.id,
        featured_image_url: imageUrl,
        tags: blogForm.tags.filter(tag => tag.trim() !== ''),
        published_at: blogForm.is_published ? new Date().toISOString() : null,
        country_id: blogForm.country_id || null
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingBlog.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([blogData]);
        
        if (error) throw error;
      }

      await refreshBlogPosts();
      resetBlogForm();
      alert('Blog post saved successfully!');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || '',
      category: blog.category || '',
      tags: blog.tags?.length > 0 ? blog.tags : [''],
      language_code: blog.language_code,
      is_published: blog.is_published,
      featured_image_url: blog.featured_image_url || '',
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || '',
      country_id: blog.country_id || ''
    });
    setShowBlogModal(true);
  };

  const resetBlogForm = () => {
    setBlogForm({
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
      country_id: ''
    });
    setEditingBlog(null);
    setSelectedBlogImageFile(null);
    setShowBlogModal(false);
  };

  // FAQ Management Functions
  const handleSubmitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const faqData = {
        ...faqForm,
        country_id: faqForm.country_id || null
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

      await refreshFAQs();
      resetFaqForm();
      alert('FAQ saved successfully!');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      language_code: faq.language_code,
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
      country_id: ''
    });
    setEditingFaq(null);
    setShowFaqModal(false);
  };

  // Helper functions
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addArrayField = (field: 'supported_languages' | 'highlights' | 'tags', formType: 'country' | 'blog') => {
    if (formType === 'country') {
      setCountryForm(prev => ({
        ...prev,
        [field]: [...prev[field], '']
      }));
    } else if (formType === 'blog') {
      setBlogForm(prev => ({
        ...prev,
        tags: [...prev.tags, '']
      }));
    }
  };

  const updateArrayField = (field: 'supported_languages' | 'highlights' | 'tags', index: number, value: string, formType: 'country' | 'blog') => {
    if (formType === 'country') {
      setCountryForm(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
    } else if (formType === 'blog') {
      setBlogForm(prev => ({
        ...prev,
        tags: prev.tags.map((item, i) => i === index ? value : item)
      }));
    }
  };

  const removeArrayField = (field: 'supported_languages' | 'highlights' | 'tags', index: number, formType: 'country' | 'blog') => {
    if (formType === 'country') {
      setCountryForm(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else if (formType === 'blog') {
      setBlogForm(prev => ({
        ...prev,
        tags: prev.tags.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      await refreshBlogPosts();
      alert('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) throw error;
      await refreshFAQs();
      alert('FAQ deleted successfully!');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
  };

  // Get consultant's assigned countries
  const consultantCountries = countries.filter(country => {
    // This would be filtered based on consultant assignments
    // For now, showing all countries for demo
    return true;
  });

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = languageFilter === 'all' || post.language_code === languageFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    return matchesSearch && matchesLanguage && matchesCategory;
  });

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = languageFilter === 'all' || faq.language_code === languageFilter;
    const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter;
    
    return matchesSearch && matchesLanguage && matchesCategory;
  });

  if (countriesLoading || blogLoading || faqLoading) {
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
              <p className="text-gray-600 mt-1">Manage country information, blog posts, and FAQs</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (activeTab === 'countries') setShowCountryModal(true);
                  else if (activeTab === 'blog') setShowBlogModal(true);
                  else if (activeTab === 'faq') setShowFaqModal(true);
                }}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add {activeTab === 'countries' ? 'Country' : activeTab === 'blog' ? 'Blog Post' : 'FAQ'}</span>
              </button>
              <button
                onClick={() => {
                  refreshCountries();
                  refreshBlogPosts();
                  refreshFAQs();
                }}
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
                { key: 'countries', label: 'Countries', icon: Globe, count: consultantCountries.length },
                { key: 'blog', label: 'Blog Posts', icon: FileText, count: blogPosts.length },
                { key: 'faq', label: 'FAQs', icon: CheckCircle, count: faqs.length }
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

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
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

              {(activeTab === 'blog' || activeTab === 'faq') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Languages</option>
                    {supportedLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(activeTab === 'blog' || activeTab === 'faq') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {(activeTab === 'blog' ? blogCategories : faqCategories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'countries' && (
              <div className="space-y-4">
                {consultantCountries.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Assigned</h3>
                    <p className="text-gray-600">You haven't been assigned to any countries yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {consultantCountries.map((country) => (
                      <div key={country.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={getPublicImageUrl(country.image_url) || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={country.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 text-2xl">{country.flag_emoji}</div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{country.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{country.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              country.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {country.is_active ? 'Active' : 'Inactive'}
                            </span>
                            
                            <button
                              onClick={() => handleEditCountry(country)}
                              className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                          </div>
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
                    <p className="text-gray-600 mb-6">Create your first blog post to share insights.</p>
                    <button
                      onClick={() => setShowBlogModal(true)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create First Post
                    </button>
                  </div>
                ) : (
                  filteredBlogPosts.map((post) => (
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
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {supportedLanguages.find(l => l.code === post.language_code)?.flag} {post.language_code.toUpperCase()}
                            </span>
                          </div>
                          
                          {post.excerpt && (
                            <p className="text-gray-600 mb-3">{post.excerpt}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Category:</span> {post.category || 'Uncategorized'}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(post.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Tags:</span> {post.tags?.join(', ') || 'None'}
                            </div>
                            <div>
                              <span className="font-medium">Author:</span> {post.author?.full_name || 'Unknown'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditBlog(post)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(post.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs</h3>
                    <p className="text-gray-600 mb-6">Create your first FAQ to help clients.</p>
                    <button
                      onClick={() => setShowFaqModal(true)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      Create First FAQ
                    </button>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => (
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
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {supportedLanguages.find(l => l.code === faq.language_code)?.flag} {faq.language_code.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{faq.answer}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Category:</span> {faq.category || 'General'}
                            </div>
                            <div>
                              <span className="font-medium">Sort Order:</span> {faq.sort_order}
                            </div>
                            <div>
                              <span className="font-medium">Updated:</span> {new Date(faq.updated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditFaq(faq)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Country Modal */}
      {showCountryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCountry ? 'Edit Country' : 'Add New Country'}
                </h2>
                <button
                  onClick={resetCountryForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCountry} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={countryForm.name}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Georgia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={countryForm.slug}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., georgia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag Emoji
                  </label>
                  <input
                    type="text"
                    value={countryForm.flag_emoji}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, flag_emoji: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="🇬🇪"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={countryForm.sort_order}
                    onChange={(e) => setCountryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={countryForm.description}
                  onChange={(e) => setCountryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the country's business advantages..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 50 * 1024 * 1024) {
                        alert('Image size must be less than 50MB. Please compress your image and try again.');
                        e.target.value = '';
                        return;
                      }
                      setSelectedCountryImageFile(file);
                    } else {
                      setSelectedCountryImageFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
                {selectedCountryImageFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {selectedCountryImageFile.name}</p>
                )}
                {countryForm.image_url && !selectedCountryImageFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Current image:</p>
                    <img 
                      src={getPublicImageUrl(countryForm.image_url)} 
                      alt="Current Country" 
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>

              {/* Supported Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supported Languages
                </label>
                <div className="space-y-2">
                  {countryForm.supported_languages.map((lang, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={lang}
                        onChange={(e) => updateArrayField('supported_languages', index, e.target.value, 'country')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select language...</option>
                        {supportedLanguages.map(language => (
                          <option key={language.code} value={language.code}>
                            {language.flag} {language.name}
                          </option>
                        ))}
                      </select>
                      {countryForm.supported_languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('supported_languages', index, 'country')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('supported_languages', 'country')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Language</span>
                  </button>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Highlights
                </label>
                <div className="space-y-2">
                  {countryForm.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateArrayField('highlights', index, e.target.value, 'country')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Key business advantage"
                      />
                      {countryForm.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('highlights', index, 'country')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('highlights', 'country')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Highlight</span>
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {countryForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateArrayField('tags', index, e.target.value, 'country')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag (e.g., Tax Friendly)"
                      />
                      {countryForm.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('tags', index, 'country')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('tags', 'country')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="country_is_active"
                  checked={countryForm.is_active}
                  onChange={(e) => setCountryForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="country_is_active" className="text-sm font-medium text-gray-700">
                  Country is active and visible to users
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetCountryForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : editingCountry ? 'Update' : 'Create'} Country</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h2>
                <button
                  onClick={resetBlogForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitBlog} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => {
                      setBlogForm(prev => ({ 
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
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="url-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={blogForm.language_code}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, language_code: e.target.value }))}
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
                    value={blogForm.category}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select category...</option>
                    {blogCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Country
                  </label>
                  <select
                    value={blogForm.country_id}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, country_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">No specific country</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.flag_emoji} {country.name}
                      </option>
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
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
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
                  value={blogForm.content}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write your blog post content here..."
                />
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
                      if (file.size > 50 * 1024 * 1024) {
                        alert('Image size must be less than 50MB. Please compress your image and try again.');
                        e.target.value = '';
                        return;
                      }
                      setSelectedBlogImageFile(file);
                    } else {
                      setSelectedBlogImageFile(null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
                {selectedBlogImageFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {selectedBlogImageFile.name}</p>
                )}
                {blogForm.featured_image_url && !selectedBlogImageFile && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Current image:</p>
                    <img 
                      src={getPublicImageUrl(blogForm.featured_image_url)} 
                      alt="Current Featured" 
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200" 
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {blogForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateArrayField('tags', index, e.target.value, 'blog')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag name"
                      />
                      {blogForm.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('tags', index, 'blog')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('tags', 'blog')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Tag</span>
                  </button>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={blogForm.seo_title}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, seo_title: e.target.value }))}
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
                    value={blogForm.seo_description}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, seo_description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="SEO meta description..."
                  />
                </div>
              </div>

              {/* Publish Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="blog_is_published"
                  checked={blogForm.is_published}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="blog_is_published" className="text-sm font-medium text-gray-700">
                  Publish immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetBlogForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : editingBlog ? 'Update' : 'Create'} Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
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
                    onChange={(e) => setFaqForm(prev => ({ ...prev, language_code: e.target.value }))}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Related Country
                  </label>
                  <select
                    value={faqForm.country_id}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, country_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">No specific country</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.flag_emoji} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

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

              {/* Active Status */}
              <div className="flex items-center space-x-3">
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
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Saving...' : editingFaq ? 'Update' : 'Create'} FAQ</span>
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