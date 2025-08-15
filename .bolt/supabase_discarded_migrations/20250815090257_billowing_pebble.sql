/*
  # Add Missing Countries for Complete Display

  1. New Countries
    - Malta (🇲🇹)
    - Switzerland (🇨🇭) 
    - Portugal (🇵🇹)
    - Spain (🇪🇸)
    - Turkey (🇹🇷)
    - Germany (🇩🇪)
    - Panama (🇵🇦)
    - Montenegro (🇲🇪)
    - Cyprus (🇨🇾)
    - Ireland (🇮🇪)

  2. Features
    - Complete country information with highlights
    - Proper flag emojis and descriptions
    - Business-friendly features and advantages
    - Proper sort order for display

  3. Data Integrity
    - All countries marked as active
    - Proper language support
    - Business advantages highlighted
*/

-- Insert Malta
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language, 
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Malta',
  'malta',
  '🇲🇹',
  'EU member state with attractive tax incentives and strategic Mediterranean location for international business.',
  'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
  'en',
  ARRAY['en', 'mt'],
  ARRAY['EU membership benefits', '5% corporate tax rate', 'Strategic Mediterranean location'],
  ARRAY['EU Access', 'Tax Friendly', 'Financial Services'],
  true,
  5
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Switzerland
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Switzerland',
  'switzerland',
  '🇨🇭',
  'Global financial hub with political stability, strong banking sector, and favorable business environment.',
  'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=800',
  'de',
  ARRAY['de', 'fr', 'it', 'en'],
  ARRAY['Political stability', 'Strong banking sector', 'Innovation hub'],
  ARRAY['Financial Hub', 'Stable Economy', 'Innovation'],
  true,
  6
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Portugal
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Portugal',
  'portugal',
  '🇵🇹',
  'EU member with Golden Visa program, competitive tax rates, and excellent quality of life for entrepreneurs.',
  'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
  'pt',
  ARRAY['pt', 'en'],
  ARRAY['Golden Visa program', 'NHR tax regime', 'EU market access'],
  ARRAY['EU Access', 'Golden Visa', 'Tax Benefits'],
  true,
  7
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Spain
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Spain',
  'spain',
  '🇪🇸',
  'Large EU market with diverse business opportunities, competitive costs, and strategic location between Europe and Africa.',
  'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800',
  'es',
  ARRAY['es', 'en'],
  ARRAY['Large EU market', 'Strategic location', 'Competitive business costs'],
  ARRAY['EU Access', 'Large Market', 'Strategic Location'],
  true,
  8
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Turkey
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Turkey',
  'turkey',
  '🇹🇷',
  'Bridge between Europe and Asia with growing economy, young population, and strategic geographic position.',
  'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=800',
  'tr',
  ARRAY['tr', 'en'],
  ARRAY['Bridge between continents', 'Growing economy', 'Young population'],
  ARRAY['Strategic Location', 'Growing Market', 'Young Demographics'],
  true,
  9
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Germany
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Germany',
  'germany',
  '🇩🇪',
  'Europe''s largest economy with strong industrial base, excellent infrastructure, and access to EU single market.',
  'https://images.pexels.com/photos/161901/pexels-photo-161901.jpeg?auto=compress&cs=tinysrgb&w=800',
  'de',
  ARRAY['de', 'en'],
  ARRAY['Largest EU economy', 'Strong industrial base', 'Excellent infrastructure'],
  ARRAY['EU Access', 'Industrial Hub', 'Strong Economy'],
  true,
  10
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Panama
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Panama',
  'panama',
  '🇵🇦',
  'Strategic location connecting Americas with territorial tax system and strong banking sector.',
  'https://images.pexels.com/photos/3225530/pexels-photo-3225530.jpeg?auto=compress&cs=tinysrgb&w=800',
  'es',
  ARRAY['es', 'en'],
  ARRAY['Territorial tax system', 'Strategic location', 'Strong banking sector'],
  ARRAY['Tax Benefits', 'Strategic Location', 'Banking Hub'],
  true,
  11
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Montenegro
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Montenegro',
  'montenegro',
  '🇲🇪',
  'Emerging European destination with EU candidacy, competitive tax rates, and beautiful Mediterranean coastline.',
  'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800',
  'me',
  ARRAY['me', 'en'],
  ARRAY['EU candidate status', 'Competitive tax rates', 'Mediterranean location'],
  ARRAY['EU Candidate', 'Tax Friendly', 'Emerging Market'],
  true,
  12
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Cyprus
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Cyprus',
  'cyprus',
  '🇨🇾',
  'EU member with attractive tax regime, strategic location, and strong professional services sector.',
  'https://images.pexels.com/photos/2901215/pexels-photo-2901215.jpeg?auto=compress&cs=tinysrgb&w=800',
  'el',
  ARRAY['el', 'en'],
  ARRAY['EU membership', 'Attractive tax regime', 'Professional services hub'],
  ARRAY['EU Access', 'Tax Benefits', 'Professional Services'],
  true,
  13
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;

-- Insert Ireland
INSERT INTO countries (
  name, slug, flag_emoji, description, image_url, primary_language,
  supported_languages, highlights, tags, is_active, sort_order
) VALUES (
  'Ireland',
  'ireland',
  '🇮🇪',
  'EU member with 12.5% corporate tax rate, English-speaking environment, and strong tech sector presence.',
  'https://images.pexels.com/photos/2416653/pexels-photo-2416653.jpeg?auto=compress&cs=tinysrgb&w=800',
  'en',
  ARRAY['en', 'ga'],
  ARRAY['12.5% corporate tax', 'English-speaking', 'Tech sector hub'],
  ARRAY['EU Access', 'Low Tax', 'Tech Hub'],
  true,
  14
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = true;