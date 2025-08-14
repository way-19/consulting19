import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Globe, TrendingUp } from 'lucide-react';
import { Country } from '../hooks/useCountries';

interface CountryCardProps {
  country: Country;
}

const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  // Capital city images mapping for better visuals
  const getCapitalImage = (countrySlug: string) => {
    const capitalImages: Record<string, string> = {
      'georgia': 'https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800',
      'estonia': 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800',
      'uae': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=800',
      'malta': 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
      'switzerland': 'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=800',
      'portugal': 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
      'spain': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800',
      'usa': 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=800',
      'panama': 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=800',
      'montenegro': 'https://images.pexels.com/photos/3225530/pexels-photo-3225530.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    
    return capitalImages[countrySlug] || 'https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  const imageUrl = country.image_url || getCapitalImage(country.slug);

  return (
    <Link to={`/countries/${country.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
        {/* Background Image */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${country.name} capital city`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/3225528/pexels-photo-3225528.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          {/* Content overlay */}
          <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
            {/* Country flag and name */}
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl drop-shadow-lg">{country.flag_emoji || '🌍'}</span>
              <div>
                <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">{country.name}</h3>
                <p className="text-white/90 text-sm">
                  {country.primary_language?.toUpperCase() || 'EN'} • Business Hub
                </p>
              </div>
            </div>
            
            {/* Key highlights as badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(country.highlights || ['Tax Advantages', 'Easy Setup']).slice(0, 2).map((highlight, index) => (
                <span 
                  key={index}
                  className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30"
                >
                  {highlight}
                </span>
              ))}
            </div>
            
            {/* Stats row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-white/80" />
                  <span className="text-sm text-white/90">2.4k+ businesses</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-white/90">4.9</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300 font-medium">95% success</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/80">
                {country.description ? country.description.slice(0, 50) + '...' : 'Strategic business location'}
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 border border-white/30 flex items-center space-x-2 group-hover:scale-105">
                <span>Explore</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section with additional info */}
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">
                {(country.supported_languages || ['en']).length} languages
              </span>
            </div>
            <div className="text-sm font-medium text-purple-600">
              Learn More →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CountryCard;