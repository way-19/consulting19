import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useCountries } from '../hooks/useCountries';
import { useServiceCategories } from '../hooks/useServices';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../contexts/LanguageContext';

const Footer = () => {
  const { countries } = useCountries();
  const { categories: serviceCategories } = useServiceCategories();
  const { t } = useTranslation();
  
  const popularCountries = countries.filter(country => country.is_active).slice(0, 5);

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <img 
                src="/image.png" 
                alt="Consulting19 Logo" 
                className="h-12 w-26"
                onError={(e) => {
                  // Fallback to icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe className="h-12 w-26 text-purple-400 hidden" />
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              AI-enhanced global business consulting. Expert guidance for international 
              business formation and growth strategies.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">hello@consulting19.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">Global Operations</span>
              </div>
            </div>
          </div>

          {/* Popular Countries */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Popular Countries</h3>
            <div className="space-y-3">
              {popularCountries.map((country) => (
                <Link
                  key={country.id}
                  to={`/countries/${country.slug}`}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors group"
                >
                  <span>{country.flag_emoji}</span>
                  <span>{country.name}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
            <Link
              to="/countries"
              className="text-purple-400 hover:text-purple-300 font-medium text-sm mt-4 inline-block"
            >
              View All Countries →
            </Link>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Services</h3>
            <div className="space-y-3">
              {serviceCategories.map((category) => (
                <Link
                  key={category}
                  to={`/services?category=${encodeURIComponent(category)}`}
                  className="block text-slate-300 hover:text-white transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
            <Link
              to="/services"
              className="text-purple-400 hover:text-purple-300 font-medium text-sm mt-4 inline-block"
            >
              All Services →
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/about" className="block text-slate-300 hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/blog" className="block text-slate-300 hover:text-white transition-colors">
                Global Insights
              </Link>
              <Link to="/ai-assistant" className="block text-slate-300 hover:text-white transition-colors">
                AI Assistant
              </Link>
              <Link to="/contact" className="block text-slate-300 hover:text-white transition-colors">
                Contact Support
              </Link>
              <Link to="/privacy" className="block text-slate-300 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-slate-300 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-slate-300">Get the latest insights from our global consultants</p>
            </div>
            <form className="flex space-x-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-400 text-sm">
              © 2025 Consulting19. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-400 text-sm">Powered by AI Oracle</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-slate-400 text-sm">All systems operational</span>
              </div>
              <LanguageSelector variant="footer" showLabel={false} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;