import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { CustomService } from '../hooks/useServices';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  service: CustomService;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // Map service category to icon
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'company_formation':
      case 'business': return Icons.Building2;
      case 'accounting': return Icons.Calculator;
      case 'legal': return Icons.Scale;
      case 'banking': return Icons.CreditCard;
      case 'tax': return Icons.Receipt;
      case 'consultation': return Icons.MessageSquare;
      case 'document': return Icons.FileText;
      case 'certification': return Icons.Award;
      default: return Icons.Settings;
    }
  };

  const IconComponent = getServiceIcon(service.category);

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with colored background */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 relative">
        {service.category === 'company_formation' && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 text-yellow-300 fill-current" />
          </div>
        )}
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{service.title}</h3>
            <p className="text-white/80 text-sm">{service.category.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Features */}
        <div className="space-y-2 mb-6">
          {service.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Price and Delivery */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              ${service.price.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-1">{service.currency}</span>
            </div>
            <div className="text-sm text-gray-500">
              {service.delivery_time_days} days
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/services/${service.id}`}
          className="group/cta w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Order Now</span>
          <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Popular badge for company formation */}
      {service.category === 'company_formation' && (
        <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold">
          Popular
        </div>
      )}
    </div>
  );
};

export default ServiceCard;