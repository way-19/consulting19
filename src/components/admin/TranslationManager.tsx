import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../contexts/LanguageContext';
import { 
  Globe, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Filter,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Languages,
  FileText,
  Database,
  Zap
} from 'lucide-react';

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

interface TranslationStats {
  totalKeys: number;
  translatedKeys: number;
  missingTranslations: number;
  completionPercentage: number;
  lastUpdated: string;
}

const TranslationManager: React.FC = () => {
  const { profile } = useAuth();
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const [translationForm, setTranslationForm] = useState({
    key: '',
    value: '',
    category: 'general',
    language_code: 'en' as SupportedLanguage
  });

  const [stats, setStats] = useState<TranslationStats>({
    totalKeys: 0,
    translatedKeys: 0,
    missingTranslations: 0,
    completionPercentage: 0,
    lastUpdated: ''
  });

  const categories = [
    { value: 'general', label: 'General', icon: Globe },
    { value: 'navigation', label: 'Navigation', icon: FileText },
    { value: 'forms', label: 'Forms', icon: Edit },
    { value: 'messages', label: 'Messages', icon: CheckCircle },
    { value: 'errors', label: 'Errors', icon: AlertTriangle },
    { value: 'business', label: 'Business Terms', icon: Database },
    { value: 'custom', label: 'Custom', icon: Zap }
  ];

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchTranslations();
    }
  }, [profile, selectedLanguage]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage)
        .order('key', { ascending: true });

      if (error) throw error;
      
      setTranslations(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async (translationsData: Translation[]) => {
    try {
      // Get all unique keys across all languages
      const { data: allKeys } = await supabase
        .from('translations')
        .select('key')
        .eq('language_code', 'en'); // Use English as base language

      const totalKeys = new Set(allKeys?.map(t => t.key) || []).size;
      const translatedKeys = translationsData.length;
      const missingTranslations = Math.max(0, totalKeys - translatedKeys);
      const completionPercentage = totalKeys > 0 ? Math.round((translatedKeys / totalKeys) * 100) : 0;

      const lastUpdated = translationsData.length > 0 
        ? Math.max(...translationsData.map(t => new Date(t.updated_at).getTime()))
        : Date.now();

      setStats({
        totalKeys,
        translatedKeys,
        missingTranslations,
        completionPercentage,
        lastUpdated: new Date(lastUpdated).toISOString()
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTranslation) {
        const { error } = await supabase
          .from('translations')
          .update({
            value: translationForm.value,
            category: translationForm.category
          })
          .eq('id', editingTranslation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('translations')
          .insert([{
            key: translationForm.key,
            value: translationForm.value,
            language_code: translationForm.language_code,
            category: translationForm.category,
            is_active: true
          }]);

        if (error) throw error;
      }

      await fetchTranslations();
      resetForm();
      alert('Translation saved successfully!');
    } catch (error) {
      console.error('Error saving translation:', error);
      alert('Failed to save translation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTranslations();
      alert('Translation deleted successfully!');
    } catch (error) {
      console.error('Error deleting translation:', error);
      alert('Failed to delete translation');
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setTranslationForm({
      key: translation.key,
      value: translation.value,
      category: translation.category,
      language_code: translation.language_code
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setTranslationForm({
      key: '',
      value: '',
      category: 'general',
      language_code: selectedLanguage
    });
    setEditingTranslation(null);
    setShowAddModal(false);
  };

  const exportTranslations = async () => {
    try {
      const { data } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage);

      const csv = [
        'Key,Value,Category,Language',
        ...(data || []).map(t => `"${t.key}","${t.value}","${t.category}","${t.language_code}"`)
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations_${selectedLanguage}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting translations:', error);
      alert('Failed to export translations');
    }
  };

  const autoTranslateFromEnglish = async () => {
    if (selectedLanguage === 'en') {
      alert('Cannot auto-translate from English to English');
      return;
    }

    if (!confirm(`Auto-translate all English keys to ${selectedLanguage.toUpperCase()}? This may take a while.`)) {
      return;
    }

    try {
      // Get all English translations
      const { data: englishTranslations } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', 'en');

      if (!englishTranslations) return;

      // Get existing translations for target language
      const { data: existingTranslations } = await supabase
        .from('translations')
        .select('key')
        .eq('language_code', selectedLanguage);

      const existingKeys = new Set(existingTranslations?.map(t => t.key) || []);

      // Filter out already translated keys
      const keysToTranslate = englishTranslations.filter(t => !existingKeys.has(t.key));

      if (keysToTranslate.length === 0) {
        alert('All keys are already translated for this language');
        return;
      }

      alert(`Starting auto-translation of ${keysToTranslate.length} keys...`);

      // Translate in batches to avoid overwhelming the API
      const batchSize = 10;
      for (let i = 0; i < keysToTranslate.length; i += batchSize) {
        const batch = keysToTranslate.slice(i, i + batchSize);
        
        const translatedBatch = await Promise.all(
          batch.map(async (englishTranslation) => {
            try {
              const result = await translateText(
                englishTranslation.value, 
                selectedLanguage, 
                'en'
              );
              
              return {
                key: englishTranslation.key,
                value: result.translatedText,
                language_code: selectedLanguage,
                category: englishTranslation.category,
                is_active: true
              };
            } catch (error) {
              console.error(`Failed to translate key: ${englishTranslation.key}`, error);
              return null;
            }
          })
        );

        // Insert successful translations
        const validTranslations = translatedBatch.filter(t => t !== null);
        if (validTranslations.length > 0) {
          const { error } = await supabase
            .from('translations')
            .insert(validTranslations);

          if (error) {
            console.error('Error inserting translations:', error);
          }
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await fetchTranslations();
      alert('Auto-translation completed!');
    } catch (error) {
      console.error('Error in auto-translation:', error);
      alert('Auto-translation failed');
    }
  };

  const filteredTranslations = translations.filter(translation => {
    const matchesSearch = 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || translation.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const selectedLangInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Translation Management</h2>
          <p className="text-gray-600">Manage translations for all supported languages</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={autoTranslateFromEnglish}
            disabled={selectedLanguage === 'en'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="h-4 w-4" />
            <span>Auto-Translate</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Translation</span>
          </button>
        </div>
      </div>

      {/* Language Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Keys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
            </div>
            <Database className="h-6 w-6 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Translated</p>
              <p className="text-2xl font-bold text-green-600">{stats.translatedKeys}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Missing</p>
              <p className="text-2xl font-bold text-red-600">{stats.missingTranslations}</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completionPercentage}%</p>
            </div>
            <Languages className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold text-purple-600">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <RefreshCw className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Language Selector and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search keys or values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={exportTranslations}
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowBulkImport(true)}
              className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredTranslations.length} of {translations.length} translations for {selectedLangInfo?.nativeName}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">{stats.completionPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Translations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTranslations.length === 0 ? (
          <div className="text-center py-12">
            <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Translations Found</h3>
            <p className="text-gray-600 mb-6">
              {translations.length === 0 
                ? `No translations available for ${selectedLangInfo?.nativeName}`
                : 'No translations match your current filters'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Add First Translation
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-3">Translation Key</div>
                <div className="col-span-4">Translation Value</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {filteredTranslations.map((translation) => {
                const categoryInfo = categories.find(cat => cat.value === translation.category);
                
                return (
                  <div key={translation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-purple-600">
                          {translation.key}
                        </code>
                      </div>
                      
                      <div className="col-span-4">
                        <p className="text-sm text-gray-900 line-clamp-2">{translation.value}</p>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          {categoryInfo && <categoryInfo.icon className="h-4 w-4 text-gray-500" />}
                          <span className="text-sm text-gray-600">{categoryInfo?.label || translation.category}</span>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">
                          {new Date(translation.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="col-span-1">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(translation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Translation"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(translation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Translation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Translation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTranslation ? 'Edit Translation' : 'Add New Translation'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation Key *
                  </label>
                  <input
                    type="text"
                    required
                    value={translationForm.key}
                    onChange={(e) => setTranslationForm(prev => ({ ...prev, key: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    placeholder="e.g., nav.countries"
                    disabled={!!editingTranslation}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={translationForm.language_code}
                    onChange={(e) => setTranslationForm(prev => ({ ...prev, language_code: e.target.value as SupportedLanguage }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={!!editingTranslation}
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Translation Value *
                </label>
                <textarea
                  required
                  rows={3}
                  value={translationForm.value}
                  onChange={(e) => setTranslationForm(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter the translated text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={translationForm.category}
                  onChange={(e) => setTranslationForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingTranslation ? 'Update' : 'Add'} Translation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationManager;