import React from 'react';
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Tag, Share2 } from 'lucide-react';

const BlogPostPage = () => {
  const { postId } = useParams<{ postId: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock blog post data
  const blogPost = {
    id: postId,
    title: 'New Investment Opportunities in Georgia 2024',
    content: `
      <p>Georgia continues to emerge as one of the most attractive destinations for international business and investment. With its strategic location between Europe and Asia, favorable tax policies, and streamlined business registration processes, the country offers unprecedented opportunities for entrepreneurs and investors.</p>
      
      <h2>Key Investment Sectors</h2>
      <p>The Georgian government has identified several key sectors for foreign investment, including technology, tourism, agriculture, and renewable energy. Each sector offers unique advantages and incentives for international investors.</p>
      
      <h3>Technology Sector</h3>
      <p>Georgia's technology sector has experienced remarkable growth, with the government implementing various initiatives to support tech startups and international tech companies. The country offers:</p>
      <ul>
        <li>Tax incentives for tech companies</li>
        <li>Simplified visa processes for tech workers</li>
        <li>Modern infrastructure and connectivity</li>
        <li>Growing pool of skilled developers</li>
      </ul>
      
      <h3>Tourism and Hospitality</h3>
      <p>With its rich cultural heritage and stunning natural landscapes, Georgia's tourism sector presents significant opportunities for investment in hotels, restaurants, and tourism services.</p>
      
      <h2>Business Formation Advantages</h2>
      <p>Setting up a business in Georgia offers numerous advantages:</p>
      <ul>
        <li>Simple and fast registration process (1-3 days)</li>
        <li>Low minimum capital requirements</li>
        <li>Favorable tax regime with territorial taxation</li>
        <li>Free economic zones with additional benefits</li>
      </ul>
      
      <h2>Looking Forward</h2>
      <p>As Georgia continues to strengthen its position as a regional business hub, early investors and businesses can benefit from the country's growth trajectory and business-friendly policies.</p>
    `,
    author: 'Nino Kvaratskhelia',
    date: '2024-01-15',
    category: 'Market Update',
    readTime: '5 min read',
    imageUrl: 'https://images.pexels.com/photos/3566187/pexels-photo-3566187.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Georgia', 'Investment', 'Business', 'Tax Benefits']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/blog"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
          
          <div className="mb-6">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              {blogPost.category}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {blogPost.title}
          </h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{blogPost.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(blogPost.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{blogPost.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={blogPost.imageUrl}
          alt={blogPost.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: blogPost.content }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Author Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {blogPost.author[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{blogPost.author}</p>
                  <p className="text-sm text-gray-600">Senior Consultant</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Expert consultant specializing in Georgian business formation and international tax optimization.
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <span key={tag} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Article</h3>
              <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;