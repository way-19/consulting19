import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AutoTranslatorProps {
  text: string;
  targetLanguage?: string;
  onTranslated?: (translatedText: string) => void;
  showOriginal?: boolean;
  className?: string;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  timestamp: Date;
}

// Mock DeepL API integration
const translateText = async (
  text: string, 
  targetLang: string, 
  sourceLang?: string
): Promise<TranslationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock translation - in production this would call DeepL API
  const mockTranslations: Record<string, Record<string, string>> = {
    en: {
      tr: `[TR] ${text}`,
      ka: `[KA] ${text}`,
      ru: `[RU] ${text}`,
      es: `[ES] ${text}`,
      fr: `[FR] ${text}`,
      de: `[DE] ${text}`,
      ar: `[AR] ${text}`
    },
    tr: {
      en: `[EN] ${text}`,
      ka: `[KA] ${text}`,
      ru: `[RU] ${text}`
    },
    ka: {
      en: `[EN] ${text}`,
      tr: `[TR] ${text}`,
      ru: `[RU] ${text}`
    }
  };

  const sourceLanguageCode = sourceLang || 'en';
  const translatedText = mockTranslations[sourceLanguageCode]?.[targetLang] || `[${targetLang.toUpperCase()}] ${text}`;

  return {
    originalText: text,
    translatedText,
    sourceLanguage: sourceLanguageCode,
    targetLanguage: targetLang,
    confidence: 0.95,
    timestamp: new Date()
  };
};

const AutoTranslator: React.FC<AutoTranslatorProps> = ({
  text,
  targetLanguage,
  onTranslated,
  showOriginal = true,
  className = ''
}) => {
  const { currentLanguage } = useLanguage();
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveTargetLanguage = targetLanguage || currentLanguage;

  useEffect(() => {
    if (text && effectiveTargetLanguage !== 'en') {
      handleTranslate();
    }
  }, [text, effectiveTargetLanguage]);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    try {
      setIsTranslating(true);
      setError(null);

      const result = await translateText(text, effectiveTargetLanguage);
      setTranslation(result);
      
      if (onTranslated) {
        onTranslated(result.translatedText);
      }
    } catch (err) {
      setError('Translation failed');
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const retryTranslation = () => {
    setError(null);
    handleTranslate();
  };

  // If target language is English or same as source, don't show translator
  if (effectiveTargetLanguage === 'en' || !text) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Original Text */}
      {showOriginal && (
        <div className="text-gray-700">
          <div className="flex items-center space-x-2 mb-1">
            <Globe className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Original (EN)</span>
          </div>
          <p className="text-sm">{text}</p>
        </div>
      )}

      {/* Translation */}
      <div className="border-t border-gray-200 pt-2">
        <div className="flex items-center space-x-2 mb-1">
          <Globe className="h-3 w-3 text-blue-500" />
          <span className="text-xs text-blue-600">
            Auto-translated ({effectiveTargetLanguage.toUpperCase()})
          </span>
          {isTranslating && (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-500"></div>
          )}
          {translation && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">
                {Math.round(translation.confidence * 100)}% confidence
              </span>
            </div>
          )}
        </div>

        {error ? (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={retryTranslation}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Retry
            </button>
          </div>
        ) : isTranslating ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Translating...</span>
          </div>
        ) : translation ? (
          <p className="text-sm text-gray-800">{translation.translatedText}</p>
        ) : (
          <p className="text-sm text-gray-500">Translation not available</p>
        )}
      </div>
    </div>
  );
};

export default AutoTranslator;