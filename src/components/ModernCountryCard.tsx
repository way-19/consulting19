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
      'montenegro': 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1200'
    };
    
    return capitalImages[countrySlug] || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=1200';
  };

  // Use proper image URL handling with fallback
  const imageUrl = country.image_url 
    ? getPublicImageUrl(country.image_url) 
    : getCapitalImage(country.slug);

  return (
    <Link to={`/countries/${country.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white">
        {/* MODERN IMAGE SECTION */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${country.name} business hub`}
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=1200';
            }}
          />
          
          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
          
          {/* CONTENT OVERLAY */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
            {/* FLAG AND COUNTRY NAME */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-5xl drop-shadow-2xl">{country.flag_emoji || '🌍'}</span>
              <div>
                <h3 className="text-4xl font-bold drop-shadow-2xl">{country.name}</h3>
                <p className="text-white/90 text-lg font-medium">{country.primary_language?.toUpperCase() || 'EN'} • Business Hub</p>
              </div>
            </div>
            
            {/* DESCRIPTION */}
            <p className="text-white/95 text-lg mb-6 line-clamp-2 leading-relaxed">
              {country.description || 'Strategic location with exceptional business opportunities'}
            </p>
            
            {/* HIGHLIGHTS */}
            {country.highlights && country.highlights.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {country.highlights.slice(0, 3).map((highlight, index) => (
                  <span 
                    key={index}
                    className="bg-white/25 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/30"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}
            
            {/* STATS AND CTA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-white/80" />
                  <span className="text-lg text-white/95 font-medium">2.4k+ companies</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg text-white/95 font-medium">4.9</span>
                </div>
              </div>
              <div className="bg-white/25 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center space-x-3 border border-white/30">
                <span className="text-lg">Explore</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModernCountryCard;