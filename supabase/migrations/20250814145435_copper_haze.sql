/*
  # Setup Consultant Country Assignments

  1. Assignments
    - Assign Georgia consultant to Georgia country
    - Create sample countries if they don't exist
    - Ensure proper consultant-country relationships

  2. Sample Content
    - Add sample blog posts for Georgia
    - Add sample FAQs for Georgia
    - Ensure content is properly linked to countries
*/

-- First, ensure we have Georgia country
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
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'Georgia',
  'georgia',
  '🇬🇪',
  'Strategic gateway between Europe and Asia with exceptional business opportunities and tax advantages.',
  'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800',
  'ka',
  ARRAY['ka', 'en', 'ru'],
  ARRAY[
    'Easy company formation process',
    '0% tax on foreign sourced income',
    'Free economic zones available',
    'Strategic location between Europe and Asia',
    'Business-friendly regulations'
  ],
  ARRAY['Tax Friendly', 'Strategic Location', 'Easy Setup', 'EU Association'],
  true,
  1
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  primary_language = EXCLUDED.primary_language,
  supported_languages = EXCLUDED.supported_languages,
  highlights = EXCLUDED.highlights,
  tags = EXCLUDED.tags,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Get Georgia consultant ID (georgia@consulting19.com)
DO $$
DECLARE
    georgia_consultant_id uuid;
    georgia_country_id uuid;
BEGIN
    -- Get consultant ID
    SELECT id INTO georgia_consultant_id 
    FROM profiles 
    WHERE email = 'georgia@consulting19.com' 
    LIMIT 1;
    
    -- Get Georgia country ID
    SELECT id INTO georgia_country_id 
    FROM countries 
    WHERE slug = 'georgia' 
    LIMIT 1;
    
    -- Create assignment if both exist
    IF georgia_consultant_id IS NOT NULL AND georgia_country_id IS NOT NULL THEN
        INSERT INTO consultant_country_assignments (
            consultant_id,
            country_id,
            is_primary,
            status
        ) VALUES (
            georgia_consultant_id,
            georgia_country_id,
            true,
            'active'
        ) ON CONFLICT (consultant_id, country_id) DO UPDATE SET
            is_primary = EXCLUDED.is_primary,
            status = EXCLUDED.status;
            
        RAISE NOTICE 'Assigned consultant % to country %', georgia_consultant_id, georgia_country_id;
    ELSE
        RAISE NOTICE 'Could not find consultant or country. Consultant: %, Country: %', georgia_consultant_id, georgia_country_id;
    END IF;
END $$;

-- Add sample blog posts for Georgia
INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  author_id,
  category,
  tags,
  language_code,
  is_published,
  published_at,
  featured_image_url,
  seo_title,
  seo_description
) VALUES 
(
  'Why Georgia is Perfect for Tech Startups',
  'georgia-tech-startups-2024',
  'Georgia has emerged as one of the most attractive destinations for tech startups in 2024. With its strategic location, business-friendly regulations, and attractive tax system, Georgia offers unique advantages for technology companies looking to establish their presence in the region.',
  'Discover why Georgia is becoming the go-to destination for tech startups in 2024.',
  (SELECT id FROM profiles WHERE email = 'georgia@consulting19.com' LIMIT 1),
  'Business Insights',
  ARRAY['Tech Startups', 'Georgia', 'Tax Benefits', 'Business Formation'],
  'en',
  true,
  now(),
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Georgia Tech Startups 2024 - Complete Guide',
  'Complete guide to starting a tech company in Georgia. Tax benefits, regulations, and step-by-step process.'
),
(
  'Georgian Banking System for International Businesses',
  'georgia-banking-international-business',
  'The Georgian banking system offers excellent opportunities for international businesses. With modern infrastructure, competitive rates, and business-friendly policies, Georgian banks provide comprehensive services for both residents and non-residents.',
  'Learn about Georgian banking opportunities for international businesses.',
  (SELECT id FROM profiles WHERE email = 'georgia@consulting19.com' LIMIT 1),
  'Banking',
  ARRAY['Banking', 'Georgia', 'International Business', 'Financial Services'],
  'en',
  true,
  now(),
  'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Georgian Banking for International Business',
  'Comprehensive guide to Georgian banking system for international businesses and entrepreneurs.'
) ON CONFLICT (slug, language_code) DO NOTHING;

-- Add sample FAQs for Georgia
INSERT INTO faqs (
  question,
  answer,
  category,
  language_code,
  sort_order,
  is_active
) VALUES 
(
  'How long does it take to register a company in Georgia?',
  'Company registration in Georgia typically takes 3-5 business days. Our streamlined process ensures quick and efficient registration with all necessary documentation.',
  'Company Formation',
  'en',
  1,
  true
),
(
  'What are the tax advantages of Georgian companies?',
  'Georgian companies benefit from 0% tax on foreign-sourced income, territorial taxation system, and various tax incentives for small businesses and startups.',
  'Tax & Accounting',
  'en',
  2,
  true
),
(
  'Can non-residents open bank accounts in Georgia?',
  'Yes, non-residents can open both personal and business bank accounts in Georgia. The process requires proper documentation and typically takes 5-10 business days.',
  'Banking',
  'en',
  3,
  true
),
(
  'What is the minimum share capital required for Georgian LLC?',
  'The minimum share capital for a Georgian LLC is just 1 GEL (Georgian Lari), making it one of the most accessible jurisdictions for company formation.',
  'Company Formation',
  'en',
  4,
  true
),
(
  'Do I need to visit Georgia to start a business?',
  'No, you can register a company in Georgia remotely. Our consultants handle the entire process online, though visiting can be beneficial for banking and business development.',
  'General',
  'en',
  5,
  true
) ON CONFLICT (question, language_code) DO NOTHING;