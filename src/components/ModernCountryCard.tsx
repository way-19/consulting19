import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Globe, TrendingUp, Building, MapPin } from 'lucide-react';
import { Country } from '../hooks/useCountries';

interface ModernCountryCardProps {
  country: Country;
}

const ModernCountryCard: React.FC<ModernCountryCardProps> = ({ country }) => {
  // Modern capital city images
  const getCapitalImage = (countrySlug: string) => {
    const capitalImages: Record<string, string> = {
      'georgia': 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800',
      'estonia': 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=800',
      'uae': 'https://images.pexels.com/photos/1470405/pexels-photo-1470405.jpeg?auto=compress&cs=tinysrgb&w=800',
      'malta': 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
      'switzerland': 'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg?auto=compress&cs=tinysrgb&w=800',
      'portugal': 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800',
      'spain': 'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800',
      'usa': 'https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=800',
      'panama': 'https://images.pexels.com/photos/3225530/pexels-photo-3225530.jpeg?auto=compress&cs=tinysrgb&w=800',
      'montenegro': 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    
    return capitalImages[countrySlug] || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  const imageUrl = country.image_url || getCapitalImage(country.slug);

  return (
    <Link to={`/countries/${country.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 bg-white">
        {/* ULTRA MODERN IMAGE SECTION */}
        <div className="relative h-[500px] overflow-hidden">
          <img
            src={imageUrl}
            alt={`${country.name} capital city`}
            className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800';
            }}
          />
          
          {/* DRAMATIC GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
          
          {/* ULTRA MODERN CONTENT OVERLAY */}
          <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
            {/* FLAG AND COUNTRY NAME */}
            <div className="flex items-center space-x-6 mb-8">
              <span className="text-7xl drop-shadow-2xl filter brightness-110">{country.flag_emoji || '🌍'}</span>
              <div>
                <h3 className="text-5xl font-black drop-shadow-2xl tracking-tight">{country.name}</h3>
                <p className="text-white/95 text-xl font-bold tracking-wide">{country.primary_language?.toUpperCase() || 'EN'} • BUSINESS HUB</p>
              </div>
            </div>
            
            {/* DESCRIPTION */}
            <p className="text-white/95 text-xl mb-8 line-clamp-2 leading-relaxed font-medium">
              {country.description || 'Strategic location offering exceptional business opportunities'}
            </p>
            
            {/* HIGHLIGHTS */}
            {country.highlights && country.highlights.length > 0 && (
              <div className="flex flex-wrap gap-4 mb-8">
                {country.highlights.slice(0, 3).map((highlight, index) => (
                  <span 
                    key={index}
                    className="bg-white/30 backdrop-blur-xl text-white px-6 py-3 rounded-full text-sm font-bold border border-white/40 shadow-lg"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}
            
            {/* STATS AND CTA BUTTON */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <Building className="h-6 w-6 text-white/90" />
                  <span className="text-xl text-white/95 font-bold">2.4k+ companies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                  <span className="text-xl text-white/95 font-bold">4.9</span>
                </div>
              </div>
              <div className="bg-white/30 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-black hover:bg-white hover:text-gray-900 transition-all duration-300 flex items-center space-x-4 border border-white/40 shadow-xl">
                <span className="text-xl">EXPLORE NOW</span>
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModernCountryCard;