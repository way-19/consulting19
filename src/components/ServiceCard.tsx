import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import { Service } from '../data/services';
import * as Icons from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const IconComponent = Icons[service.icon as keyof typeof Icons] as any;

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with colored background */}
      <div className={`${service.color} px-6 py-4 relative`}>
        {service.popular && (
          <div className="absolute top-2 right-2">
            <Star className="h-5 w-5 text-yellow-300 fill-current" />
          </div>
        )}
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{service.name}</h3>
            <p className="text-white/80 text-sm">{service.category}</p>
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
              <div className={`w-1.5 h-1.5 rounded-full ${service.color.replace('bg-', 'bg-')}`} />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Get personalized pricing from our expert consultants
          </p>
        </div>

        {/* CTA */}
        <Link
          to={`/services/${service.slug}`}
          className={`group/cta w-full ${service.color} text-white px-4 py-3 rounded-lg font-medium hover:opacity-90 transition-all duration-200 flex items-center justify-center space-x-2`}
        >
          <span>Get Quote</span>
          <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Popular badge */}
      {service.popular && (
        <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-md text-xs font-bold">
          Popular
        </div>
      )}
    </div>
  );
};

export default ServiceCard;