```sql
DO $$
DECLARE
    georgia_country_id UUID;
BEGIN
    -- Get the ID for Georgia
    SELECT id INTO georgia_country_id FROM public.countries WHERE slug = 'georgia';

    -- Insert FAQ entries with ON CONFLICT DO NOTHING
    INSERT INTO public.faqs (id, question, answer, category, language_code, sort_order, is_active, created_at, updated_at, country_id)
    VALUES
    (gen_random_uuid(), 'How long does it take to register a company in Georgia?', 'Company registration in Georgia typically takes 1-2 business days once all required documents are submitted and verified.', 'Company Formation', 'en', 10, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'What are the tax benefits of Georgian companies?', 'Georgia offers a territorial tax system, meaning foreign-sourced income is generally exempt from corporate income tax. Additionally, there is a 0% tax on retained earnings for certain company types.', 'Tax & Accounting', 'en', 20, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'Can non-residents open bank accounts in Georgia?', 'Yes, non-residents can open both personal and corporate bank accounts in Georgia. The process can often be done remotely with proper documentation and due diligence.', 'Banking', 'en', 30, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'What is the minimum share capital required for a Georgian LLC?', 'The minimum share capital requirement for a Limited Liability Company (LLC) in Georgia is 1 GEL, which is a symbolic amount.', 'Company Formation', 'en', 40, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'Do I need to visit Georgia to start a business?', 'No, it is generally possible to register a company and open a bank account in Georgia remotely, without the need for a physical visit, through a power of attorney.', 'Company Formation', 'en', 50, TRUE, NOW(), NOW(), georgia_country_id)
    ON CONFLICT (question, language_code, country_id) DO NOTHING;
END $$;
```