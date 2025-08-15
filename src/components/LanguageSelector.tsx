import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'footer' | 'modal';
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'navbar', 
  showLabel = true 
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode as any);
    setIsOpen(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'navbar':
        return {
          button: 'flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors',
          dropdown: 'absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50',
          option: 'w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors'
        };
      case 'footer':
        return {
          button: 'flex items-center space-x-2 text-slate-300 hover:text-white transition-colors',
          dropdown: 'absolute bottom-full right-0 mb-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 z-50',
          option: 'w-full text-left px-4 py-3 hover:bg-slate-700 flex items-center space-x-3 transition-colors text-slate-300 hover:text-white'
        };
      case 'modal':
        return {
          button: 'flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
          dropdown: 'absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50',
          option: 'w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors'
        };
      default:
        return {
          button: 'flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors',
          dropdown: 'absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50',
          option: 'w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 transition-colors'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.button}
      >
        <Globe className="h-4 w-4" />
        {showLabel && (
          <>
            <span className="text-sm font-medium">
              {currentLang?.flag} {currentLang?.nativeName}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={styles.dropdown}>
            <div className="px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Choose Language</h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={styles.option}
                >
                  <span className="text-2xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{language.nativeName}</div>
                    <div className="text-xs opacity-75">{language.name}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Language preference is saved automatically
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;