import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings, DollarSign } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { useServices, useServiceCategories } from '../hooks/useServices';
import SearchFilterBar from '../components/common/SearchFilterBar';
import useAdvancedSearch from '../hooks/useAdvancedSearch';

const ServicesPage = () => {
  const { services, loading, error } = useServices(true);
  const { categories: serviceCategories } = useServiceCategories();

  const priceRanges = {
    'all': 'All Prices',
    'under-1000': 'Under $1,000',
    '1000-2000': '$1,000 - $2,000', 
    'over-2000': 'Over $2,000'
  };

  // Advanced search configuration
  const searchConfig = {
    searchFields: ['title', 'description'] as (keyof any)[],
    filterFields: [
      {
        key: 'category' as keyof any,
        type: 'select' as const,
        options: [
          { value: 'all', label: 'All Categories' },
          ...serviceCategories.map(cat => ({ value: cat, label: cat }))
        ]
      },
      {
        key: 'price_range' as keyof any,
        type: 'select' as const,
        options: Object.entries(priceRanges).map(([value, label]) => ({ value, label }))
      }
    ],
    sortFields: [
      { key: 'title' as keyof any, label: 'Service Title', defaultOrder: 'asc' as const },
      { key: 'price' as keyof any, label: 'Price', defaultOrder: 'asc' as const },
      { key: 'delivery_time_days' as keyof any, label: 'Delivery Time', defaultOrder: 'asc' as const }
    ]
  };

  // Add price range to services for filtering
  const servicesWithPriceRange = services.map(service => ({
    ...service,
    price_range: service.price < 1000 ? 'under-1000' :
                service.price <= 2000 ? '1000-2000' : 'over-2000'
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
    filteredData: filteredServices,
    totalCount,
    filteredCount
  } = useAdvancedSearch({
    data: servicesWithPriceRange,
    config: searchConfig,
    initialSortBy: 'title',
    initialFilters: { category: 'all', price_range: 'all' }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                Expert <span className="text-yellow-300">Business Services</span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Services</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Expert <span className="text-yellow-300">Business Services</span>
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Comprehensive international business services delivered by expert consultants. 
              From company formation to ongoing compliance, we've got you covered.
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
            searchPlaceholder="Search services by title or description..."
            filters={[
              {
                key: 'category',
                label: 'Category',
                value: filters.category || 'all',
                options: searchConfig.filterFields[0].options!,
                onChange: (value) => setFilter('category', value),
                icon: Settings
              },
              {
                key: 'price_range',
                label: 'Price Range',
                value: filters.price_range || 'all',
                options: searchConfig.filterFields[1].options!,
                onChange: (value) => setFilter('price_range', value),
                icon: DollarSign
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

      {/* Services Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Need Custom Solutions?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Our consultants can create tailored service packages to meet your specific business needs.
          </p>
          <Link
            to="/custom-consultation"
            className="inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <span>Schedule Custom Consultation</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;