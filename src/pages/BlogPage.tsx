import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, Calendar, ArrowRight, AlertTriangle } from 'lucide-react';
import { useBlogPosts, BlogPost as BlogItem } from '../hooks/useBlogPosts'; // Renamed BlogPost to BlogItem to avoid conflict with local interface

const BlogPage = () => {
  const { posts: blogPosts, loading, error } = useBlogPosts(); // Fetch all published posts

  // Filter posts to only show those by consultants
  const consultantPosts = React.useMemo(() => {
    if (!blogPosts) return [];
    return blogPosts.filter(post => post.author?.role === 'consultant');
  }, [blogPosts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Blog Posts</h3>
          <p className="text-gray-600">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Global Insights & <span className="text-yellow-300">Expert Articles</span>
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Stay updated with the latest business trends, legal changes, and market insights from our country consultants.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {consultantPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-600">Our consultants are working on new content. Please check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {consultantPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt || post.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{post.author?.full_name || 'Unknown Author'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      to={"/blog/" + post.slug}
                      className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;