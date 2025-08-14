import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Globe, MapPin, Users, Star, TrendingUp } from 'lucide-react';
import { Country } from '../hooks/useCountries';
import { getPublicImageUrl } from '../lib/supabase';

interface CountryCardProps {
  country: Country;
  featured?: boolean;
}

const CountryCard: React.FC<CountryCardProps> = ({ country, featured = false }) => {
  // High-quality capital city images from Pexels
  const getCapitalImageUrl = (countrySlug: string) => {
    switch (countrySlug) {
      case 'georgia': return 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800'; // Tbilisi
      case 'estonia': return 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=800'; // Tallinn
      case 'uae': return 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=800'; // Dubai
      case 'malta': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Valletta
      case 'switzerland': return 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=800'; // Zurich
      case 'portugal': return 'https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=800'; // Lisbon
      case 'spain': return 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800'; // Madrid
      case 'usa': return 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=800'; // New York
      case 'turkey': return 'https://images.pexels.com/photos/739407/pexels-photo-739407.jpeg?auto=compress&cs=tinysrgb&w=800'; // Istanbul
      case 'germany': return 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800'; // Berlin
      default: return 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=800'; // Generic city
    }
  };

  return (
    <div className={`group relative rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${featured ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}>
      {/* Image Container with Overlay */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={getPublicImageUrl(country.image_url) || getCapitalImageUrl(country.slug)}
          alt={`${country.name} capital city`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        {/* Flag Badge */}
        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
          <span className="text-3xl drop-shadow-lg">{country.flag_emoji || '🌍'}</span>
        </div>

        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
            ⭐ Featured
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
          {/* Country Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">2.4k+ businesses</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-300 fill-current" />
                  <span className="text-sm font-medium">4.9</span>
                </div>
              </div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-green-400/30">
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-300" />
                <span className="text-sm font-medium text-green-300">98.5% success</span>
              </div>
            </div>
          </div>

          {/* Country Name and Description */}
          <h3 className="text-3xl font-bold mb-3 group-hover:text-yellow-300 transition-colors duration-300">
            {country.name}
          </h3>
          <p className="text-white/90 text-sm mb-4 leading-relaxed line-clamp-2">
            {country.description || 'Strategic business jurisdiction with excellent opportunities for international entrepreneurs and investors.'}
          </p>

          {/* Key Highlights */}
          <div className="flex flex-wrap gap-2 mb-6">
            {country.highlights.slice(0, 3).map((highlight, index) => (
              <span 
                key={index}
                className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30"
              >
                {highlight}
              </span>
            ))}
            {country.highlights.length === 0 && (
              <>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                  Tax Advantages
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                  Easy Setup
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                  Expert Support
                </span>
              </>
            )}
          </div>

          {/* Language and Location Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4 text-white/80" />
                <span className="text-white/80">{country.primary_language.toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-white/80" />
                <span className="text-white/80">Strategic Location</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">Available</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            to={`/countries/${country.slug}`}
            className="group/cta bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center justify-center space-x-2 border border-white/30 hover:border-transparent shadow-lg hover:shadow-xl"
          >
            <span>Explore {country.name}</span>
            <ArrowRight className="h-5 w-5 group-hover/cta:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Hover Effect Glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default CountryCard;