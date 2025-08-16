import React from 'react';
import { Search, Filter, X, Calendar, SortAsc, SortDesc } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SearchFilterBarProps {
  // Search
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchPlaceholder?: string;
  
  // Filters
  filters: {
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
    icon?: React.ComponentType<any>;
  }[];
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  sortOptions?: FilterOption[];
  onSortChange?: (sortBy: string) => void;
  onSortOrderChange?: (order: 'asc' | 'desc') => void;
  
  // Results
  totalCount: number;
  filteredCount: number;
  
  // Actions
  onClearFilters?: () => void;
  onExport?: () => void;
  
  // Styling
  className?: string;
  compact?: boolean;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  sortBy,
  sortOrder = 'asc',
  sortOptions,
  onSortChange,
  onSortOrderChange,
  totalCount,
  filteredCount,
  onClearFilters,
  onExport,
  className = '',
  compact = false
}) => {
  const hasActiveFilters = filters.some(filter => filter.value !== 'all' && filter.value !== '');
  const isFiltered = searchTerm.length > 0 || hasActiveFilters;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className={`grid gap-4 items-end ${
        compact 
          ? 'grid-cols-1 md:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-4 lg:grid-cols-6'
      }`}>
        {/* Search Input */}
        <div className={compact ? 'md:col-span-1' : 'md:col-span-2'}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            <div className="relative">
              {filter.icon && (
                <filter.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  filter.icon ? 'pl-10' : ''
                }`}
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {option.count !== undefined && ` (${option.count})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        {/* Sorting */}
        {sortOptions && onSortChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {onSortOrderChange && (
                <button
                  onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4 text-gray-600" />
                  ) : (
                    <SortDesc className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!compact && (
          <div className="flex items-center space-x-2">
            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Clear</span>
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Export</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isFiltered ? (
            <>
              Showing <span className="font-medium text-gray-900">{filteredCount}</span> of{' '}
              <span className="font-medium text-gray-900">{totalCount}</span> results
              {hasActiveFilters && (
                <span className="ml-2 text-purple-600">
                  (filtered)
                </span>
              )}
            </>
          ) : (
            <>
              Showing <span className="font-medium text-gray-900">{totalCount}</span> results
            </>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            <div className="flex items-center space-x-1">
              {filters
                .filter(filter => filter.value !== 'all' && filter.value !== '')
                .map((filter) => {
                  const selectedOption = filter.options.find(opt => opt.value === filter.value);
                  return (
                    <span
                      key={filter.key}
                      className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
                    >
                      <span>{filter.label}: {selectedOption?.label}</span>
                      <button
                        onClick={() => filter.onChange('all')}
                        className="hover:text-purple-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;