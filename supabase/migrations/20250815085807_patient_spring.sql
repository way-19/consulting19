/*
  # Add More Countries to Database

  1. New Countries
    - Add 6 more countries to reach 10+ total
    - Include proper flag emojis, descriptions, and highlights
    - Set appropriate sort orders for display

  2. Country Data
    - Malta, Switzerland, Portugal, Spain, Turkey, Germany
    - Each with business-friendly descriptions
    - Proper language support and highlights
*/

-- Insert additional countries
INSERT INTO public.countries (
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
  sort_order,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  'Malta',
  'malta',
  '🇲🇹',
  'EU member state with attractive tax incentives and strategic Mediterranean location for international business.',
  NULL,
  'en',
  ARRAY['en', 'mt', 'it'],
  ARRAY['EU membership benefits', '5% corporate tax rate', 'Strategic Mediterranean location', 'English-speaking jurisdiction'],
  ARRAY['EU', 'Tax Friendly', 'English Speaking', 'Mediterranean'],
  TRUE,
  50,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Switzerland',
  'switzerland',
  '🇨🇭',
  'World-renowned financial center with political stability, strong banking sector, and business-friendly environment.',
  NULL,
  'de',
  ARRAY['de', 'fr', 'it', 'en'],
  ARRAY['Political stability', 'Strong banking sector', 'Low corporate taxes', 'High quality of life'],
  ARRAY['Banking', 'Stable', 'Premium', 'Finance'],
  TRUE,
  60,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Portugal',
  'portugal',
  '🇵🇹',
  'EU member with attractive Golden Visa program, competitive tax rates, and growing tech ecosystem.',
  NULL,
  'pt',
  ARRAY['pt', 'en'],
  ARRAY['Golden Visa program', 'NHR tax regime', 'EU membership', 'Growing tech hub'],
  ARRAY['EU', 'Golden Visa', 'Tech Hub', 'Tax Benefits'],
  TRUE,
  70,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Spain',
  'spain',
  '🇪🇸',
  'Large EU market with diverse economy, strong infrastructure, and attractive investment opportunities.',
  NULL,
  'es',
  ARRAY['es', 'en'],
  ARRAY['Large EU market', 'Diverse economy', 'Strong infrastructure', 'Investment opportunities'],
  ARRAY['EU', 'Large Market', 'Infrastructure', 'Investment'],
  TRUE,
  80,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Turkey',
  'turkey',
  '🇹🇷',
  'Strategic bridge between Europe and Asia with growing economy and competitive business costs.',
  NULL,
  'tr',
  ARRAY['tr', 'en'],
  ARRAY['Europe-Asia bridge', 'Growing economy', 'Competitive costs', 'Strategic location'],
  ARRAY['Strategic', 'Growing', 'Bridge', 'Competitive'],
  TRUE,
  90,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Germany',
  'germany',
  '🇩🇪',
  'Europe largest economy with strong industrial base, excellent infrastructure, and central EU location.',
  NULL,
  'de',
  ARRAY['de', 'en'],
  ARRAY['Largest EU economy', 'Strong industrial base', 'Excellent infrastructure', 'Central location'],
  ARRAY['EU', 'Industrial', 'Infrastructure', 'Central'],
  TRUE,
  100,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  primary_language = EXCLUDED.primary_language,
  supported_languages = EXCLUDED.supported_languages,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();