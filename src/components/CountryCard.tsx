import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Country } from '../hooks/useCountries';

interface CountryCardProps {
  country: Country;
  featured?: boolean;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, featured = false }) => {
  return (
    <div className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${featured ? 'ring-2 ring-purple-500' : ''}`}>
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={getPublicImageUrl(country.image_url) || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={country.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Flag */}
        <div className="absolute top-4 right-4 text-3xl drop-shadow-lg">
          {country.flag_emoji || '🌍'}
        </div>

        {/* Tags */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1">
          {country.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="bg-white/90 text-gray-800 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
            {country.name}
          </h3>
          {featured && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-semibold">
              Popular
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {country.description}
        </p>

        {/* Highlights */}
        <div className="space-y-2 mb-6">
          {country.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{highlight}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          to={`/countries/${country.slug}`}
          className="group/cta w-full bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Learn More</span>
          <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default CountryCard;