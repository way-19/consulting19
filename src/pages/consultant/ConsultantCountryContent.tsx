import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Globe, 
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Image,
  Tag,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Eye,
  Flag,
  Languages,
  MessageSquare,
  Users
} from 'lucide-react';

interface AssignedCountry {
  id: string;
  name: string;
  slug: string;
  flag_emoji?: string;
  description?: string;
  image_url?: string;
  highlights: string[];
  tags: string[];
  is_active: boolean;
  assignment?: {
    is_primary: boolean;
    status: string;
  };
}

interface CountryBlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  language_code: string;
  is_published: boolean;
  created_at: string;
}

interface CountryFAQ {
  id: string;
  question: string;
  answer: string;
  language_code: string;
  sort_order: number;
  is_active: boolean;
}

const ConsultantCountryContent = () => {
  const { profile } = useAuth();
  const [countries, setCountries] = useState<AssignedCountry[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<AssignedCountry | null>(null);
  const [blogPosts, setBlogPosts] = useState<CountryBlogPost[]>([]);
  const [faqs, setFaqs] = useState<CountryFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'blog' | 'faq' | 'content'>('overview');
  const [editingCountry, setEditingCountry] = useState<AssignedCountry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    description: '',
    image_url: '',
    highlights: [''],
    tags: ['']
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    language_code: 'en',
    is_published: false
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
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
      console.log('🔍 Fetching assigned countries for consultant:', profile?.id);
      
      setLoading(true);
      
      const { data: assignments, error: assignmentError } = await supabase
        .from('consultant_country_assignments')
        .select(`
          is_primary,
          status,
          country:country_id (
            id,
            name,
            slug,
            flag_emoji,
            description,
            image_url,
            highlights,
            tags,
            is_active
          )
        `)
        .eq('consultant_id', profile?.id)
        .eq('status', 'active');

      if (error) {
        console.error('❌ Error fetching assignments:', error);
        throw error;
      }
      
      console.log('📊 Assignment data:', data);

      const assignedCountries = (assignments || []).map(assignment => ({
        ...assignment.country,
        assignment: {
          is_primary: assignment.is_primary,
          status: assignment.status
        }
      })) as AssignedCountry[];

      setCountries(assignedCountries);
      
      // Auto-select first country if available
      if (assignedCountries.length > 0 && !selectedCountry) {
        setSelectedCountry(assignedCountries[0]);
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
      // Fetch blog posts for this country
      const { data: posts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('author_id', profile?.id)
        .ilike('title', `%${selectedCountry.name}%`)
        .order('created_at', { ascending: false });

      setBlogPosts(posts || []);

      // Fetch FAQs for this country
      const { data: countryFaqs } = await supabase
        .from('faqs')
        .select('*')
        .ilike('question', `%${selectedCountry.name}%`)
        .order('sort_order', { ascending: true });

      setFaqs(countryFaqs || []);
    } catch (error) {
      console.error('Error fetching country content:', error);
    }
  };

  const handleEditCountry = (country: AssignedCountry) => {
    setEditingCountry(country);
    setEditForm({
      description: country.description || '',
      image_url: country.image_url || '',
      highlights: country.highlights.length > 0 ? country.highlights : [''],
      tags: country.tags.length > 0 ? country.tags : ['']
    });
    setShowEditModal(true);
  };

  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCountry) return;

    try {
      setSaving(true);

      const updateData = {
        description: editForm.description,
        image_url: editForm.image_url,
        highlights: editForm.highlights.filter(h => h.trim() !== ''),
        tags: editForm.tags.filter(t => t.trim() !== '')
      };

      const { error } = await supabase
        .from('countries')
        .update(updateData)
        .eq('id', editingCountry.id);

      if (error) throw error;

      await fetchAssignedCountries();
      resetCountryForm();
      alert('Country content updated successfully!');
    } catch (error) {
      console.error('Error updating country:', error);
      alert('Failed to update country content');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCountry) return;

    try {
      const postData = {
        ...blogForm,
        author_id: profile?.id,
        slug: blogForm.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        category: `${selectedCountry.name} Updates`,
        tags: [selectedCountry.name, selectedCountry.slug],
        published_at: blogForm.is_published ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('blog_posts')
        .insert([postData]);

      if (error) throw error;

      await fetchCountryContent();
      resetBlogForm();
      alert('Blog post created successfully!');
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Failed to create blog post');
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCountry) return;

    try {
      const faqData = {
        ...faqForm,
        category: selectedCountry.name
      };

      const { error } = await supabase
        .from('faqs')
        .insert([faqData]);

      if (error) throw error;

      await fetchCountryContent();
      resetFaqForm();
      alert('FAQ created successfully!');
    } catch (error) {
      console.error('Error creating FAQ:', error);
      alert('Failed to create FAQ');
    }
  };

  const resetCountryForm = () => {
    setEditForm({
      description: '',
      image_url: '',
      highlights: [''],
      tags: ['']
    });
    setEditingCountry(null);
    setShowEditModal(false);
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: '',
      content: '',
      excerpt: '',
      language_code: 'en',
      is_published: false
    });
    setShowBlogModal(false);
  };

  const resetFaqForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      language_code: 'en',
      sort_order: 0,
      is_active: true
    });
    setShowFaqModal(false);
  };

  const addArrayField = (field: 'highlights' | 'tags') => {
    setEditForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'highlights' | 'tags', index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'highlights' | 'tags', index: number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
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
              <p className="text-gray-600 mt-1">Manage content for countries assigned to you</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAssignedCountries}
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
        {countries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Countries Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any countries yet. Contact your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Country Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Countries</h3>
                <div className="space-y-3">
                  {countries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => setSelectedCountry(country)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedCountry?.id === country.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{country.flag_emoji}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{country.name}</h4>
                          <p className="text-xs text-gray-500">/{country.slug}</p>
                          {country.assignment?.is_primary && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {selectedCountry ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Country Header */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{selectedCountry.flag_emoji}</span>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedCountry.name}</h2>
                          <p className="text-gray-600">Content Management</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/countries/${selectedCountry.slug}`}
                          target="_blank"
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Preview</span>
                        </Link>
                        <button
                          onClick={() => handleEditCountry(selectedCountry)}
                          className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Country</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { key: 'overview', label: 'Overview', icon: Globe },
                        { key: 'blog', label: 'Blog Posts', icon: FileText, count: blogPosts.length },
                        { key: 'faq', label: 'FAQs', icon: MessageSquare, count: faqs.length },
                        { key: 'content', label: 'Page Content', icon: Edit }
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

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Country Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Country Information</h3>
                            <div className="space-y-3">
                              <div>
                                <span className="text-sm text-gray-600">Name:</span>
                                <p className="font-medium">{selectedCountry.name}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">URL Slug:</span>
                                <p className="font-medium">/{selectedCountry.slug}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Status:</span>
                                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                                  selectedCountry.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {selectedCountry.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Assignment:</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    selectedCountry.assignment?.is_primary 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {selectedCountry.assignment?.is_primary ? 'Primary Consultant' : 'Secondary Consultant'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{blogPosts.length}</div>
                                <div className="text-sm text-blue-700">Blog Posts</div>
                              </div>
                              <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{faqs.length}</div>
                                <div className="text-sm text-green-700">FAQs</div>
                              </div>
                              <div className="bg-purple-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">{selectedCountry.highlights.length}</div>
                                <div className="text-sm text-purple-700">Highlights</div>
                              </div>
                              <div className="bg-orange-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">{selectedCountry.tags.length}</div>
                                <div className="text-sm text-orange-700">Tags</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Current Content Preview */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Content</h3>
                          <div className="bg-gray-50 rounded-lg p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                <p className="text-sm text-gray-700">
                                  {selectedCountry.description || 'No description available'}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Key Highlights</h4>
                                <div className="space-y-1">
                                  {selectedCountry.highlights.map((highlight, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span className="text-sm text-gray-700">{highlight}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCountry.tags.map((tag, index) => (
                                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
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
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts</h4>
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
                                    <p className="text-sm text-gray-500">
                                      Created: {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors">
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
                            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">No FAQs</h4>
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
                                    <p className="text-gray-600 mb-3 line-clamp-2">{faq.answer}</p>
                                    <p className="text-sm text-gray-500">Sort Order: {faq.sort_order}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors">
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

                    {activeTab === 'content' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Page Content for {selectedCountry.name}</h3>
                          <button
                            onClick={() => handleEditCountry(selectedCountry)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Content</span>
                          </button>
                        </div>

                        {/* Current Content Display */}
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                              <p className="text-gray-700 bg-white rounded-lg p-4 border border-gray-200">
                                {selectedCountry.description || 'No description available'}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Featured Image</h4>
                              {selectedCountry.image_url ? (
                                <img
                                  src={selectedCountry.image_url}
                                  alt={selectedCountry.name}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                  <Image className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Key Highlights</h4>
                              <div className="space-y-2">
                                {selectedCountry.highlights.map((highlight, index) => (
                                  <div key={index} className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-gray-200">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-gray-700">{highlight}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {selectedCountry.tags.map((tag, index) => (
                                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-md text-sm">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Country</h3>
                  <p className="text-gray-600">Choose a country from the sidebar to manage its content.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Country Modal */}
      {showEditModal && editingCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Edit {editingCountry.name} Content
                </h2>
                <button
                  onClick={resetCountryForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveCountry} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of the country's business advantages..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://images.pexels.com/..."
                />
                {editForm.image_url && (
                  <div className="mt-2">
                    <img
                      src={editForm.image_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Highlights
                </label>
                <div className="space-y-2">
                  {editForm.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => updateArrayField('highlights', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Key business advantage"
                      />
                      {editForm.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('highlights', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('highlights')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Highlight</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-2">
                  {editForm.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateArrayField('tags', index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag (e.g., Tax Friendly)"
                      />
                      {editForm.tags.length > 1 && (
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
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Blog Post Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Blog Post for {selectedCountry?.name}</h2>
                <button
                  onClick={resetBlogForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveBlogPost} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`e.g., New Business Opportunities in ${selectedCountry?.name}`}
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
                  <span>Create Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add FAQ for {selectedCountry?.name}</h2>
                <button
                  onClick={resetFaqForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveFaq} className="p-6 space-y-6">
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
                  placeholder={`e.g., How long does it take to register a company in ${selectedCountry?.name}?`}
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
                  <span>Create FAQ</span>
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