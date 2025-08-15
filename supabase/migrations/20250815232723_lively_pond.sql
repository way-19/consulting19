/*
  # Add Missing Countries to Platform

  This migration adds the missing countries from the initial country list:
  - USA (United States)
  - Montenegro 
  - Panama

  1. New Countries
    - `USA` - United States with business-friendly Delaware and Wyoming jurisdictions
    - `Montenegro` - European country with attractive business environment
    - `Panama` - Strategic location for international business

  2. Features
    - All countries set as active (is_active = true)
    - Proper flag emojis and descriptions
    - Business-focused highlights and tags
    - English as primary language with multi-language support

  3. Important Notes
    - These countries complete the initial 10-country list
    - All existing countries remain unchanged
    - Only adds missing countries, does not modify existing ones
*/

-- Add USA (United States)
INSERT INTO countries (
  id,
  name,
  slug,
  flag_emoji,
  description,
  image_url,
  primary_language,
  supported_languages,
  highlights,
  tags,
  is_active,
  sort_order
) VALUES (
  gen_random_uuid(),
  'USA',
  'usa',
  '🇺🇸',
  'World''s largest economy with business-friendly states like Delaware and Wyoming. Access to global markets, strong legal framework, and diverse business opportunities.',
  NULL,
  'en',
  ARRAY['en', 'es'],
  ARRAY['World''s largest economy', 'Delaware incorporation benefits', 'Strong legal framework', 'Global market access'],
  ARRAY['Large Economy', 'Business Friendly', 'Global Access', 'Strong Legal System'],
  true,
  2
) ON CONFLICT (slug) DO NOTHING;

-- Add Montenegro
INSERT INTO countries (
  id,
  name,
  slug,
  flag_emoji,
  description,
  image_url,
  primary_language,
  supported_languages,
  highlights,
  tags,
  is_active,
  sort_order
) VALUES (
  gen_random_uuid(),
  'Montenegro',
  'montenegro',
  '🇲🇪',
  'European country with attractive business environment, EU candidate status, and strategic Adriatic location. Growing economy with business-friendly policies.',
  NULL,
  'en',
  ARRAY['en', 'sr', 'hr'],
  ARRAY['EU candidate status', 'Adriatic location', 'Growing economy', 'Business-friendly policies'],
  ARRAY['EU Candidate', 'Adriatic Coast', 'Growing Market', 'Strategic Location'],
  true,
  4
) ON CONFLICT (slug) DO NOTHING;

-- Add Panama
INSERT INTO countries (
  id,
  name,
  slug,
  flag_emoji,
  description,
  image_url,
  primary_language,
  supported_languages,
  highlights,
  tags,
  is_active,
  sort_order
) VALUES (
  gen_random_uuid(),
  'Panama',
  'panama',
  '🇵🇦',
  'Strategic location connecting North and South America. Strong banking sector, territorial tax system, and excellent business infrastructure for international trade.',
  NULL,
  'es',
  ARRAY['es', 'en'],
  ARRAY['Strategic Americas location', 'Strong banking sector', 'Territorial taxation', 'International trade hub'],
  ARRAY['Strategic Location', 'Banking Hub', 'Tax Benefits', 'Trade Center'],
  true,
  8
) ON CONFLICT (slug) DO NOTHING;