import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SupportedLanguage } from '../contexts/LanguageContext';

interface Translation {
  id: string;
  key: string;
  language_code: SupportedLanguage;
  value: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TranslationContextType {
  translations: Record<string, string>;
  loading: boolean;
  updateTranslation: (key: string, value: string, languageCode: SupportedLanguage) => Promise<void>;
  addTranslation: (key: string, value: string, languageCode: SupportedLanguage, category: string) => Promise<void>;
  deleteTranslation: (id: string) => Promise<void>;
  refreshTranslations: () => Promise<void>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: React.ReactNode;
  languageCode: SupportedLanguage;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children, 
  languageCode 
}) => {
  const { profile } = useAuth();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranslations();
  }, [languageCode]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', languageCode)
        .eq('is_active', true);

      if (error) throw error;

      // Convert to key-value pairs
      const translationMap = (data || []).reduce((acc, translation) => {
        acc[translation.key] = translation.value;
        return acc;
      }, {} as Record<string, string>);

      setTranslations(translationMap);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTranslation = async (key: string, value: string, languageCode: SupportedLanguage) => {
    try {
      const { error } = await supabase
        .from('translations')
        .upsert({
          key,
          value,
          language_code: languageCode,
          category: 'custom',
          is_active: true
        });

      if (error) throw error;
      
      if (languageCode === languageCode) {
        setTranslations(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error updating translation:', error);
      throw error;
    }
  };

  const addTranslation = async (key: string, value: string, languageCode: SupportedLanguage, category: string) => {
    try {
      const { error } = await supabase
        .from('translations')
        .insert([{
          key,
          value,
          language_code: languageCode,
          category,
          is_active: true
        }]);

      if (error) throw error;
      
      if (languageCode === languageCode) {
        setTranslations(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error adding translation:', error);
      throw error;
    }
  };

  const deleteTranslation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTranslations();
    } catch (error) {
      console.error('Error deleting translation:', error);
      throw error;
    }
  };

  const refreshTranslations = async () => {
    await fetchTranslations();
  };

  const value = {
    translations,
    loading,
    updateTranslation,
    addTranslation,
    deleteTranslation,
    refreshTranslations
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslations = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
};