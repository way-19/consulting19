```sql
-- Add sample FAQs for Georgia
INSERT INTO public.faqs (id, question, answer, category, language_code, sort_order, is_active, country_id)
VALUES
    (gen_random_uuid(), 'Gürcistan''da şirket kurmak ne kadar sürer?', 'Gürcistan''da şirket kuruluşu genellikle 1 ila 3 iş günü sürer. Tüm belgeler eksiksiz olduğunda süreç oldukça hızlıdır.', 'Company Formation', 'tr', 10, TRUE, (SELECT id FROM public.countries WHERE slug = 'georgia')),
    (gen_random_uuid(), 'Can non-residents open bank accounts in Georgia?', 'Yes, non-residents can open personal and business bank accounts in Georgia. The process typically requires a passport, proof of address, and sometimes a bank reference letter.', 'Banking', 'en', 20, TRUE, (SELECT id FROM public.countries WHERE slug = 'georgia')),
    (gen_random_uuid(), 'Gürcistan''da vergi avantajları nelerdir?', 'Gürcistan, bölgesel vergilendirme sistemine sahiptir. Yurt dışından elde edilen gelirler için %0 vergi oranı uygulanır. Ayrıca, küçük işletmeler için %1 gibi düşük bir gelir vergisi oranı da mevcuttur.', 'Tax & Accounting', 'tr', 30, TRUE, (SELECT id FROM public.countries WHERE slug = 'georgia')),
    (gen_random_uuid(), 'What documents are required for company registration in Georgia?', 'Typically, you need a passport copy, proof of address, and a description of your business activities. For some company types, additional documents like a bank statement or a business plan might be required.', 'Company Formation', 'en', 40, TRUE, (SELECT id FROM public.countries WHERE slug = 'georgia')),
    (gen_random_uuid(), 'Gürcistan''da oturma izni nasıl alınır?', 'Gürcistan''da oturma izni, yatırım, çalışma veya eğitim gibi çeşitli yollarla alınabilir. Süreç, başvuru türüne göre değişir ve genellikle 10-30 gün sürer.', 'Visa & Residence', 'tr', 50, TRUE, (SELECT id FROM public.countries WHERE slug = 'georgia')),
    (gen_random_uuid(), 'Is it necessary to visit Georgia to open a company?', 'No, it is not always necessary to visit Georgia. Many services, including company registration and bank account opening, can be done remotely through a power of attorney.', 'Company Formation', 'en', 60, TRUE, (SELECT id FROM public.countries WHERE slug = 'georgia'));

-- Update the updated_at column for the newly inserted rows
UPDATE public.faqs
SET updated_at = now()
WHERE updated_at IS NULL;
```