import React, { useState } from 'react';
import { Search, Filter, ChevronDown, HelpCircle, MessageSquare, Globe, CheckCircle } from 'lucide-react';
import { useFAQs, useFAQCategories } from '../hooks/useFAQs';
import { useLanguage } from '../contexts/LanguageContext';

const FAQPage = () => {
  const { currentLanguage } = useLanguage();
  const { faqs, loading, error } = useFAQs({ 
    isActive: true, 
    languageCode: currentLanguage 
  });
  const { categories } = useFAQCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'company formation':
      case 'şirket kuruluşu':
        return '🏢';
      case 'banking':
      case 'bankacılık':
        return '🏦';
      case 'tax & accounting':
      case 'vergi ve muhasebe':
        return '📊';
      case 'legal services':
      case 'hukuki hizmetler':
        return '⚖️';
      case 'visa & residence':
      case 'vize ve ikamet':
        return '🛂';
      case 'technical support':
      case 'teknik destek':
        return '🔧';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Sıkça Sorulan <span className="text-yellow-300">Sorular</span>
              </h1>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-md p-8">
          <HelpCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">SSS Yüklenemedi</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <HelpCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Sıkça Sorulan <span className="text-yellow-300">Sorular</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Uluslararası iş kurma süreçleri hakkında en çok merak edilen sorular ve uzman yanıtları
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Soru veya yanıt ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {filteredFAQs.length} soru gösteriliyor
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Soru bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCategoryIcon(faq.category)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${
                        openFAQ === faq.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                    {faq.category && (
                      <div className="mt-2 ml-11">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Bu yanıt yardımcı oldu mu?</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                Evet
                              </button>
                              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                Hayır
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
            <MessageSquare className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Aradığınız Yanıtı Bulamadınız mı?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Uzman danışmanlarımız size yardımcı olmaya hazır. Doğrudan iletişime geçin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Canlı Destek</span>
              </button>
              <button className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>İletişim Formu</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;