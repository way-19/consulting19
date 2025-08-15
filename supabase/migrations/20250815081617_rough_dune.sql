/*
  # Add Sample Blog Posts for Georgia

  1. New Blog Posts
    - Creates sample blog posts specifically for Georgia
    - Includes market updates, legal insights, and business guides
    - All posts are published and ready to display

  2. Content Categories
    - Market Updates: Current business climate information
    - Legal Insights: Regulatory and legal information
    - Business Guides: Practical business formation guides

  3. SEO Optimization
    - Each post includes SEO title and description
    - Proper slugs for URL structure
    - Relevant tags for categorization
*/

-- Get Georgia country ID
DO $$
DECLARE
    georgia_country_id uuid;
    admin_user_id uuid;
BEGIN
    -- Get Georgia country ID
    SELECT id INTO georgia_country_id 
    FROM countries 
    WHERE slug = 'georgia' 
    LIMIT 1;

    -- Get admin user ID for author
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;

    -- Only proceed if we found both IDs
    IF georgia_country_id IS NOT NULL AND admin_user_id IS NOT NULL THEN
        
        -- Insert sample blog posts for Georgia
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
            seo_description,
            country_id
        ) VALUES 
        (
            'Georgia Business Climate 2025: New Opportunities for International Entrepreneurs',
            'georgia-business-climate-2025',
            'Georgia continues to strengthen its position as one of the world''s most business-friendly jurisdictions. With recent regulatory improvements and new international partnerships, 2025 presents unprecedented opportunities for international entrepreneurs looking to establish their businesses in this strategic location.

The Georgian government has introduced several new initiatives to attract foreign investment, including streamlined company registration processes, enhanced digital services, and improved banking facilities for non-residents. These developments make Georgia an even more attractive destination for international business formation.

Key highlights for 2025 include:
- Simplified online company registration taking just 2-3 days
- Enhanced e-governance services for business operations
- New tax incentives for technology and innovation companies
- Improved banking services for international clients
- Strengthened legal framework for foreign investors

The strategic location between Europe and Asia, combined with Georgia''s liberal economic policies and 0% tax on foreign-sourced income, creates a unique value proposition for businesses looking to expand internationally.',
            'Discover the latest business opportunities and regulatory improvements in Georgia for 2025, including new tax incentives and streamlined processes for international entrepreneurs.',
            admin_user_id,
            'Market Updates',
            ARRAY['Georgia', 'Business Climate', '2025', 'International Business', 'Tax Benefits'],
            'en',
            true,
            NOW(),
            'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800',
            'Georgia Business Climate 2025 - New Opportunities for Entrepreneurs',
            'Explore Georgia''s enhanced business environment in 2025 with new opportunities, tax incentives, and streamlined processes for international entrepreneurs.',
            georgia_country_id
        ),
        (
            'Complete Guide to Georgian LLC Formation: Step-by-Step Process',
            'georgian-llc-formation-guide',
            'Forming a Limited Liability Company (LLC) in Georgia is one of the most straightforward business registration processes globally. This comprehensive guide walks you through every step of the Georgian LLC formation process, from initial planning to post-registration requirements.

**Why Choose Georgian LLC?**
Georgian LLCs offer exceptional benefits including limited liability protection, operational flexibility, and significant tax advantages. The process is designed to be completed quickly and efficiently, often within 3-5 business days.

**Step-by-Step Formation Process:**

1. **Company Name Selection**: Choose and reserve your preferred company name
2. **Shareholder Structure**: Define ownership and share distribution
3. **Registered Address**: Secure a legal address in Georgia
4. **Documentation**: Prepare articles of incorporation and bylaws
5. **Registration**: Submit application to House of Justice
6. **Tax Registration**: Complete tax number acquisition
7. **Bank Account**: Open corporate bank account
8. **Compliance Setup**: Establish ongoing compliance procedures

**Required Documents:**
- Passport copies of all shareholders and directors
- Proof of registered address in Georgia
- Articles of incorporation
- Shareholder agreements
- Board resolutions

**Timeline and Costs:**
The entire process typically takes 5-7 business days and costs vary depending on share capital and additional services required. Our consultants handle all aspects of the formation process, ensuring compliance and efficiency.',
            'Learn how to form an LLC in Georgia with our complete step-by-step guide covering requirements, timeline, costs, and benefits of Georgian business formation.',
            admin_user_id,
            'Business Guides',
            ARRAY['LLC Formation', 'Georgia', 'Company Registration', 'Business Setup', 'Legal Guide'],
            'en',
            true,
            NOW() - INTERVAL '2 days',
            'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
            'Georgian LLC Formation Guide - Complete Step-by-Step Process',
            'Complete guide to forming an LLC in Georgia including requirements, timeline, costs, and step-by-step process for international entrepreneurs.',
            georgia_country_id
        ),
        (
            'Georgian Banking for Non-Residents: Everything You Need to Know',
            'georgian-banking-non-residents-guide',
            'Opening a bank account in Georgia as a non-resident has become increasingly accessible, with major Georgian banks offering specialized services for international clients. This guide covers everything you need to know about Georgian banking for non-residents.

**Why Georgian Banking?**
Georgian banks offer competitive services with international standards, multi-currency accounts, and excellent online banking platforms. The banking sector is well-regulated and offers services comparable to European standards.

**Account Types Available:**
- Personal current and savings accounts
- Business accounts for companies
- Multi-currency accounts (USD, EUR, GEL)
- Investment and deposit accounts

**Requirements for Non-Residents:**
- Valid passport and identification
- Proof of address from home country
- Income verification documents
- Initial deposit (varies by bank)
- Purpose of account opening

**Major Banks Serving Non-Residents:**
1. **Bank of Georgia**: Largest bank with comprehensive services
2. **TBC Bank**: Modern digital banking solutions
3. **Liberty Bank**: Specialized international services
4. **Credo Bank**: Competitive rates and terms

**Account Opening Process:**
The process typically takes 5-10 business days and can often be completed remotely with proper documentation. Our consultants assist with bank selection, document preparation, and application submission.

**Banking Features:**
- Online and mobile banking
- International wire transfers
- Multi-currency support
- Debit and credit cards
- Investment services',
            'Comprehensive guide to opening bank accounts in Georgia as a non-resident, including requirements, bank options, and step-by-step process.',
            admin_user_id,
            'Banking & Finance',
            ARRAY['Banking', 'Non-Resident', 'Georgia', 'Account Opening', 'International Banking'],
            'en',
            true,
            NOW() - INTERVAL '5 days',
            'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
            'Georgian Banking for Non-Residents - Complete Guide 2025',
            'Everything you need to know about opening bank accounts in Georgia as a non-resident including requirements, bank options, and application process.',
            georgia_country_id
        ),
        (
            'Tax Benefits of Georgian Residency: 0% Tax on Foreign Income',
            'georgia-tax-benefits-foreign-income',
            'Georgia offers one of the world''s most attractive tax systems for international residents, with 0% tax on foreign-sourced income and territorial taxation principles that can significantly reduce your global tax burden.

**Georgian Tax Residency Benefits:**
- 0% tax on foreign-sourced income
- Territorial taxation system
- No tax on capital gains from foreign sources
- Simple tax compliance requirements
- Double taxation treaties with 50+ countries

**Who Qualifies for Tax Residency?**
To become a Georgian tax resident, you must spend 183+ days per year in Georgia or have your center of vital interests in Georgia. The process is straightforward and well-defined.

**Tax Rates for Georgian-Sourced Income:**
- Employment income: 20% flat rate
- Business income: Various rates depending on status
- Small business status: 1% on turnover up to 500,000 GEL
- Micro business status: 0% on turnover up to 30,000 GEL

**International Tax Planning:**
Georgian tax residency can be part of an effective international tax planning strategy, especially for:
- Digital nomads and remote workers
- International consultants and freelancers
- Investment income recipients
- Business owners with international operations

**Compliance Requirements:**
Georgian tax compliance is relatively simple with annual filing requirements and clear guidelines. Our tax specialists ensure full compliance while maximizing available benefits.

**Getting Started:**
The process begins with establishing Georgian residency, followed by tax registration and ongoing compliance setup. Professional guidance ensures optimal structure and compliance.',
            'Discover the significant tax benefits of Georgian residency including 0% tax on foreign income and territorial taxation advantages for international residents.',
            admin_user_id,
            'Tax & Legal',
            ARRAY['Tax Benefits', 'Georgian Residency', 'Foreign Income', 'Tax Planning', 'Territorial Taxation'],
            'en',
            true,
            NOW() - INTERVAL '1 week',
            'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800',
            'Georgian Tax Benefits - 0% Tax on Foreign Income Guide',
            'Complete guide to Georgian tax residency benefits including 0% tax on foreign income and territorial taxation advantages for international residents.',
            georgia_country_id
        ),
        (
            'Georgia Free Economic Zones: Special Benefits for International Businesses',
            'georgia-free-economic-zones-benefits',
            'Georgia''s Free Economic Zones offer exceptional benefits for international businesses, including significant tax advantages, simplified procedures, and strategic location benefits for companies engaged in international trade and manufacturing.

**What are Free Economic Zones?**
Free Economic Zones (FEZ) in Georgia are special territories with preferential legal and economic conditions designed to attract foreign investment and promote international business activities.

**Key Benefits:**
- 0% profit tax for the first 10 years
- 0% VAT on goods and services within the zone
- Simplified customs procedures
- Reduced bureaucracy
- Strategic location advantages

**Available Free Economic Zones:**
1. **Poti Free Industrial Zone**: Focus on manufacturing and logistics
2. **Batumi Free Economic Zone**: Tourism and services oriented
3. **Kutaisi Free Economic Zone**: Industrial and manufacturing focus

**Eligible Activities:**
- Manufacturing and production
- International trade and logistics
- Tourism and hospitality services
- Information technology services
- Research and development

**Requirements and Process:**
To operate in a Free Economic Zone, companies must:
- Invest minimum required capital
- Create specified number of jobs
- Engage in eligible activities
- Maintain proper documentation

**Investment Thresholds:**
- Manufacturing: $500,000 minimum investment
- Tourism: $1,000,000 minimum investment
- Logistics: $300,000 minimum investment

**Getting Started:**
Our consultants assist with FEZ application, investment planning, and ongoing compliance to ensure you maximize the benefits of these special economic territories.',
            'Explore Georgia''s Free Economic Zones offering 0% profit tax, simplified procedures, and strategic advantages for international businesses and investors.',
            admin_user_id,
            'Investment Opportunities',
            ARRAY['Free Economic Zones', 'Tax Benefits', 'International Business', 'Investment', 'Manufacturing'],
            'en',
            true,
            NOW() - INTERVAL '10 days',
            'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
            'Georgia Free Economic Zones - Special Benefits for International Business',
            'Discover Georgia''s Free Economic Zones offering 0% profit tax, simplified procedures, and strategic advantages for international businesses.',
            georgia_country_id
        );

        RAISE NOTICE 'Successfully added % sample blog posts for Georgia', 5;
    ELSE
        RAISE NOTICE 'Could not find Georgia country or admin user - skipping blog post creation';
    END IF;
END $$;