/*
  # Add Georgia FAQs

  1. New Data
    - Add 5 comprehensive FAQs for Georgia
    - Cover company formation, banking, tax, visa, and accounting topics
    - Set proper sort order and language

  2. Integration
    - FAQs will appear on Georgia country detail page
    - Consultant can manage these through country management panel
    - Multi-language support ready
*/

-- Insert 5 comprehensive FAQs for Georgia
INSERT INTO faqs (
  question,
  answer,
  category,
  language_code,
  sort_order,
  is_active,
  country_id
) VALUES 
(
  'How long does it take to register a company in Georgia?',
  'Company registration in Georgia typically takes 3-5 business days through our streamlined process. We handle all documentation, name reservation, and registration with the House of Justice. The process includes: 1) Company structure planning and name reservation (1 day), 2) Document preparation and legal review (1-2 days), 3) Official registration filing (1-2 days). Once completed, you receive your registration certificate, tax number, and can proceed with bank account opening.',
  'Company Formation',
  'en',
  1,
  true,
  (SELECT id FROM countries WHERE slug = 'georgia' LIMIT 1)
),
(
  'What are the tax advantages of Georgian companies?',
  'Georgia offers one of the world''s most attractive tax systems: 1) 0% tax on foreign-sourced income for individuals, 2) Small Business Status allows 0% tax on retained earnings (only pay 20% when distributing profits), 3) No withholding tax on dividends to non-residents, 4) Territorial taxation principle, 5) Simple tax compliance with minimal reporting requirements. This makes Georgia ideal for international businesses and digital nomads.',
  'Tax & Accounting',
  'en',
  2,
  true,
  (SELECT id FROM countries WHERE slug = 'georgia' LIMIT 1)
),
(
  'Can non-residents open bank accounts in Georgia?',
  'Yes! Non-residents can open both personal and business bank accounts in Georgia. Requirements include: 1) Valid passport and proof of address, 2) Income verification or business registration documents, 3) Initial deposit (varies by bank, typically $100-500), 4) Bank interview (can be done remotely for some banks). We assist with bank selection, document preparation, and the entire application process. Most accounts are opened within 5-10 business days.',
  'Banking',
  'en',
  3,
  true,
  (SELECT id FROM countries WHERE slug = 'georgia' LIMIT 1)
),
(
  'Do I need to visit Georgia to start a business?',
  'No, you don''t need to visit Georgia to start a business! Our remote company formation service handles everything online: 1) All documents can be signed electronically or via apostilled power of attorney, 2) We provide registered address service, 3) Bank accounts can often be opened remotely, 4) Tax registration is handled digitally. However, visiting Georgia can be beneficial for banking relationships and business networking. We offer both remote and in-person support options.',
  'Company Formation',
  'en',
  4,
  true,
  (SELECT id FROM countries WHERE slug = 'georgia' LIMIT 1)
),
(
  'What ongoing accounting services do you provide in Georgia?',
  'Our comprehensive accounting services include: 1) Monthly bookkeeping and transaction recording, 2) VAT and tax return preparation and filing, 3) Financial statement preparation, 4) Payroll processing for employees, 5) Compliance monitoring and deadline management, 6) Management reporting and financial analysis, 7) Audit support and documentation, 8) Tax optimization advice. We use cloud-based accounting software for real-time access and maintain full compliance with Georgian accounting standards.',
  'Tax & Accounting',
  'en',
  5,
  true,
  (SELECT id FROM countries WHERE slug = 'georgia' LIMIT 1)
);