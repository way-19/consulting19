import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  published_at?: string | null;
  author?: { full_name?: string | null; email?: string | null; role?: string | null } | null;
};

export function useBlogPosts() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const selectWithCover =
      'id,title,slug,content,excerpt,cover_image,published_at,author:author_id(full_name,email,role)';
    const selectNoCover =
      'id,title,slug,content,excerpt,published_at,author:author_id(full_name,email,role)';

    const fetchOnce = async (select: string) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(select)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data as BlogPost[]) ?? [];
    };

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) cover_image ile dene
        const data = await fetchOnce(selectWithCover);
        if (!ignore) setItems(data);
      } catch (e: any) {
        // 42703 -> column yok; cover_image'siz tekrar dene
        if (e?.code === '42703') {
          try {
            const dataNoCover = await fetchOnce(selectNoCover);
            if (!ignore) setItems(dataNoCover);
          } catch (inner: any) {
            if (!ignore) {
              setError(inner?.message || 'Blog yazıları alınamadı.');
              setItems([]);
              console.error('Error fetching blog posts (fallback):', inner);
            }
          }
        } else {
          if (!ignore) {
            const msg =
              e?.name === 'AbortError'
                ? 'İstek iptal edildi.'
                : e?.message?.includes('Failed to fetch')
                  ? 'Ağ/CORS hatası: Supabase API ulaşılamıyor.'
                  : e?.message || 'Bilinmeyen hata.';
            setError(msg);
            setItems([]);
            console.error('Error fetching blog posts:', e);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // Dışarıya "posts" olarak döndür.
  return { posts: items, loading, error };
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