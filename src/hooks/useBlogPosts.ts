import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface BlogPost {
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
  country_id?: string;
  author?: {
    full_name: string;
    email: string;
  };
}

export const useBlogPosts = (filters?: { isPublished?: boolean; languageCode?: string; countryId?: string }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, [filters]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase configuration missing. Using fallback data.');
        setBlogPosts([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id (
            full_name,
            email
          )
        `)
        .order('published_at', { ascending: false });

      if (filters?.isPublished !== undefined) {
        query = query.eq('is_published', filters.isPublished);
      }
      if (filters?.languageCode) {
        query = query.eq('language_code', filters.languageCode);
      }
      if (filters?.countryId) {
        query = query.eq('country_id', filters.countryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      // Gracefully handle connection errors
      console.warn('Blog posts unavailable, using fallback');
      setBlogPosts([]);
      setError(null); // Don't show error to user, just use empty state
    } finally {
      setLoading(false);
    }
  };

  const refreshBlogPosts = () => {
    fetchBlogPosts();
  };

  return {
    blogPosts,
    loading,
    error,
    refreshBlogPosts
  };
};

export const useBlogPost = (slug: string) => {
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:author_id (
            full_name,
            email
          )
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setBlogPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError(err instanceof Error ? err.message : 'Blog post not found');
      setBlogPost(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    blogPost,
    loading,
    error,
    refreshBlogPost: fetchBlogPost
  };
};

// Blog categories helper
export const useBlogCategories = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('is_published', true);

      if (error) throw error;

      const uniqueCategories = Array.from(new Set(data?.map(p => p.category).filter(Boolean) || []));
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    refreshCategories: fetchCategories
  };
};