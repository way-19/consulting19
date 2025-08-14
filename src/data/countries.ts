// This file is now deprecated - countries are fetched dynamically from Supabase
// Use the useCountries hook instead: import { useCountries } from '../hooks/useCountries';

export interface Country {
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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Legacy export for backward compatibility - will be removed in future versions
export const countries: Country[] = [];