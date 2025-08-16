import { useState, useMemo, useCallback } from 'react';

export interface SearchConfig<T> {
  searchFields: (keyof T)[];
  filterFields: {
    key: keyof T;
    type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
    options?: { value: any; label: string }[];
  }[];
  sortFields: {
    key: keyof T;
    label: string;
    defaultOrder?: 'asc' | 'desc';
  }[];
}

export interface UseAdvancedSearchProps<T> {
  data: T[];
  config: SearchConfig<T>;
  initialSearchTerm?: string;
  initialFilters?: Record<string, any>;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export interface UseAdvancedSearchReturn<T> {
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filter state
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  
  // Sort state
  sortBy: string;
  setSortBy: (field: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Results
  filteredData: T[];
  totalCount: number;
  filteredCount: number;
  
  // Utilities
  isFiltered: boolean;
  hasActiveFilters: boolean;
  resetAll: () => void;
}

export function useAdvancedSearch<T>({
  data,
  config,
  initialSearchTerm = '',
  initialFilters = {},
  initialSortBy = '',
  initialSortOrder = 'asc'
}: UseAdvancedSearchProps<T>): UseAdvancedSearchReturn<T> {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = 'all';
      return acc;
    }, {} as Record<string, any>);
    setFilters(clearedFilters);
  }, [filters]);

  const resetAll = useCallback(() => {
    setSearchTerm('');
    clearFilters();
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialSortBy, initialSortOrder, clearFilters]);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => 
        config.searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchLower);
          }
          if (Array.isArray(value)) {
            return value.some(v => 
              typeof v === 'string' && v.toLowerCase().includes(searchLower)
            );
          }
          return false;
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        const filterConfig = config.filterFields.find(f => f.key === key);
        if (!filterConfig) return;

        result = result.filter(item => {
          const itemValue = item[key as keyof T];
          
          switch (filterConfig.type) {
            case 'select':
              return itemValue === value;
            case 'multiselect':
              return Array.isArray(value) ? value.includes(itemValue) : itemValue === value;
            case 'boolean':
              return Boolean(itemValue) === Boolean(value);
            case 'range':
              // Assuming value is { min, max }
              if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                const numValue = Number(itemValue);
                return numValue >= value.min && numValue <= value.max;
              }
              return true;
            case 'date':
              // Assuming value is { start, end }
              if (typeof value === 'object' && value.start && value.end) {
                const itemDate = new Date(itemValue as string);
                const startDate = new Date(value.start);
                const endDate = new Date(value.end);
                return itemDate >= startDate && itemDate <= endDate;
              }
              return true;
            default:
              return true;
          }
        });
      }
    });

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy as keyof T];
        const bValue = b[sortBy as keyof T];
        
        let comparison = 0;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = String(aValue).localeCompare(String(bValue));
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortBy, sortOrder, config]);

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');
  const isFiltered = searchTerm.length > 0 || hasActiveFilters;

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredData,
    totalCount: data.length,
    filteredCount: filteredData.length,
    isFiltered,
    hasActiveFilters,
    resetAll
  };
}

export default useAdvancedSearch;