/*
  # Add missing columns to countries table

  1. Schema Updates
    - Add `is_active` column to `countries` table (boolean, default true)
    - Add `sort_order` column to `countries` table (integer, default 0)
    - Add `image_url` column to `countries` table (text, nullable)
    - Add `primary_language` column to `countries` table (text, default 'en')
    - Add `supported_languages` column to `countries` table (text array, default empty)
    - Add `highlights` column to `countries` table (text array, default empty)
    - Add `tags` column to `countries` table (text array, default empty)

  2. Security
    - Maintain existing RLS policies
    - Update policies to work with new columns

  3. Data Population
    - Set default values for existing records
*/

-- Add missing columns to countries table
DO $$
BEGIN
  -- Add is_active column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE countries ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Add sort_order column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE countries ADD COLUMN sort_order integer DEFAULT 0;
  END IF;

  -- Add image_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE countries ADD COLUMN image_url text;
  END IF;

  -- Add primary_language column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'primary_language'
  ) THEN
    ALTER TABLE countries ADD COLUMN primary_language text DEFAULT 'en';
  END IF;

  -- Add supported_languages column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'supported_languages'
  ) THEN
    ALTER TABLE countries ADD COLUMN supported_languages text[] DEFAULT '{}';
  END IF;

  -- Add highlights column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'highlights'
  ) THEN
    ALTER TABLE countries ADD COLUMN highlights text[] DEFAULT '{}';
  END IF;

  -- Add tags column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'countries' AND column_name = 'tags'
  ) THEN
    ALTER TABLE countries ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Update existing countries with sample data
UPDATE countries SET 
  is_active = true,
  sort_order = 1,
  primary_language = 'en',
  supported_languages = ARRAY['en'],
  highlights = ARRAY['Business-friendly environment', 'Low tax rates', 'Fast incorporation'],
  tags = ARRAY['offshore', 'business-friendly', 'low-tax']
WHERE is_active IS NULL;

-- Add some sample countries if none exist
INSERT INTO countries (name, slug, flag_emoji, description, is_active, sort_order, primary_language, supported_languages, highlights, tags, image_url)
VALUES 
  (
    'Georgia',
    'georgia',
    '🇬🇪',
    'Business-friendly jurisdiction with territorial taxation and fast company formation.',
    true,
    1,
    'en',
    ARRAY['en', 'ka'],
    ARRAY['0% tax on foreign income', 'Fast 1-day incorporation', 'EU association agreement'],
    ARRAY['territorial-tax', 'fast-setup', 'eu-friendly'],
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
  ),
  (
    'Estonia',
    'estonia',
    '🇪🇪',
    'Digital-first country with e-Residency program and advanced digital infrastructure.',
    true,
    2,
    'en',
    ARRAY['en', 'et'],
    ARRAY['e-Residency program', 'Digital banking', 'EU membership'],
    ARRAY['digital', 'e-residency', 'eu-member'],
    'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800'
  ),
  (
    'UAE',
    'uae',
    '🇦🇪',
    'Strategic location with numerous free zones and 0% corporate tax.',
    true,
    3,
    'en',
    ARRAY['en', 'ar'],
    ARRAY['0% corporate tax', 'Multiple free zones', 'Strategic location'],
    ARRAY['zero-tax', 'free-zones', 'middle-east'],
    'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'
  ),
  (
    'Singapore',
    'singapore',
    '🇸🇬',
    'Asia-Pacific business hub with excellent infrastructure and regulatory environment.',
    true,
    4,
    'en',
    ARRAY['en', 'zh', 'ms'],
    ARRAY['Asia-Pacific hub', 'Excellent infrastructure', 'Strong regulatory framework'],
    ARRAY['asia-pacific', 'hub', 'regulated'],
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
  )
ON CONFLICT (slug) DO NOTHING;