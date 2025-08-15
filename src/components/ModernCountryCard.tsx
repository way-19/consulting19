import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Building, MapPin, Globe, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { Country } from '../hooks/useCountries';
import { getPublicImageUrl } from '../lib/supabase';

interface ModernCountryCardProps {
  country: Country;
}

const ModernCountryCard: React.FC<ModernCountryCardProps> = ({ country }) => {
  // Enhanced capital city images with better fallbacks
  const getCapitalImage = (countrySlug: string) => {
    const capitalImages: Record<string, string> = {
      'georgia': 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'estonia': 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'uae': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'malta': 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'switzerland': 'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'portugal': 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'spain': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'usa': 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'panama': 'https://images.pexels.com/photos/3225530/pexels-photo-3225530.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'montenegro': 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'turkey': 'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'germany': 'https://images.pexels.com/photos/161901/pexels-photo-161901.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'cyprus': 'https://images.pexels.com/photos/2901215/pexels-photo-2901215.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'ireland': 'https://images.pexels.com/photos/2416653/pexels-photo-2416653.jpeg?auto=compress&cs=tinysrgb&w=1200'
    };
    
    return capitalImages[countrySlug] || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=1200';
  };

  // Use proper image URL handling with fallback
  const imageUrl = country.image_url 
    ? getPublicImageUrl(country.image_url) 
    : getCapitalImage(country.slug);

  return (
    <Link to={`/countries/${country.slug}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white h-full flex flex-col">
        {/* IMAGE SECTION */}
        <div className="relative h-64 overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={`${country.name} business hub`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=1200';
            }}
          />
          
          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* FLAG AND COUNTRY NAME */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl drop-shadow-2xl">{country.flag_emoji || '🌍'}</span>
              <div>
                <h3 className="text-2xl font-bold text-white drop-shadow-2xl">{country.name}</h3>
                <p className="text-white/90 text-sm font-medium">{country.primary_language?.toUpperCase() || 'EN'} • Business Hub</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CONTENT SECTION */}
        <div className="p-6 flex-1 flex flex-col">
          {/* DESCRIPTION */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {country.description || 'Strategic location with exceptional business opportunities'}
          </p>
          
          {/* HIGHLIGHTS */}
          {country.highlights && country.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {country.highlights.slice(0, 2).map((highlight, index) => (
                <span 
                  key={index}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
          
          {/* STATS AND CTA */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">2.4k+</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600 font-medium">4.9</span>
              </div>
            </div>
            <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm">
              <span>Explore</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModernCountryCard;