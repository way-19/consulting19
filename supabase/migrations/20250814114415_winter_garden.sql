/*
  # Multilingual Support System

  1. New Tables
    - `translations`
      - `id` (uuid, primary key)
      - `key` (text, translation key)
      - `language_code` (text, language identifier)
      - `value` (text, translated content)
      - `category` (text, grouping category)
      - `is_active` (boolean, active status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, post title)
      - `slug` (text, URL slug)
      - `content` (text, post content)
      - `excerpt` (text, brief description)
      - `author_id` (uuid, author reference)
      - `category` (text, post category)
      - `tags` (text array, post tags)
      - `language_code` (text, content language)
      - `is_published` (boolean, publication status)
      - `published_at` (timestamp, publication date)
      - `featured_image_url` (text, image URL)
      - `seo_title` (text, SEO title)
      - `seo_description` (text, SEO description)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `faqs`
      - `id` (uuid, primary key)
      - `question` (text, FAQ question)
      - `answer` (text, FAQ answer)
      - `category` (text, FAQ category)
      - `language_code` (text, content language)
      - `sort_order` (integer, display order)
      - `is_active` (boolean, active status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin management
    - Add policies for public read access where appropriate

  3. Indexes
    - Add indexes for performance optimization
    - Language code indexes for filtering
    - Search indexes for content discovery
*/

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  language_code text NOT NULL,
  value text NOT NULL,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(key, language_code)
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text,
  tags text[] DEFAULT '{}',
  language_code text DEFAULT 'en',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  featured_image_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slug, language_code)
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  language_code text DEFAULT 'en',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Translations policies
CREATE POLICY "Admins can manage all translations"
  ON translations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can read active translations"
  ON translations
  FOR SELECT
  TO public
  USING (is_active = true);

-- Blog posts policies
CREATE POLICY "Admins can manage all blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authors can manage their own posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Public can read published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (is_published = true);

-- FAQs policies
CREATE POLICY "Admins can manage all FAQs"
  ON faqs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Public can read active FAQs"
  ON faqs
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);
CREATE INDEX IF NOT EXISTS idx_translations_category ON translations(category);
CREATE INDEX IF NOT EXISTS idx_translations_active ON translations(is_active);

CREATE INDEX IF NOT EXISTS idx_blog_posts_language_code ON blog_posts(language_code);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_faqs_language_code ON faqs(language_code);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);

-- Add updated_at triggers
CREATE TRIGGER handle_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert default translations for English
INSERT INTO translations (key, language_code, value, category) VALUES
  -- Navigation
  ('nav.countries', 'en', 'Countries', 'navigation'),
  ('nav.services', 'en', 'Services', 'navigation'),
  ('nav.about', 'en', 'About Us', 'navigation'),
  ('nav.contact', 'en', 'Contact', 'navigation'),
  ('nav.blog', 'en', 'Blog', 'navigation'),
  ('nav.getStarted', 'en', 'Get Started', 'navigation'),
  ('nav.signIn', 'en', 'Sign In', 'navigation'),
  ('nav.signOut', 'en', 'Sign Out', 'navigation'),
  ('nav.chooseJurisdiction', 'en', 'Choose Your Jurisdiction', 'navigation'),
  ('nav.viewAllCountries', 'en', 'View All Countries', 'navigation'),
  
  -- Dashboard
  ('dashboard.welcome', 'en', 'Welcome back', 'dashboard'),
  ('dashboard.overview', 'en', 'Overview', 'dashboard'),
  ('dashboard.projects', 'en', 'Projects', 'dashboard'),
  ('dashboard.documents', 'en', 'Documents', 'dashboard'),
  ('dashboard.messages', 'en', 'Messages', 'dashboard'),
  ('dashboard.settings', 'en', 'Settings', 'dashboard'),
  
  -- Common
  ('common.loading', 'en', 'Loading...', 'common'),
  ('common.save', 'en', 'Save', 'common'),
  ('common.cancel', 'en', 'Cancel', 'common'),
  ('common.delete', 'en', 'Delete', 'common'),
  ('common.edit', 'en', 'Edit', 'common'),
  ('common.view', 'en', 'View', 'common'),
  ('common.search', 'en', 'Search', 'common'),
  ('common.filter', 'en', 'Filter', 'common'),
  ('common.refresh', 'en', 'Refresh', 'common'),
  ('common.download', 'en', 'Download', 'common'),
  ('common.upload', 'en', 'Upload', 'common'),
  ('common.send', 'en', 'Send', 'common'),
  ('common.back', 'en', 'Back', 'common'),
  ('common.next', 'en', 'Next', 'common'),
  ('common.previous', 'en', 'Previous', 'common'),
  ('common.close', 'en', 'Close', 'common'),
  ('common.confirm', 'en', 'Confirm', 'common'),
  ('common.yes', 'en', 'Yes', 'common'),
  ('common.no', 'en', 'No', 'common'),
  
  -- Status
  ('status.active', 'en', 'Active', 'status'),
  ('status.inactive', 'en', 'Inactive', 'status'),
  ('status.pending', 'en', 'Pending', 'status'),
  ('status.completed', 'en', 'Completed', 'status'),
  ('status.approved', 'en', 'Approved', 'status'),
  ('status.rejected', 'en', 'Rejected', 'status'),
  ('status.inProgress', 'en', 'In Progress', 'status'),
  ('status.onHold', 'en', 'On Hold', 'status'),
  ('status.cancelled', 'en', 'Cancelled', 'status'),
  
  -- Business
  ('business.companyFormation', 'en', 'Company Formation', 'business'),
  ('business.bankAccount', 'en', 'Bank Account Opening', 'business'),
  ('business.taxResidency', 'en', 'Tax Residency', 'business'),
  ('business.accounting', 'en', 'Accounting Services', 'business'),
  ('business.legal', 'en', 'Legal Consulting', 'business'),
  ('business.visa', 'en', 'Visa & Residence', 'business')
ON CONFLICT (key, language_code) DO NOTHING;

-- Insert Turkish translations
INSERT INTO translations (key, language_code, value, category) VALUES
  -- Navigation
  ('nav.countries', 'tr', 'Ülkeler', 'navigation'),
  ('nav.services', 'tr', 'Hizmetler', 'navigation'),
  ('nav.about', 'tr', 'Hakkımızda', 'navigation'),
  ('nav.contact', 'tr', 'İletişim', 'navigation'),
  ('nav.blog', 'tr', 'Blog', 'navigation'),
  ('nav.getStarted', 'tr', 'Başlayın', 'navigation'),
  ('nav.signIn', 'tr', 'Giriş Yap', 'navigation'),
  ('nav.signOut', 'tr', 'Çıkış Yap', 'navigation'),
  ('nav.chooseJurisdiction', 'tr', 'Yargı Alanınızı Seçin', 'navigation'),
  ('nav.viewAllCountries', 'tr', 'Tüm Ülkeleri Görüntüle', 'navigation'),
  
  -- Dashboard
  ('dashboard.welcome', 'tr', 'Tekrar hoş geldiniz', 'dashboard'),
  ('dashboard.overview', 'tr', 'Genel Bakış', 'dashboard'),
  ('dashboard.projects', 'tr', 'Projeler', 'dashboard'),
  ('dashboard.documents', 'tr', 'Belgeler', 'dashboard'),
  ('dashboard.messages', 'tr', 'Mesajlar', 'dashboard'),
  ('dashboard.settings', 'tr', 'Ayarlar', 'dashboard'),
  
  -- Business
  ('business.companyFormation', 'tr', 'Şirket Kuruluşu', 'business'),
  ('business.bankAccount', 'tr', 'Banka Hesabı Açma', 'business'),
  ('business.taxResidency', 'tr', 'Vergi Mukimliği', 'business'),
  ('business.accounting', 'tr', 'Muhasebe Hizmetleri', 'business'),
  ('business.legal', 'tr', 'Hukuki Danışmanlık', 'business'),
  ('business.visa', 'tr', 'Vize ve İkamet', 'business')
ON CONFLICT (key, language_code) DO NOTHING;

-- Insert Georgian translations
INSERT INTO translations (key, language_code, value, category) VALUES
  -- Navigation
  ('nav.countries', 'ka', 'ქვეყნები', 'navigation'),
  ('nav.services', 'ka', 'სერვისები', 'navigation'),
  ('nav.about', 'ka', 'ჩვენს შესახებ', 'navigation'),
  ('nav.contact', 'ka', 'კონტაქტი', 'navigation'),
  ('nav.blog', 'ka', 'ბლოგი', 'navigation'),
  ('nav.getStarted', 'ka', 'დაიწყეთ', 'navigation'),
  ('nav.signIn', 'ka', 'შესვლა', 'navigation'),
  ('nav.signOut', 'ka', 'გასვლა', 'navigation'),
  
  -- Business
  ('business.companyFormation', 'ka', 'კომპანიის რეგისტრაცია', 'business'),
  ('business.bankAccount', 'ka', 'ბანკის ანგარიშის გახსნა', 'business'),
  ('business.taxResidency', 'ka', 'საგადასახადო რეზიდენტობა', 'business'),
  ('business.accounting', 'ka', 'საბუღალტრო სერვისები', 'business'),
  ('business.legal', 'ka', 'იურიდიული კონსულტაცია', 'business'),
  ('business.visa', 'ka', 'ვიზა და რეზიდენტობა', 'business')
ON CONFLICT (key, language_code) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, content, excerpt, category, tags, language_code, is_published, published_at) VALUES
  (
    'New Investment Opportunities in Georgia 2024',
    'georgia-investment-opportunities-2024',
    'Georgia continues to attract international investors with its favorable business environment and strategic location between Europe and Asia. This comprehensive guide explores the latest investment opportunities and regulatory updates for 2024.',
    'Discover the latest investment opportunities in Georgia for 2024, including new regulations and business incentives.',
    'Market Updates',
    ARRAY['Georgia', 'Investment', 'Business', '2024'],
    'en',
    true,
    now()
  ),
  (
    'Understanding Estonian e-Residency Program',
    'estonia-e-residency-program-guide',
    'Estonia''s e-Residency program offers digital nomads and entrepreneurs the opportunity to access EU business environment digitally. Learn how to apply and benefit from this innovative program.',
    'Complete guide to Estonia''s e-Residency program for digital entrepreneurs and remote business owners.',
    'Country Spotlights',
    ARRAY['Estonia', 'e-Residency', 'Digital Nomad', 'EU'],
    'en',
    true,
    now()
  ),
  (
    'Tax Optimization Strategies for International Businesses',
    'international-tax-optimization-strategies',
    'Effective tax planning is crucial for international businesses. This article covers legal tax optimization strategies across different jurisdictions.',
    'Learn proven tax optimization strategies for international businesses operating across multiple jurisdictions.',
    'Tax Updates',
    ARRAY['Tax', 'International', 'Optimization', 'Legal'],
    'en',
    true,
    now()
  )
ON CONFLICT (slug, language_code) DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, language_code, sort_order, is_active) VALUES
  (
    'How long does it take to register a company in Georgia?',
    'Company registration in Georgia typically takes 3-5 business days. Our consultants handle all the paperwork and ensure a smooth process from start to finish.',
    'Company Formation',
    'en',
    1,
    true
  ),
  (
    'What are the tax advantages of Georgian companies?',
    'Georgian companies benefit from territorial taxation, meaning 0% tax on foreign-sourced income. Additionally, small business status allows for significant tax deferrals on reinvested profits.',
    'Company Formation',
    'en',
    2,
    true
  ),
  (
    'Can non-residents open bank accounts in Georgia?',
    'Yes, non-residents can open both personal and business bank accounts in Georgia. Our banking specialists assist with the entire process and help you choose the best bank for your needs.',
    'Banking',
    'en',
    3,
    true
  ),
  (
    'Do I need to visit Georgia to start a business?',
    'No, you can start a business in Georgia remotely. Our consultants handle all the paperwork and legal requirements. However, for banking, you may need to visit in person or use our power of attorney services.',
    'Company Formation',
    'en',
    4,
    true
  ),
  (
    'What documents are required for company registration?',
    'Required documents include passport copies, proof of address, company name options, business activity description, and shareholder information. Our consultants provide a complete checklist.',
    'Company Formation',
    'en',
    5,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert Turkish FAQs
INSERT INTO faqs (question, answer, category, language_code, sort_order, is_active) VALUES
  (
    'Gürcistan''da şirket kurmak ne kadar sürer?',
    'Gürcistan''da şirket kuruluşu genellikle 3-5 iş günü sürer. Danışmanlarımız tüm evrak işlerini halleder ve baştan sona sorunsuz bir süreç sağlar.',
    'Company Formation',
    'tr',
    1,
    true
  ),
  (
    'Gürcistan şirketlerinin vergi avantajları nelerdir?',
    'Gürcistan şirketleri teritoryal vergilendirmeden yararlanır, yani yurtdışı kaynaklı gelirler için %0 vergi. Ayrıca küçük işletme statüsü, yeniden yatırılan kârlar üzerinde önemli vergi ertelemeleri sağlar.',
    'Company Formation',
    'tr',
    2,
    true
  ),
  (
    'Yerleşik olmayanlar Gürcistan''da banka hesabı açabilir mi?',
    'Evet, yerleşik olmayanlar Gürcistan''da hem kişisel hem de ticari banka hesabı açabilir. Bankacılık uzmanlarımız tüm süreçte yardımcı olur ve ihtiyaçlarınıza en uygun bankayı seçmenize yardım eder.',
    'Banking',
    'tr',
    3,
    true
  )
ON CONFLICT DO NOTHING;