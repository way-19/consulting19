/*
  # Update existing Georgia FAQs only - no new inserts

  1. Updates
    - Update existing Georgia FAQs with comprehensive answers
    - No INSERT operations to avoid duplicate key errors
    - Only UPDATE existing records

  2. Safety
    - Uses UPDATE only, no INSERT
    - Checks for Georgia country existence
    - Updates timestamp automatically
*/

DO $$
DECLARE
    georgia_country_id uuid;
    updated_count integer := 0;
    total_updated integer := 0;
BEGIN
    -- Get Georgia country ID
    SELECT id INTO georgia_country_id 
    FROM countries 
    WHERE slug = 'georgia' 
    LIMIT 1;
    
    IF georgia_country_id IS NULL THEN
        RAISE EXCEPTION 'Georgia country not found in database';
    END IF;
    
    RAISE NOTICE 'Found Georgia country with ID: %', georgia_country_id;
    
    -- Update FAQ 1: Company registration timeline
    UPDATE faqs SET 
        answer = 'Company registration in Georgia typically takes 3-5 business days. The process includes: 1) Name reservation (1 day), 2) Document preparation (1-2 days), 3) Registration filing at House of Justice (1-2 days). Our consultants handle all paperwork and ensure fast processing. You can track progress through our platform and receive real-time updates.',
        category = 'Company Formation',
        sort_order = 1,
        is_active = true,
        updated_at = now()
    WHERE question = 'How long does it take to register a company in Georgia?' 
    AND language_code = 'en' 
    AND country_id = georgia_country_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_updated := total_updated + updated_count;
    RAISE NOTICE 'Updated FAQ 1 (Company registration): % rows', updated_count;
    
    -- Update FAQ 2: Tax advantages
    UPDATE faqs SET 
        answer = 'Georgia offers exceptional tax benefits: 1) 0% tax on foreign-sourced income, 2) Small Business Status with 1% turnover tax (up to 500,000 GEL), 3) Territorial taxation system, 4) No withholding tax on dividends, 5) Free economic zones with additional benefits. Our tax specialists help optimize your structure for maximum savings.',
        category = 'Tax & Accounting',
        sort_order = 2,
        is_active = true,
        updated_at = now()
    WHERE question = 'What are the tax advantages of Georgian companies?' 
    AND language_code = 'en' 
    AND country_id = georgia_country_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_updated := total_updated + updated_count;
    RAISE NOTICE 'Updated FAQ 2 (Tax advantages): % rows', updated_count;
    
    -- Update FAQ 3: Banking for non-residents
    UPDATE faqs SET 
        answer = 'Yes! Non-residents can open both personal and business bank accounts in Georgia. Requirements include: 1) Valid passport, 2) Proof of address, 3) Income verification, 4) Minimum deposit (varies by bank). We assist with bank selection, document preparation, and account opening process. Most accounts are opened within 5-10 business days.',
        category = 'Banking',
        sort_order = 3,
        is_active = true,
        updated_at = now()
    WHERE question = 'Can non-residents open bank accounts in Georgia?' 
    AND language_code = 'en' 
    AND country_id = georgia_country_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_updated := total_updated + updated_count;
    RAISE NOTICE 'Updated FAQ 3 (Banking): % rows', updated_count;
    
    -- Update FAQ 4: Remote business setup
    UPDATE faqs SET 
        answer = 'No physical visit is required! Georgia allows 100% remote company formation. Our process includes: 1) Online consultation, 2) Digital document signing, 3) Remote registration, 4) Virtual office services. However, visiting Georgia can be beneficial for banking and building local relationships. We offer both remote and in-person support options.',
        category = 'Company Formation',
        sort_order = 4,
        is_active = true,
        updated_at = now()
    WHERE question = 'Do I need to visit Georgia to start a business?' 
    AND language_code = 'en' 
    AND country_id = georgia_country_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_updated := total_updated + updated_count;
    RAISE NOTICE 'Updated FAQ 4 (Remote setup): % rows', updated_count;
    
    -- Update FAQ 5: Accounting services
    UPDATE faqs SET 
        answer = 'We offer comprehensive accounting services: 1) Monthly bookkeeping and financial statements, 2) Tax preparation and filing, 3) VAT registration and compliance, 4) Payroll processing, 5) Annual reporting, 6) Audit support, 7) Financial advisory. Our certified accountants ensure full compliance with Georgian regulations and provide strategic financial guidance.',
        category = 'Tax & Accounting',
        sort_order = 5,
        is_active = true,
        updated_at = now()
    WHERE question = 'What accounting services do you provide for Georgian companies?' 
    AND language_code = 'en' 
    AND country_id = georgia_country_id;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    total_updated := total_updated + updated_count;
    RAISE NOTICE 'Updated FAQ 5 (Accounting): % rows', updated_count;
    
    RAISE NOTICE 'Georgia FAQs update completed. Total rows updated: %', total_updated;
    
END $$;