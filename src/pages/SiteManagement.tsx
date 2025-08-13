import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  ArrowLeft, 
  Globe, 
  Edit, 
  Plus, 
  Save, 
  X, 
  Eye, 
  Trash2,
  Settings,
  FileText,
  Image,
  MessageSquare,
  Search,
  Tag,
  Languages,
  BarChart3,
  RefreshCw,
  Upload,
  Download,
  Copy,
  ExternalLink,
  Palette,
  Layout,
  Type,
  Camera,
  Zap,
  Target,
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SiteContent {
  id: string;
  section: 'hero' | 'about' | 'services' | 'faq' | 'blog' | 'testimonials';
  title: string;
  content: string;
  language: string;
  meta_keywords: string[];
  meta_description: string;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ServiceContent {
  id: string;
  service_slug: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image_url: string;
  language: string;
  meta_keywords: string[];
  meta_description: string;
  is_active: boolean;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  language: string;
  meta_keywords: string[];
  meta_description: string;
  featured_image: string;
  is_published: boolean;
  publish_date: string;
  created_at: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  language: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

const SiteManagement = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'hero' | 'services' | 'faq' | 'blog' | 'seo' | 'analytics'>('overview');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [siteContent, setSiteContent] = useState<SiteContent[]>([]);
  const [serviceContent, setServiceContent] = useState<ServiceContent[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'content' | 'service' | 'blog' | 'faq'>('content');

  const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const serviceTemplates = [
    {
      slug: 'company-registration',
      title: 'Company Registration',
      subtitle: 'Open your business fast, easy and reliable',
      description: 'Complete company registration and setup in Georgia',
      features: ['LLC registration setup', 'Tax number acquisition', 'Bank account assistance', 'Legal address provision'],
      image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      slug: 'bank-account-opening',
      title: 'Bank Account Opening',
      subtitle: 'Open Georgian bank accounts for residents and non-residents',
      description: 'Professional bank account opening assistance',
      features: ['Personal & business accounts', 'Multi-currency accounts', 'Online banking', 'Debit cards'],
      image_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      slug: 'visa-residence',
      title: 'Visa & Residence',
      subtitle: 'Get Your Georgian Visa or Residence Permit',
      description: 'Complete visa and residence permit assistance',
      features: ['Tourist & work visas', 'Residence permits', 'Document preparation', 'Application support'],
      image_url: 'https://images.pexels.com/photos/1456291/pexels-photo-1456291.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      slug: 'tax-residency',
      title: 'Tax Residency',
      subtitle: 'One of the lowest tax rates in the world',
      description: 'Tax residency and optimization services',
      features: ['0% tax on foreign income', 'Territorial taxation', 'Tax optimization', 'Compliance support'],
      image_url: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      slug: 'accounting-services',
      title: 'Accounting Services',
      subtitle: 'Your accounting partner for all accounting needs',
      description: 'Professional accounting and bookkeeping services',
      features: ['Monthly bookkeeping', 'Tax preparation', 'Financial reporting', 'Payroll processing'],
      image_url: 'https://images.pexels.com/photos/6863515/pexels-photo-6863515.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      slug: 'legal-consulting',
      title: 'Legal Consulting',
      subtitle: 'Professional legal services for business operations',
      description: 'Expert legal consulting and compliance services',
      features: ['Contract drafting', 'Legal compliance', 'Business law', 'Dispute resolution'],
      image_url: 'https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  useEffect(() => {
    if (profile?.id) {
      fetchSiteData();
    }
  }, [profile, selectedLanguage]);

  const fetchSiteData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockSiteContent: SiteContent[] = [
        {
          id: '1',
          section: 'hero',
          title: 'Strategic gateway between Europe and Asia',
          content: 'Strategic gateway between Europe and Asia with exceptional business opportunities. Our expert consultants provide comprehensive guidance to help you establish and grow your business in this dynamic jurisdiction.',
          language: selectedLanguage,
          meta_keywords: ['georgia', 'business', 'company formation', 'tax benefits'],
          meta_description: 'Start your business in Georgia with expert guidance and exceptional opportunities',
          is_published: true,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          section: 'about',
          title: 'Why Choose Georgia?',
          content: 'Strategic gateway between Europe and Asia with exceptional business opportunities. Our expert consultants provide comprehensive guidance to help you establish and grow your business in this dynamic jurisdiction.',
          language: selectedLanguage,
          meta_keywords: ['georgia advantages', 'business benefits', 'tax optimization'],
          meta_description: 'Discover why Georgia is the perfect jurisdiction for your business',
          is_published: true,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const mockServiceContent: ServiceContent[] = serviceTemplates.map((template, index) => ({
        id: (index + 1).toString(),
        service_slug: template.slug,
        title: template.title,
        subtitle: template.subtitle,
        description: template.description,
        features: template.features,
        image_url: template.image_url,
        language: selectedLanguage,
        meta_keywords: [template.title.toLowerCase(), 'georgia', 'business'],
        meta_description: `${template.title} services in Georgia - ${template.subtitle}`,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      const mockBlogPosts: BlogPost[] = [
        {
          id: '1',
          title: 'New Investment Opportunities in Georgia 2024',
          excerpt: 'Latest developments in Georgia\'s business landscape and emerging opportunities for international investors.',
          content: '<p>Georgia continues to emerge as one of the most attractive destinations for international business and investment...</p>',
          author: profile?.full_name || 'Georgia Expert',
          category: 'Market Update',
          tags: ['investment', 'georgia', 'business', '2024'],
          language: selectedLanguage,
          meta_keywords: ['georgia investment', 'business opportunities', 'market update'],
          meta_description: 'Discover new investment opportunities in Georgia for 2024',
          featured_image: 'https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=800',
          is_published: true,
          publish_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      const mockFAQs: FAQ[] = [
        {
          id: '1',
          question: 'How long does it take to register a company in Georgia?',
          answer: 'Company registration in Georgia typically takes 3-5 business days once all required documents are submitted.',
          language: selectedLanguage,
          category: 'Company Formation',
          order_index: 1,
          is_published: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          question: 'What are the tax advantages of Georgian companies?',
          answer: 'Georgian companies benefit from 0% tax on foreign-sourced income and territorial taxation principles.',
          language: selectedLanguage,
          category: 'Taxation',
          order_index: 2,
          is_published: true,
          created_at: new Date().toISOString()
        }
      ];

      setSiteContent(mockSiteContent);
      setServiceContent(mockServiceContent);
      setBlogPosts(mockBlogPosts);
      setFaqs(mockFAQs);
    } catch (error) {
      console.error('Error fetching site data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (data: any) => {
    try {
      // In real implementation, this would save to database
      console.log('Saving content:', data);
      
      if (editingType === 'content') {
        setSiteContent(prev => 
          editingItem 
            ? prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item)
            : [...prev, { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }]
        );
      } else if (editingType === 'service') {
        setServiceContent(prev => 
          editingItem 
            ? prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item)
            : [...prev, { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }]
        );
      } else if (editingType === 'blog') {
        setBlogPosts(prev => 
          editingItem 
            ? prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item)
            : [...prev, { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }]
        );
      } else if (editingType === 'faq') {
        setFaqs(prev => 
          editingItem 
            ? prev.map(item => item.id === editingItem.id ? { ...item, ...data } : item)
            : [...prev, { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }]
        );
      }

      setShowEditor(false);
      setEditingItem(null);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'content') {
        setSiteContent(prev => prev.filter(item => item.id !== id));
      } else if (type === 'service') {
        setServiceContent(prev => prev.filter(item => item.id !== id));
      } else if (type === 'blog') {
        setBlogPosts(prev => prev.filter(item => item.id !== id));
      } else if (type === 'faq') {
        setFaqs(prev => prev.filter(item => item.id !== id));
      }
      
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const openEditor = (type: 'content' | 'service' | 'blog' | 'faq', item?: any) => {
    setEditingType(type);
    setEditingItem(item || null);
    setShowEditor(true);
  };

  const getSiteUrl = () => {
    return `https://consulting19.com/consultants/${profile?.id}/georgia`;
  };

  const stats = {
    totalContent: siteContent.length + serviceContent.length + blogPosts.length + faqs.length,
    publishedContent: siteContent.filter(c => c.is_published).length + 
                     serviceContent.filter(s => s.is_active).length + 
                     blogPosts.filter(b => b.is_published).length + 
                     faqs.filter(f => f.is_published).length,
    totalViews: 12547,
    monthlyViews: 3421,
    seoScore: 85,
    conversionRate: 12.3
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
          {/* Back Button */}
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
              <h1 className="text-2xl font-bold text-gray-900">Site Management</h1>
              <p className="text-gray-600 mt-1">Manage your Georgia consulting website content and design</p>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={getSiteUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <ExternalLink className="h-5 w-5" />
                <span>View Live Site</span>
              </a>
              <button
                onClick={fetchSiteData}
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
        {/* Language Selector */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Languages className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Content Language:</span>
            <div className="flex space-x-2">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${
                    selectedLanguage === lang.code
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContent}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-3xl font-bold text-green-600">{stats.publishedContent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Views</p>
                <p className="text-3xl font-bold text-blue-600">{stats.monthlyViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SEO Score</p>
                <p className="text-3xl font-bold text-green-600">{stats.seoScore}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion</p>
                <p className="text-3xl font-bold text-orange-600">{stats.conversionRate}%</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'hero', label: 'Hero Section', icon: Layout },
                { key: 'services', label: 'Services', icon: Settings },
                { key: 'faq', label: 'FAQ', icon: MessageSquare },
                { key: 'blog', label: 'Blog & News', icon: FileText },
                { key: 'seo', label: 'SEO Settings', icon: Search },
                { key: 'analytics', label: 'Analytics', icon: BarChart3 }
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
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Site Preview */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Your Georgia Site Preview</h3>
                    <a
                      href={getSiteUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Live</span>
                    </a>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-2">consulting19.com/consultants/georgia</div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="h-20 bg-blue-100 rounded"></div>
                        <div className="h-20 bg-green-100 rounded"></div>
                        <div className="h-20 bg-purple-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <button
                    onClick={() => openEditor('content')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <Layout className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Edit Hero Section</h3>
                    </div>
                    <p className="text-sm text-gray-600">Update main banner and description</p>
                  </button>

                  <button
                    onClick={() => openEditor('service')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-green-100 rounded-lg p-2">
                        <Settings className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Add Service</h3>
                    </div>
                    <p className="text-sm text-gray-600">Create new service offering</p>
                  </button>

                  <button
                    onClick={() => openEditor('blog')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-purple-100 rounded-lg p-2">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Write Blog Post</h3>
                    </div>
                    <p className="text-sm text-gray-600">Share insights and updates</p>
                  </button>

                  <button
                    onClick={() => openEditor('faq')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-orange-100 rounded-lg p-2">
                        <MessageSquare className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Add FAQ</h3>
                    </div>
                    <p className="text-sm text-gray-600">Answer common questions</p>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Hero Section Content</h3>
                  <button
                    onClick={() => openEditor('content')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Content</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {siteContent.filter(c => c.section === 'hero').map((content) => (
                    <div key={content.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{content.title}</h4>
                          <p className="text-gray-600 mb-4">{content.content.substring(0, 200)}...</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Language: {content.language.toUpperCase()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              content.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {content.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditor('content', content)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id, 'content')}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Our Services in Georgia</h3>
                  <button
                    onClick={() => openEditor('service')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Service</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceContent.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="relative h-48">
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h4 className="font-bold text-lg">{service.title}</h4>
                          <p className="text-sm text-white/90">{service.subtitle}</p>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.is_active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditor('service', service)}
                            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(service.id, 'service')}
                            className="bg-red-50 text-red-600 px-3 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
                  <button
                    onClick={() => openEditor('faq')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add FAQ</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h4>
                          <p className="text-gray-600 mb-4">{faq.answer}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {faq.category}</span>
                            <span>Language: {faq.language.toUpperCase()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              faq.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {faq.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditor('faq', faq)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id, 'faq')}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Blog Posts & News</h3>
                  <button
                    onClick={() => openEditor('blog')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Post</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              post.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {post.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{post.excerpt}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Category: {post.category}</span>
                            <span>Language: {post.language.toUpperCase()}</span>
                            <span>Author: {post.author}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {post.tags.map((tag) => (
                              <span key={tag} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditor('blog', post)}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, 'blog')}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">SEO Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Title
                      </label>
                      <input
                        type="text"
                        defaultValue="Georgia Business Formation - Expert Consulting"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        defaultValue="Expert Georgia business formation services. Company registration, tax residency, banking solutions with professional consulting support."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      defaultValue="georgia company formation, business registration georgia, tax residency georgia, georgian banking"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mt-6 flex items-center space-x-4">
                    <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Save SEO Settings
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Preview SEO
                    </button>
                  </div>
                </div>

                {/* SEO Analysis */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">SEO Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{stats.seoScore}</div>
                      <p className="text-sm text-gray-600">SEO Score</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.seoScore}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">23</div>
                      <p className="text-sm text-gray-600">Keywords Ranking</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">156</div>
                      <p className="text-sm text-gray-600">Backlinks</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                {/* Traffic Overview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Traffic Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalViews.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">Total Views</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{stats.monthlyViews.toLocaleString()}</div>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{stats.conversionRate}%</div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">2.3min</div>
                      <p className="text-sm text-gray-600">Avg Session</p>
                    </div>
                  </div>

                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Analytics chart visualization</p>
                      <p className="text-sm text-gray-500">Real-time traffic and conversion data</p>
                    </div>
                  </div>
                </div>

                {/* Top Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Content</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Company Registration Service</h4>
                        <p className="text-sm text-gray-600">Most viewed service page</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">4,521 views</div>
                        <div className="text-sm text-gray-500">+23% this month</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Tax Residency Guide</h4>
                        <p className="text-sm text-gray-600">Popular blog post</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">3,247 views</div>
                        <div className="text-sm text-gray-500">+18% this month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Universal Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingItem ? 'Edit' : 'Add'} {editingType === 'content' ? 'Content' : 
                   editingType === 'service' ? 'Service' : 
                   editingType === 'blog' ? 'Blog Post' : 'FAQ'}
                </h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <ContentEditor
                type={editingType}
                item={editingItem}
                language={selectedLanguage}
                onSave={handleSaveContent}
                onCancel={() => setShowEditor(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Content Editor Component
const ContentEditor: React.FC<{
  type: 'content' | 'service' | 'blog' | 'faq';
  item?: any;
  language: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ type, item, language, onSave, onCancel }) => {
  const [formData, setFormData] = useState(() => {
    if (type === 'content') {
      return {
        section: item?.section || 'hero',
        title: item?.title || '',
        content: item?.content || '',
        language: language,
        meta_keywords: item?.meta_keywords?.join(', ') || '',
        meta_description: item?.meta_description || '',
        is_published: item?.is_published ?? true
      };
    } else if (type === 'service') {
      return {
        service_slug: item?.service_slug || '',
        title: item?.title || '',
        subtitle: item?.subtitle || '',
        description: item?.description || '',
        features: item?.features?.join('\n') || '',
        image_url: item?.image_url || '',
        language: language,
        meta_keywords: item?.meta_keywords?.join(', ') || '',
        meta_description: item?.meta_description || '',
        is_active: item?.is_active ?? true
      };
    } else if (type === 'blog') {
      return {
        title: item?.title || '',
        excerpt: item?.excerpt || '',
        content: item?.content || '',
        author: item?.author || '',
        category: item?.category || 'Market Update',
        tags: item?.tags?.join(', ') || '',
        language: language,
        meta_keywords: item?.meta_keywords?.join(', ') || '',
        meta_description: item?.meta_description || '',
        featured_image: item?.featured_image || '',
        is_published: item?.is_published ?? true
      };
    } else {
      return {
        question: item?.question || '',
        answer: item?.answer || '',
        language: language,
        category: item?.category || 'General',
        order_index: item?.order_index || 1,
        is_published: item?.is_published ?? true
      };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let processedData = { ...formData };
    
    if (type === 'content' || type === 'service' || type === 'blog') {
      processedData.meta_keywords = formData.meta_keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
    
    if (type === 'service') {
      processedData.features = formData.features.split('\n').map((f: string) => f.trim()).filter(Boolean);
    }
    
    if (type === 'blog') {
      processedData.tags = formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type === 'faq' ? 'Question' : 'Title'} *
          </label>
          <input
            type="text"
            required
            value={type === 'faq' ? formData.question : formData.title}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [type === 'faq' ? 'question' : 'title']: e.target.value 
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder={type === 'faq' ? 'Enter your question' : 'Enter title'}
          />
        </div>

        {type === 'service' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Slug *
            </label>
            <input
              type="text"
              required
              value={formData.service_slug}
              onChange={(e) => setFormData(prev => ({ ...prev, service_slug: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="company-registration"
            />
          </div>
        )}

        {type === 'service' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Service subtitle"
            />
          </div>
        )}

        {type === 'blog' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Market Update">Market Update</option>
              <option value="Legal Insights">Legal Insights</option>
              <option value="Tax Planning">Tax Planning</option>
              <option value="Business Tips">Business Tips</option>
            </select>
          </div>
        )}
      </div>

      {/* Content/Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'faq' ? 'Answer' : type === 'blog' ? 'Content' : 'Description'} *
        </label>
        <textarea
          rows={type === 'blog' ? 12 : 6}
          required
          value={type === 'faq' ? formData.answer : formData.content}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            [type === 'faq' ? 'answer' : 'content']: e.target.value 
          }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={type === 'blog' ? 'Write your blog post content (HTML supported)' : 'Enter description'}
        />
      </div>

      {/* Service Features */}
      {type === 'service' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features (one per line)
          </label>
          <textarea
            rows={4}
            value={formData.features}
            onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
          />
        </div>
      )}

      {/* Blog specific fields */}
      {type === 'blog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              rows={3}
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Brief excerpt for the blog post"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      )}

      {/* Image URL */}
      {(type === 'service' || type === 'blog') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type === 'service' ? 'Service Image URL' : 'Featured Image URL'}
          </label>
          <input
            type="url"
            value={type === 'service' ? formData.image_url : formData.featured_image}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              [type === 'service' ? 'image_url' : 'featured_image']: e.target.value 
            }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="https://images.pexels.com/..."
          />
        </div>
      )}

      {/* SEO Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO Keywords (comma separated)
          </label>
          <input
            type="text"
            value={formData.meta_keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
          </label>
          <input
            type="text"
            value={formData.meta_description}
            onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="SEO meta description"
          />
        </div>
      </div>

      {/* Publish Status */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="is_published"
          checked={type === 'service' ? formData.is_active : formData.is_published}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            [type === 'service' ? 'is_active' : 'is_published']: e.target.checked 
          }))}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
          {type === 'service' ? 'Active' : 'Published'}
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save</span>
        </button>
      </div>
    </form>
  );
};

export default SiteManagement;