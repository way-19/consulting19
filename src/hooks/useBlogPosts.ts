```typescript
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
  country_id?: string; // Added country_id
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
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  return {
    blogPosts,
    loading,
    error,
    refreshBlogPosts: fetchBlogPosts
  };
};
```