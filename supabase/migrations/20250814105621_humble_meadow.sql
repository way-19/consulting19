/*
  # İçerik Yönetimi Tabloları

  1. Yeni Tablolar
    - `static_pages` - Statik sayfa içerikleri (Hakkımızda, Gizlilik Politikası vb.)
    - `page_translations` - Çok dilli içerik çevirileri
    - `content_categories` - İçerik kategorileri
    - `media_library` - Medya dosyaları yönetimi

  2. Güvenlik
    - Tüm tablolarda RLS etkin
    - Sadece adminler içerik yönetebilir
    - Herkes yayınlanmış içerikleri okuyabilir

  3. Özellikler
    - Çok dilli destek
    - SEO optimizasyonu
    - Medya yönetimi
    - İçerik versiyonlama
*/

-- Static Pages Table
CREATE TABLE IF NOT EXISTS static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  meta_title text,
  meta_description text,
  language_code text DEFAULT 'en' NOT NULL,
  is_published boolean DEFAULT false,
  template_type text DEFAULT 'default',
  featured_image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Page Translations Table
CREATE TABLE IF NOT EXISTS page_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES static_pages(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  meta_title text,
  meta_description text,
  is_published boolean DEFAULT false,
  translator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_id, language_code)
);

-- Content Categories Table
CREATE TABLE IF NOT EXISTS content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  icon text DEFAULT 'FileText',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media Library Table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_url text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  alt_text text,
  caption text,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  folder text DEFAULT 'general',
  is_public boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Content Templates Table
CREATE TABLE IF NOT EXISTS content_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_html text NOT NULL,
  template_variables jsonb DEFAULT '[]',
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for static_pages
CREATE POLICY "Admins can manage all pages"
  ON static_pages
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Public can read published pages"
  ON static_pages
  FOR SELECT
  TO public
  USING (is_published = true);

-- RLS Policies for page_translations
CREATE POLICY "Admins can manage all translations"
  ON page_translations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Public can read published translations"
  ON page_translations
  FOR SELECT
  TO public
  USING (is_published = true);

-- RLS Policies for content_categories
CREATE POLICY "Admins can manage categories"
  ON content_categories
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Public can read active categories"
  ON content_categories
  FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for media_library
CREATE POLICY "Admins can manage all media"
  ON media_library
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Public can read public media"
  ON media_library
  FOR SELECT
  TO public
  USING (is_public = true);

-- RLS Policies for content_templates
CREATE POLICY "Admins can manage templates"
  ON content_templates
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = uid() AND profiles.role = 'admin'
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_language ON static_pages(language_code);
CREATE INDEX IF NOT EXISTS idx_static_pages_published ON static_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_page_translations_page_id ON page_translations(page_id);
CREATE INDEX IF NOT EXISTS idx_page_translations_language ON page_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_mime_type ON media_library(mime_type);

-- Triggers for updated_at
CREATE TRIGGER handle_static_pages_updated_at
  BEFORE UPDATE ON static_pages
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_page_translations_updated_at
  BEFORE UPDATE ON page_translations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_content_categories_updated_at
  BEFORE UPDATE ON content_categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_content_templates_updated_at
  BEFORE UPDATE ON content_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default content categories
INSERT INTO content_categories (name, slug, description, color, icon, sort_order) VALUES
  ('Legal Pages', 'legal', 'Terms, Privacy Policy, Legal Documents', '#ef4444', 'Scale', 1),
  ('Company Info', 'company', 'About Us, Team, History', '#3b82f6', 'Building', 2),
  ('Help & Support', 'help', 'FAQ, Help Center, Guides', '#10b981', 'HelpCircle', 3),
  ('Marketing', 'marketing', 'Landing Pages, Campaigns', '#8b5cf6', 'Megaphone', 4),
  ('System', 'system', 'Error Pages, Maintenance', '#6b7280', 'Settings', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert default static pages
INSERT INTO static_pages (slug, title, content, language_code, is_published, template_type, author_id) VALUES
  ('terms-of-service', 'Terms of Service', 'Terms of Service content will be added here...', 'en', true, 'legal', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('privacy-policy', 'Privacy Policy', 'Privacy Policy content will be added here...', 'en', true, 'legal', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('about-us', 'About Us', 'About Us content will be added here...', 'en', true, 'company', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('contact-info', 'Contact Information', 'Contact information and support details...', 'en', true, 'company', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT (slug) DO NOTHING;

-- Insert default content templates
INSERT INTO content_templates (name, description, template_html, template_variables, category) VALUES
  ('Legal Page Template', 'Standard template for legal pages', 
   '<div class="max-w-4xl mx-auto py-16 px-4"><h1 class="text-4xl font-bold mb-8">{{title}}</h1><div class="prose prose-lg">{{content}}</div></div>',
   '["title", "content"]', 'legal'),
  ('Company Page Template', 'Template for company information pages',
   '<div class="max-w-6xl mx-auto py-16 px-4"><div class="text-center mb-12"><h1 class="text-5xl font-bold mb-4">{{title}}</h1><p class="text-xl text-gray-600">{{subtitle}}</p></div><div class="prose prose-lg mx-auto">{{content}}</div></div>',
   '["title", "subtitle", "content"]', 'company')
ON CONFLICT (name) DO NOTHING;