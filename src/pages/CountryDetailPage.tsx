import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Globe, Users, TrendingUp, MessageCircle } from 'lucide-react';
import { useCountry } from '../hooks/useCountries';
import { useServices } from '../hooks/useServices';

const CountryDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { country, loading, error } = useCountry(slug || '');
  const { services: countryServices, loading: servicesLoading } = useServices(true, country?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Country Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/countries" className="text-purple-600 hover:text-purple-700">
            ← Back to Countries
          </Link>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      question: 'How long does it take to register a company in Georgia?',
      answer: ''
    },
    {
      question: 'What are the tax advantages of Georgian companies?',
      answer: ''
    },
    {
      question: 'Can non-residents open bank accounts in Georgia?',
      answer: ''
    },
    {
      question: 'What is the minimum share capital required?',
      answer: ''
    },
    {
      question: 'Do I need to visit Georgia to start a business?',
      answer: ''
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img
          src={getPublicImageUrl(country.image_url) || 'https://images.pexels.com/photos/12461/pexels-photo-12461.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={country.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-4xl">{country.flag_emoji || '🌍'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{country.name}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Easy company formation and tax advantages with dedicated consultant support
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Georgia Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Georgia?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Strategic gateway between Europe and Asia with exceptional business opportunities. 
                Our expert consultants provide comprehensive guidance to help you establish and grow 
                your business in this dynamic jurisdiction.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{country.highlights[0] || 'Easy company formation process'}</h4>
                    <p className="text-sm text-gray-600">
                      Professional Service - Comprehensive support and guidance available
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{country.highlights[1] || '0% tax on foreign sourced income'}</h4>
                    <p className="text-sm text-gray-600">
                      Professional Service - Comprehensive support and guidance available
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{country.highlights[2] || 'Free economic zones available'}</h4>
                    <p className="text-sm text-gray-600">
                      Professional Service - Comprehensive support and guidance available
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Facts</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Primary Language</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{country.primary_language.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Active Businesses</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">2,400+</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Success Rate</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">98.5%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Avg Response</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">&lt; 2 hours</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    to="/get-started"
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Start in Georgia</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services in Georgia */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services in Georgia
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive business solutions tailored for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : countryServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">No services available for this country yet.</p>
              </div>
            ) : (
              countryServices.map((service) => (
                <div key={service.id} className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                      <h3 className="text-2xl font-bold mb-3 leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-white/90 text-sm mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      
                      {/* Features as small badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.features.slice(0, 2).map((feature, index) => (
                          <span 
                            key={index}
                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/30"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* CTA Button */}
                      <Link
                        to={`/services/${service.id}`}
                        className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 border border-white/30 w-fit relative z-10"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="h-4 w-4 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ and Latest Insights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* FAQ Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 mb-8">
                Get answers to common questions about doing business in {country.name}
              </p>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                    <button className="w-full text-left flex items-center justify-between">
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Insights */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Latest Insights from {country.name}
              </h2>
              <p className="text-gray-600 mb-8">
                Expert updates and market intelligence from our {country.name} specialists
              </p>

              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="bg-white/20 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Market Update
                  </span>
                  <span className="text-white/80 text-sm">• 5 min read</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  New Investment Opportunities in {country.name} 2024
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  Latest developments in {country.name}'s business landscape and emerging opportunities for international investors.
                </p>
                <button className="text-white hover:text-white/80 font-medium text-sm flex items-center space-x-1">
                  <span>Read More</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Business in {country.name}?
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            Get expert guidance and personalized support for your business journey
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Schedule Free Consultation
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm">
              View All Services
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CountryDetailPage;