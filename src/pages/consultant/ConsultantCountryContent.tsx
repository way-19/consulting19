import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, uploadFileToStorage, getPublicImageUrl } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Globe, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Upload,
  Image,
  Calendar,
  User,
  Tag,
  Languages,
  CheckCircle,
  AlertTriangle,
  Settings,
  DollarSign,
  Clock
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
  featured_image_url?: string;
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
  created_at: string;
  updated_at: string;
}

const ConsultantCountryContent = () => {
  const { profile } = useAuth();
  const [assignedCountries, setAssignedCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'faq'>('overview');
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
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
    featured_image_url: ''
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    language_code: 'en',
    sort_order: 0,
    is_active: true
  });

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
    { code: 'ka', name: 'Georgian', flag: '🇬🇪' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' }
  ];

  const blogCategories = [
    'Market Updates',
    'Legal Changes',
    'Tax Updates',
    'Business Insights',
    'Country Spotlights',
    'Success Stories'
  ];

  const faqCategories = [
    'Company Formation',
    'Banking',
    'Tax & Accounting',
    'Legal Services',
    'Visa & Residence',
    'General'
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchAssignedCountries();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedCountry) {
      fetchCountryContent();
    }
  }, [selectedCountry]);

  const fetchAssignedCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('consultant_country_assignments')
        .select(`
          country:country_id (
            id,
            name,
            slug,
            flag_emoji,
            description,
            image_url,
            primary_language,
            supported_languages,
            highlights,
            tags,
            is_active
          )
        `)
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (error) throw error;

      const countries = (data || [])
        .map(item => item.country)
        .filter(country => country !== null) as Country[];

      setAssignedCountries(countries);
      
      if (countries.length > 0 && !selectedCountry) {
        setSelectedCountry(countries[0]);
      }
    } catch (error) {
      console.error('Error fetching assigned countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryContent = async () => {
    if (!selectedCountry) return;

    try {
      // Fetch blog posts
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('author_id', profile?.id)
        .contains('tags', [selectedCountry.name])
        .order('created_at', { ascending: false });

      if (blogError) throw blogError;
      setBlogPosts(blogData || []);

      // Fetch FAQs
      const { data: faqData, error: faqError } = await supabase
        .from('faqs')
        .select('*')
        .textSearch('answer', selectedCountry.name)
        .order('sort_order', { ascending: true });

      if (faqError) throw faqError;
      setFaqs(faqData || []);
    } catch (error) {
      console.error('Error fetching country content:', error);
    }
  };

  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrlToSave = blogForm.featured_image_url;

      if (selectedBlogImageFile) {
        const uploadedPath = await uploadFileToStorage(selectedBlogImageFile, 'blog_images');
        imageUrlToSave = uploadedPath;
      }

      const blogData = {
        ...blogForm,
        featured_image_url: imageUrlToSave,
        author_id: profile?.id,
        tags: [...blogForm.tags.filter(tag => tag.trim() !== ''), selectedCountry?.name || ''],
        published_at: blogForm.is_published ? new Date().toISOString() : null
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

      await fetchCountryContent();
      resetBlogForm();
      alert('Blog post saved successfully!');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post');
    }
  };

  const handleSubmitFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(faqForm)
          .eq('id', editingFaq.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([faqForm]);
        
        if (error) throw error;
      }

      await fetchCountryContent();
      resetFaqForm();
      alert('FAQ saved successfully!');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ');
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
      tags: blog.tags.filter(tag => tag !== selectedCountry?.name),
      language_code: blog.language_code,
      is_published: blog.is_published,
      featured_image_url: blog.featured_image_url || ''
    });
    setSelectedBlogImageFile(null);
    setShowBlogModal(true);
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      language_code: faq.language_code,
      sort_order: faq.sort_order,
      is_active: faq.is_active
    });
    setShowFaqModal(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      await fetchCountryContent();
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
      await fetchCountryContent();
      alert('FAQ deleted successfully!');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
    }
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
      featured_image_url: ''
    });
    setEditingBlog(null);
    setSelectedBlogImageFile(null);
    setShowBlogModal(false);
  };

  const resetFaqForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: '',
      language_code: 'en',
      sort_order: 0,
      is_active: true
    });
    setEditingFaq(null);
    setShowFaqModal(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const addTag = () => {
    setBlogForm(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index: number, value: string) => {
    setBlogForm(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index: number) => {
    setBlogForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (assignedCountries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
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
            
            <div className="text-center py-16">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">No Countries Assigned</h1>
              <p className="text-gray-600 mb-6">You haven't been assigned to any countries yet. Please contact your administrator.</p>
              <button
                onClick={fetchAssignedCountries}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Refresh Assignments
              </button>
            </div>
          </div>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">My Country Content Management</h1>
              <p className="text-gray-600 mt-1">Manage content for your assigned countries</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchCountryContent}
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
        {/* Country Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Country</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedCountries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  selectedCountry?.id === country.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{country.name}</h3>
                    <p className="text-sm text-gray-600">{country.primary_language.toUpperCase()}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedCountry && (
          <>
            {/* Country Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={getPublicImageUrl(selectedCountry.image_url) || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={selectedCountry.name}
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                  <span className="absolute -top-2 -right-2 text-2xl">{selectedCountry.flag_emoji}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCountry.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedCountry.description}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className="text-sm text-gray-500">Primary: {selectedCountry.primary_language.toUpperCase()}</span>
                    <span className="text-sm text-gray-500">
                      Languages: {selectedCountry.supported_languages.join(', ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { key: 'overview', label: 'Overview', icon: Eye },
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
                      {tab.count !== undefined && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{blogPosts.length}</div>
                        <div className="text-sm text-blue-700">Blog Posts</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{faqs.length}</div>
                        <div className="text-sm text-green-700">FAQs</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <Languages className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{selectedCountry.supported_languages.length}</div>
                        <div className="text-sm text-purple-700">Languages</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Guidelines</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• Create informative blog posts about business opportunities in {selectedCountry.name}</p>
                        <p>• Write FAQs that address common client questions</p>
                        <p>• Use multiple languages to reach diverse audiences</p>
                        <p>• Keep content updated with latest regulations and opportunities</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'blog' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Blog Posts for {selectedCountry.name}</h3>
                      <button
                        onClick={() => setShowBlogModal(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Blog Post</span>
                      </button>
                    </div>

                    {blogPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts</h3>
                        <p className="text-gray-600 mb-6">Create your first blog post about {selectedCountry.name}.</p>
                        <button
                          onClick={() => setShowBlogModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Create First Post
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {blogPosts.map((post) => (
                          <div key={post.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
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
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Category: {post.category || 'Uncategorized'}</span>
                                  <span>Tags: {post.tags.join(', ') || 'None'}</span>
                                  <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
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
                        ))}
                      </div>
                    )}
                  </div>
                )}

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

                    {faqs.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs</h3>
                        <p className="text-gray-600 mb-6">Create your first FAQ about {selectedCountry.name}.</p>
                        <button
                          onClick={() => setShowFaqModal(true)}
                          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Create First FAQ
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {faqs.map((faq) => (
                          <div key={faq.id} className="bg-gray-50 rounded-lg p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900">{faq.question}</h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    faq.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {faq.is_active ? 'ACTIVE' : 'INACTIVE'}
                                  </span>
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                    {supportedLanguages.find(l => l.code === faq.language_code)?.flag} {faq.language_code.toUpperCase()}
                                  </span>
                                </div>
                                
                                <p className="text-gray-600 mb-3">{faq.answer}</p>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>Category: {faq.category || 'General'}</span>
                                  <span>Order: {faq.sort_order}</span>
                                  <span>Updated: {new Date(faq.updated_at).toLocaleDateString()}</span>
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
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Blog Post Modal */}
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

              {/* Featured Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedBlogImageFile(e.target.files[0]);
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
                  Tags (excluding country name)
                </label>
                <div className="space-y-2">
                  {blogForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag name"
                      />
                      {blogForm.tags.length > 1 && (
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
                <p className="text-xs text-gray-500 mt-1">
                  Country name "{selectedCountry?.name}" will be automatically added as a tag
                </p>
              </div>

              {/* Publish Status */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={blogForm.is_published}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, is_published: e.target.checked }))}
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
                  onClick={resetBlogForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingBlog ? 'Update' : 'Create'} Post</span>
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

export default ConsultantCountryContent;

