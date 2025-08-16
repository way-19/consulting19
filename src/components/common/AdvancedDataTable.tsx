import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T> {
  label: string;
  icon: React.ComponentType<any>;
  onClick: (item: T) => void;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  show?: (item: T) => boolean;
}

export interface AdvancedDataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyState?: {
    icon: React.ComponentType<any>;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getItemId?: (item: T) => string;
  className?: string;
  compact?: boolean;
}

const AdvancedDataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyState,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId = (item) => item.id,
  className = '',
  compact = false
}: AdvancedDataTableProps<T>) => {
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    if (sortBy === column.key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column.key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

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
  }, [data, sortBy, sortOrder]);

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getItemId));
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (!onSelectionChange) return;

    if (selectedItems.includes(itemId)) {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    } else {
      onSelectionChange([...selectedItems, itemId]);
    }
  };

  const getActionColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 hover:bg-blue-50';
      case 'green': return 'text-green-600 hover:bg-green-50';
      case 'red': return 'text-red-600 hover:bg-red-50';
      case 'yellow': return 'text-yellow-600 hover:bg-yellow-50';
      case 'purple': return 'text-purple-600 hover:bg-purple-50';
      default: return 'text-gray-600 hover:bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center ${className}`}>
        <emptyState.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
        <p className="text-gray-600 mb-6">{emptyState.description}</p>
        {emptyState.action && (
          <button
            onClick={emptyState.action.onClick}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            {emptyState.action.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className={`grid gap-4 ${compact ? 'px-4 py-3' : 'px-6 py-4'} text-sm font-medium text-gray-700`}>
          {selectable && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === data.length && data.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
            </div>
          )}
          {columns.map((column) => (
            <div
              key={column.key as string}
              className={`flex items-center space-x-1 ${column.width || ''} ${
                column.align === 'center' ? 'justify-center' :
                column.align === 'right' ? 'justify-end' : 'justify-start'
              }`}
            >
              {column.sortable ? (
                <button
                  onClick={() => handleSort(column)}
                  className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                >
                  <span>{column.label}</span>
                  {sortBy === column.key && (
                    sortOrder === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </button>
              ) : (
                <span>{column.label}</span>
              )}
            </div>
          ))}
          {actions.length > 0 && (
            <div className="text-center">Actions</div>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {sortedData.map((item) => {
          const itemId = getItemId(item);
          const isSelected = selectedItems.includes(itemId);
          
          return (
            <div
              key={itemId}
              className={`grid gap-4 ${compact ? 'px-4 py-3' : 'px-6 py-4'} hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-purple-50' : ''
              }`}
            >
              {selectable && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(itemId)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
              )}
              {columns.map((column) => (
                <div
                  key={column.key as string}
                  className={`${column.width || ''} ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.render ? (
                    column.render(item[column.key], item)
                  ) : (
                    <span className="text-sm text-gray-900">
                      {String(item[column.key] || '')}
                    </span>
                  )}
                </div>
              ))}
              {actions.length > 0 && (
                <div className="flex items-center justify-center space-x-1">
                  {actions
                    .filter(action => !action.show || action.show(item))
                    .map((action, index) => (
                      <button
                        key={index}
                        onClick={() => action.onClick(item)}
                        className={`p-2 rounded-lg transition-colors ${getActionColor(action.color || 'gray')}`}
                        title={action.label}
                      >
                        <action.icon className="h-4 w-4" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedDataTable;