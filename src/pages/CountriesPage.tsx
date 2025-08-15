import React, { useState } from 'react';
import { Search, Filter, Globe, TrendingUp, Users, Star } from 'lucide-react';
import ModernCountryCard from '../components/ModernCountryCard';
import { useCountries, Country } from '../hooks/useCountries';

const CountriesPage = () => {
  const { countries, loading, error } = useCountries(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  const regions = {
    'all': 'All Regions',
    'europe': 'Europe',
    'americas': 'Americas',
    'middle-east': 'Middle East',
    'asia': 'Asia'
  };

  const getRegion = (country: Country) => {
    const europeanCountries = ['georgia', 'montenegro', 'estonia', 'portugal', 'malta', 'switzerland', 'spain', 'germany', 'cyprus', 'ireland'];
    const americanCountries = ['usa', 'panama'];
    const middleEastCountries = ['uae'];
    
    if (europeanCountries.includes(country.slug)) return 'europe';
    if (americanCountries.includes(country.slug)) return 'americas';
    if (middleEastCountries.includes(country.slug)) return 'middle-east';
    return 'asia';
  };

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (country.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || getRegion(country) === selectedRegion;
    const matchesLanguage = selectedLanguage === 'all' || 
                           country.supported_languages?.includes(selectedLanguage);
    
    return matchesSearch && matchesRegion && matchesLanguage;
  });

  const availableLanguages = Array.from(
    new Set(countries.flatMap(country => country.supported_languages || []).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Choose Your <span className="text-yellow-300">Perfect Jurisdiction</span>
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
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Countries</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Choose Your <span className="text-yellow-300">Perfect Jurisdiction</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Explore our comprehensive guide to the world's most business-friendly countries. 
              Find the perfect jurisdiction for your international business goals.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Globe className="h-6 w-6 text-yellow-300" />
                  <span className="text-2xl font-bold">{countries.length}+</span>
                </div>
                <p className="text-purple-100">Countries Available</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Users className="h-6 w-6 text-yellow-300" />
                  <span className="text-2xl font-bold">15,000+</span>
                </div>
                <p className="text-purple-100">Businesses Formed</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="h-6 w-6 text-yellow-300" />
                  <span className="text-2xl font-bold">98.5%</span>
                </div>
                <p className="text-purple-100">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                >
                  {Object.entries(regions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              >
                <option value="all">All Languages</option>
                {availableLanguages.filter(Boolean).map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-purple-600">{filteredCountries.length}</span> of <span className="font-semibold">{countries.length}</span> countries
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Updated daily with latest business insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-6">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">No countries found</h3>
              <p className="text-lg text-gray-600 mb-8">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('all');
                  setSelectedLanguage('all');
                }}
                className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Countries Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredCountries.map((country) => (
                  <ModernCountryCard key={country.id} country={country} />
                ))}
              </div>

              {/* Load More Section */}
              {filteredCountries.length >= 12 && (
                <div className="text-center mt-16">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Explore More Jurisdictions</h3>
                    <p className="text-gray-600 mb-6">
                      We're constantly adding new business-friendly jurisdictions to our platform.
                    </p>
                    <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                      Request New Country
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Start Your Global Business?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Get expert guidance from our AI-powered consultants and choose the perfect jurisdiction for your business needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg">
              Get AI Recommendation
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CountriesPage;