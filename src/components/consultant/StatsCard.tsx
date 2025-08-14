import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
  changeType = 'neutral',
  description
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-700 bg-green-100';
      case 'negative': return 'text-red-700 bg-red-100';
      default: return 'text-blue-700 bg-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} rounded-xl p-3 shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${getChangeColor()}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;