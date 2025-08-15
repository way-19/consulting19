ALTER TABLE public.faqs
ADD CONSTRAINT unique_faq_question_lang_country UNIQUE (question, language_code, country_id);