import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Added content
  excerpt?: string; 
  cover_image?: string;
  published_at: string;
  author?: { full_name?: string; email?: string; role?: string } | null; // Added role here
}

export function useBlogPosts(countryId?: string) {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryId) return; // id yoksa çağrı yapma

    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    supabase
      .from('blog_posts')
      .select(
        'id,title,slug,content,excerpt,cover_image,published_at,author:author_id(full_name,email,role)' // Added 'content' and 'role'
      )
      .eq('is_published', true)
      .eq('country_id', countryId)
      .order('published_at', { ascending: false })
      .limit(10)
      .abortSignal?.(ctrl.signal) // supabase-js v2
      .then(({ data, error }) => {
        if (error) throw error;
        setData((data as BlogPost[]) ?? []);
      })
      .catch((e: any) => {
        console.error('Error fetching blog posts:', {
          message: e?.message || String(e),
          details: e?.cause || e
        });
        setError(e?.message || 'Failed to fetch');
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [countryId]);

  return { data, loading, error };
}

// Keep the old interface for backward compatibility
export const useBlogPost = (slug: string) => {
  const [blogPost, setBlogPost] = useState<any | null>(null);
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
          id,title,slug,content,excerpt,author_id,category,tags,language_code,is_published,published_at,featured_image_url,seo_title,seo_description,created_at,updated_at,country_id,cover_image,
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
      console.error('Error fetching FAQ categories:', err);
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