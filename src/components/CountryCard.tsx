import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Globe } from 'lucide-react';
import { Country } from '../hooks/useCountries';
import { getPublicImageUrl } from '../lib/supabase';

interface CountryCardProps {
  country: Country;
  featured?: boolean;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, featured = false }) => {
  // Fallback Pexels images for popular capitals if image_url is not provided
  const getCapitalImageUrl = (countrySlug: string) => {
    switch (countrySlug) {
      case 'georgia': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Tbilisi
      case 'estonia': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Tallinn
      case 'uae': return 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=800'; // Dubai
      case 'malta': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Valletta
      case 'switzerland': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Bern
      case 'portugal': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Lisbon
      case 'spain': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Madrid
      case 'usa': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // New York
      default: return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Generic city
    }
  };

  return (
    <div className={`group relative rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${featured ? 'ring-2 ring-purple-500' : ''}`}>
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={getPublicImageUrl(country.image_url) || getCapitalImageUrl(country.slug)}
          alt={country.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Flag */}
        <div className="absolute top-4 right-4 text-4xl drop-shadow-lg">
          {country.flag_emoji || '🌍'}
        </div>

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-1 group-hover:text-purple-300 transition-colors">
            {country.name}
          </h3>
          <p className="text-sm text-white/80 mb-3 line-clamp-2">
            {country.description}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4 text-white/80" />
              <span>{country.primary_language.toUpperCase()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>{country.highlights.length} Key Benefits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 bg-white">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Highlights</h4>
        <div className="space-y-3 mb-6">
          {country.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{highlight}</span>
            </div>
          ))}
          {country.highlights.length === 0 && (
            <p className="text-sm text-gray-500">No specific highlights available.</p>
          )}
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

      {/* Optional: Add a subtle border or shadow on hover for the whole card */}
    </div>
  );
};

export default CountryCard;