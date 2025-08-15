```sql
-- Corrected SQL for adding sample FAQs for Georgia
-- This file should be run in your Supabase Dashboard's SQL Editor.

-- Ensure the country_id for Georgia exists.
-- If you already have Georgia with a different ID, please update the UUIDs below.
-- The UUID for Georgia is assumed to be 'daa4ee01-54d6-431e-8a31-b8d99370963b' based on previous context.

DO $$
DECLARE
    georgia_country_id UUID := 'daa4ee01-54d6-431e-8a31-b8d99370963b';
BEGIN
    -- Check if Georgia country exists, if not, create it (or use an existing one)
    IF NOT EXISTS (SELECT 1 FROM public.countries WHERE id = georgia_country_id) THEN
        INSERT INTO public.countries (id, name, slug, flag_emoji, description, primary_language, supported_languages, highlights, tags, is_active, sort_order, created_at, updated_at)
        VALUES (
            georgia_country_id,
            'Georgia',
            'georgia',
            '🇬🇪',
            'Strategic gateway between Europe and Asia with exceptional business opportunities.',
            'en',
            ARRAY['en', 'ka', 'ru'],
            ARRAY['0% tax on foreign sourced income', 'Easy company formation', 'Fast bank account opening'],
            ARRAY['tax', 'company formation', 'banking', 'europe', 'asia'],
            TRUE,
            1,
            NOW(),
            NOW()
        );
    END IF;

    -- Insert sample FAQs for Georgia if they don't already exist
    INSERT INTO public.faqs (id, question, answer, category, language_code, sort_order, is_active, created_at, updated_at, country_id)
    VALUES
    (gen_random_uuid(), 'How long does it take to register a company in Georgia?', 'Company registration in Georgia typically takes 1-2 business days once all required documents are submitted and verified.', 'Company Formation', 'en', 10, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'What are the tax benefits of Georgian companies?', 'Georgia offers a territorial tax system, meaning foreign-sourced income is generally exempt from corporate income tax. Additionally, there is a 0% tax on retained earnings for certain company types.', 'Tax & Accounting', 'en', 20, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'Can non-residents open bank accounts in Georgia?', 'Yes, non-residents can open both personal and corporate bank accounts in Georgia. The process can often be done remotely with proper documentation and due diligence.', 'Banking', 'en', 30, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'What is the minimum share capital required for a Georgian LLC?', 'The minimum share capital requirement for a Limited Liability Company (LLC) in Georgia is 1 GEL, which is a symbolic amount.', 'Company Formation', 'en', 40, TRUE, NOW(), NOW(), georgia_country_id),
    (gen_random_uuid(), 'Do I need to visit Georgia to start a business?', 'No, it is generally possible to register a company and open a bank account in Georgia remotely, without the need for a physical visit, through a power of attorney.', 'Company Formation', 'en', 50, TRUE, NOW(), NOW(), georgia_country_id)
    ON CONFLICT (question, language_code, country_id) DO NOTHING; -- Prevent duplicate inserts if run multiple times
END $$;
```