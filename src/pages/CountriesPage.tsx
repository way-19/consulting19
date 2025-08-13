import React, { useState } from 'react';
import { useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import CountryCard from '../components/CountryCard';
import { countries, Country } from '../data/countries';

const CountriesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const regions = {
    'all': 'All Regions',
    'europe': 'Europe',
    'americas': 'Americas',
    'middle-east': 'Middle East',
    'asia': 'Asia'
  };

  const getRegion = (country: Country) => {
    const europeanCountries = ['georgia', 'montenegro', 'estonia', 'portugal', 'malta', 'switzerland', 'spain'];
    const americanCountries = ['usa', 'panama'];
    const middleEastCountries = ['uae'];
    
    if (europeanCountries.includes(country.slug)) return 'europe';
    if (americanCountries.includes(country.slug)) return 'americas';
    if (middleEastCountries.includes(country.slug)) return 'middle-east';
    return 'asia';
  };

  const filteredCountries = countries.filter(country => {
    const matchesSearch = country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         country.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'all' || getRegion(country) === selectedRegion;
    const matchesLanguage = selectedLanguage === 'all' || 
                           country.supportedLanguages.includes(selectedLanguage);
    
    return matchesSearch && matchesRegion && matchesLanguage;
  });

  const availableLanguages = Array.from(
    new Set(countries.flatMap(country => country.supportedLanguages))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Choose Your <span className="text-yellow-300">Perfect Jurisdiction</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Explore our comprehensive guide to the world's most business-friendly countries. 
              Find the perfect jurisdiction for your international business goals.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Object.entries(regions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCountries.length} of {countries.length} countries
          </div>
        </div>
      </section>

      {/* Countries Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No countries found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCountries.map((country) => (
                <CountryCard key={country.id} country={country} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CountriesPage;