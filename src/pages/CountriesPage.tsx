import React, { useState } from 'react';
import { Globe, Languages } from 'lucide-react';
import ModernCountryCard from '../components/ModernCountryCard';
import { useCountries, Country } from '../hooks/useCountries';
import SearchFilterBar from '../components/common/SearchFilterBar';
import useAdvancedSearch from '../hooks/useAdvancedSearch';

const CountriesPage = () => {
  const { countries, loading, error } = useCountries(true);

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

  const availableLanguages = Array.from(
    new Set(countries.flatMap(country => country.supported_languages || []).filter(Boolean))
  );

  // Advanced search configuration
  const searchConfig = {
    searchFields: ['name', 'description'] as (keyof Country)[],
    filterFields: [
      {
        key: 'region' as keyof Country,
        type: 'select' as const,
        options: Object.entries(regions).map(([value, label]) => ({ value, label }))
      },
      {
        key: 'supported_languages' as keyof Country,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Languages' },
          ...availableLanguages.map(lang => ({ value: lang, label: lang.toUpperCase() }))
        ]
      }
    ],
    sortFields: [
      { key: 'name' as keyof Country, label: 'Country Name', defaultOrder: 'asc' as const },
      { key: 'sort_order' as keyof Country, label: 'Sort Order', defaultOrder: 'asc' as const }
    ]
  };

  // Add region to countries for filtering
  const countriesWithRegion = countries.map(country => ({
    ...country,
    region: getRegion(country)
  }));

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData: filteredCountries,
    totalCount,
    filteredCount
  } = useAdvancedSearch({
    data: countriesWithRegion,
    config: searchConfig,
    initialSortBy: 'sort_order',
    initialFilters: { region: 'all', supported_languages: 'all' }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
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
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search countries by name or description..."
            filters={[
              {
                key: 'region',
                label: 'Region',
                value: filters.region || 'all',
                options: searchConfig.filterFields[0].options!,
                onChange: (value) => setFilter('region', value),
                icon: Globe
              },
              {
                key: 'supported_languages',
                label: 'Language',
                value: filters.supported_languages || 'all',
                options: searchConfig.filterFields[1].options!,
                onChange: (value) => setFilter('supported_languages', value),
                icon: Languages
              }
            ]}
            sortBy={sortBy}
            sortOrder={sortOrder}
            sortOptions={searchConfig.sortFields.map(field => ({
              value: field.key as string,
              label: field.label
            }))}
            onSortChange={setSortBy}
            onSortOrderChange={setSortOrder}
            totalCount={totalCount}
            filteredCount={filteredCount}
            onClearFilters={clearFilters}
          />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCountries.map((country) => (
                <ModernCountryCard key={country.id} country={country} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CountriesPage;