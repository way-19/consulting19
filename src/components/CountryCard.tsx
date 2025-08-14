import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Globe, TrendingUp, Building, MapPin } from 'lucide-react';
import { Country } from '../hooks/useCountries';

interface CountryCardProps {
  country: Country;
}

const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  // Capital city images mapping
  const getCapitalImage = (countrySlug: string) => {
    const capitalImages: Record<string, string> = {
      'georgia': 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=600',
      'estonia': 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600',
      'uae': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=600',
      'malta': 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=600',
      'switzerland': 'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=600',
      'portugal': 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600',
      'spain': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=600',
      'usa': 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=600',
      'panama': 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=600',
      'montenegro': 'https://images.pexels.com/photos/3225530/pexels-photo-3225530.jpeg?auto=compress&cs=tinysrgb&w=600'
    };
    
    return capitalImages[countrySlug] || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const imageUrl = country.image_url || getCapitalImage(country.slug);

  return (
    <Link to={`/countries/${country.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
        {/* Background Image */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${country.name}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=600';
            }}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Content overlay */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            {/* Flag and name */}
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-4xl drop-shadow-lg">{country.flag_emoji || '🌍'}</span>
              <div>
                <h3 className="text-3xl font-bold drop-shadow-lg">{country.name}</h3>
                <p className="text-white/80 text-sm">{country.primary_language?.toUpperCase() || 'EN'} • Business Hub</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-white/90 text-sm mb-4 line-clamp-2">
              {country.description || 'Strategic business location with excellent opportunities'}
            </p>
            
            {/* Highlights */}
            {country.highlights && country.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {country.highlights.slice(0, 2).map((highlight, index) => (
                  <span 
                    key={index}
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}
            
            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Building className="h-4 w-4 text-white/70" />
                  <span className="text-sm text-white/90">2.4k+ companies</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-white/90">4.9</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center space-x-2">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CountryCard;