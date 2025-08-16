import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, logAdminAction } from '../../lib/supabase';
import { 
  ArrowLeft, 
  FileText, 
  Plus,
  Eye, 
  Edit,
  Trash2,
  RefreshCw,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Globe,
  Tag,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id?: string;
  category?: string;
  tags: string[];
  language_code: string;
  is_published: boolean;
  published_at?: string;
  featured_image_url?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string;
    email: string;
  };
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

const ContentManagement = () => {
  const { profile } = useAuth();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'blog' | 'faq'>('blog');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [''],
    language_code: 'en',
    is_published: false,
    seo_title: '',
    seo_description: ''
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    language_code: 'en',
    sort_order: 0,
    is_active: true
  });

  const blogCategories = [
    { value: 'general', label: 'General' },
    { value: 'company_formation', label: 'Company Formation' },
    { value: 'tax_accounting', label: 'Tax & Accounting' },
    { value: 'legal', label: 'Legal' },
    { value: 'banking', label: 'Banking' },
    { value: 'visa_residency', label: 'Visa & Residency' }
  ];

  const faqCategories = [
    { value: 'general', label: 'General' },
    { value: 'platform', label: 'Platform' },
    { value: 'services', label: 'Services' },
    { value: 'billing', label: 'Billing' },
    { value: 'technical', label: 'Technical' }
  ];

  useEffect(() => {
    if (profile?.legacy_role === 'admin') {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchBlogPosts(),
        fetchFAQs()
      ]);
    } catch (error) {
      console.error('Error fetching content data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        author:author_id (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setBlogPosts(data || []);
  };

  const fetchFAQs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    setFaqs(data || []);
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const blogData = {
        ...blogForm,
        author_id: profile?.id,
        tags: blogForm.tags.filter(tag => tag.trim() !== ''),
        published_at: blogForm.is_published ? new Date().toISOString() : null
      };

      if (editingBlog) {
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingBlog.id);
        
        if (error) throw error;
        await logAdminAction('UPDATE_BLOG_POST', 'blog_posts', editingBlog.id, editingBlog, blogData);
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([blogData]);
        
        if (error) throw error;
        await logAdminAction('CREATE_BLOG_POST', 'blog_posts', null, null, blogData);
      }

      await fetchBlogPosts();
      resetBlogForm();
      alert('Blog post saved successfully!');
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post: ' + (error as Error).message);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const blogToDelete = blogPosts.find(b => b.id === blogId);
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      
      await logAdminAction('DELETE_BLOG_POST', 'blog_posts', blogId, blogToDelete, null);
      await fetchBlogPosts();
      alert('Blog post deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const faqData = {
        ...faqForm,
        sort_order: faqForm.sort_order || 0
      };

      if (editingFaq) {
        const { error } = await supabase
          .from('faqs')
          .update(faqData)
          .eq('id', editingFaq.id);
        
        if (error) throw error;
        await logAdminAction('UPDATE_FAQ', 'faqs', editingFaq.id, editingFaq, faqData);
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert([faqData]);
        
        if (error) throw error;
        await logAdminAction('CREATE_FAQ', 'faqs', null, null, faqData);
      }

      await fetchFAQs();
      resetFaqForm();
      alert('FAQ saved successfully!');
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Failed to save FAQ: ' + (error as Error).message);
    }
  };

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const faqToDelete = faqs.find(f => f.id === faqId);
      
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) throw error;
      
      await logAdminAction('DELETE_FAQ', 'faqs', faqId, faqToDelete, null);
      await fetchFAQs();
      alert('FAQ deleted successfully!');
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Failed to delete FAQ');
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
      tags: blog.tags.length > 0 ? blog.tags : [''],
      language_code: blog.language_code,
      is_published: blog.is_published,
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || ''
    });
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
      seo_title: '',
      seo_description: ''
    });
    setEditingBlog(null);
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

  const filteredBlogPosts = blogPosts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && post.is_published) ||
      (statusFilter === 'draft' && !post.is_published);
    
    return matchesSearch && matchesStatus;
  });

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && faq.is_active) ||
      (statusFilter === 'inactive' && !faq.is_active);
    
    return matchesSearch && matchesStatus;
  });

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
              to="/admin-dashboard"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-1">Manage blog posts, FAQs, and website content</p>
            </div>
            <div className="flex items-center space-x-4">
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
                { key: 'blog', label: 'Blog Posts', icon: FileText, count: blogPosts.length },
                { key: 'faq', label: 'FAQs', icon: Tag, count: faqs.length }
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
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {activeTab === 'blog' ? (
                    <>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </>
                  ) : (
                    <>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <button
                  onClick={() => activeTab === 'blog' ? setShowBlogModal(true) : setShowFaqModal(true)}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>{activeTab === 'blog' ? 'Add New Post' : 'Add New FAQ'}</span>
                </button>
              </div>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'blog' ? (
              <div className="space-y-4">
                {filteredBlogPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Blog Posts Found</h3>
                    <p className="text-gray-600">No blog posts match your current filters.</p>
                  </div>
                ) : (
                  filteredBlogPosts.map((post) => (
                    <div key={post.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              post.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt || post.content}</p>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{post.author?.full_name || 'Unknown Author'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            {post.published_at && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Published: {new Date(post.published_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Tag className="h-4 w-4" />
                              <span>Category: {post.category || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditBlog(post)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
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
            ) : (
              <div className="space-y-4">
                {filteredFAQs.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Found</h3>
                    <p className="text-gray-600">No FAQs match your current filters.</p>
                  </div>
                ) : (
                  filteredFAQs.map((faq) => (
                    <div key={faq.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {faq.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-3 line-clamp-2">{faq.answer}</p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Tag className="h-4 w-4" />
                              <span>Category: {faq.category || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Globe className="h-4 w-4" />
                              <span>Language: {faq.language_code.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created: {new Date(faq.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditFaq(faq)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Blog Post Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
                </h2>
                <button
                  onClick={resetBlogForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBlogSubmit} className="p-6 space-y-6">
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
                    placeholder="Blog Post Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="blog-post-slug"
                  />
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
                    <option value="">Select Category</option>
                    {blogCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
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
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt (Short Summary)
                </label>
                <textarea
                  rows={3}
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="A short summary for display on blog lists..."
                />
              </div>

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
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tag"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={blogForm.seo_title}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, seo_title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SEO friendly title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  rows={3}
                  value={blogForm.seo_description}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, seo_description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="SEO friendly description"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_published_blog"
                  checked={blogForm.is_published}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, is_published: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published_blog" className="text-sm font-medium text-gray-700">
                  Publish this post
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h2>
                <button
                  onClick={resetFaqForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleFaqSubmit} className="p-6 space-y-6">
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
                  placeholder="Enter FAQ question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  required
                  rows={5}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter FAQ answer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={faqForm.category}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {faqCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={faqForm.language_code}
                    onChange={(e) => setFaqForm(prev => ({ ...prev, language_code: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={faqForm.sort_order}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="is_active_faq"
                  checked={faqForm.is_active}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active_faq" className="text-sm font-medium text-gray-700">
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

export default ContentManagement;