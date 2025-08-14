import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Globe, Users, TrendingUp, MessageSquare, CheckCircle, Star, Award, Shield, Zap, Clock } from 'lucide-react';
import { useCountries } from '../hooks/useCountries';

const HomePage = () => {
  const { countries, loading } = useCountries(true);

  // Get first 8 active countries for AI recommendations
  const recommendedCountries = countries.slice(0, 8);

  const features = [
    {
      icon: Bot,
      title: 'AI Oracle Intelligence',
      description: 'Advanced AI system that analyzes your business needs and matches you with the perfect jurisdiction and consultant',
      color: 'bg-purple-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Expert consultants in 127+ countries providing local expertise with international standards',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Expert Consultants',
      description: 'Specialized consultants with deep knowledge of local regulations and business practices',
      color: 'bg-green-500'
    },
    {
      icon: TrendingUp,
      title: 'Proven Success',
      description: '98.5% success rate with over 15,000 businesses formed through our platform',
      color: 'bg-orange-500'
    }
  ];

  const services = [
    {
      title: 'Company Formation',
      description: 'Complete business registration and setup services',
      icon: '🏢',
      features: ['Legal entity registration', 'Tax number acquisition', 'Corporate documentation']
    },
    {
      title: 'Banking Solutions',
      description: 'International banking and account opening services',
      icon: '🏦',
      features: ['Business account opening', 'Multi-currency accounts', 'Online banking setup']
    },
    {
      title: 'Tax Optimization',
      description: 'Strategic tax planning and compliance services',
      icon: '📊',
      features: ['Tax residency planning', 'Compliance monitoring', 'Optimization strategies']
    },
    {
      title: 'Legal Consulting',
      description: 'Expert legal guidance and documentation',
      icon: '⚖️',
      features: ['Contract drafting', 'Regulatory compliance', 'Legal structure advice']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechStart Global',
      country: 'Estonia',
      rating: 5,
      text: 'The AI Oracle helped us choose Estonia for our tech startup. The process was seamless and our consultant was incredibly knowledgeable.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Ahmed Al-Rashid',
      company: 'Global Trading LLC',
      country: 'UAE',
      rating: 5,
      text: 'Outstanding service! They handled our UAE company formation perfectly. The multilingual support was a game-changer.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Maria Rodriguez',
      company: 'European Ventures',
      country: 'Malta',
      rating: 5,
      text: 'Professional, efficient, and reliable. Our Malta company is now operational thanks to their expert guidance.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Bot className="h-12 w-12 text-white" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Globe className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              World's First{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI-Enhanced
              </span>{' '}
              Business Consulting
            </h1>
            
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionary AI Oracle technology combined with expert human consultants. 
              Get instant, intelligent guidance for your international business journey.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/ai-assistant"
                className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
              >
                <Bot className="h-5 w-5" />
                <span>Try AI Oracle</span>
              </Link>
              <Link
                to="/countries"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Explore Countries
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>15,000+ Businesses Formed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>98.5% Success Rate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-400" />
                <span>127+ Countries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Country Recommendations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Country <span className="text-purple-600">Recommendations</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced AI analyzes your business needs with intelligent guidance from our AI-powered consultants and comprehensive business services.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              recommendedCountries.map((country, index) => {
                // Predefined scores and features for consistency
                const countryData = {
                  'georgia': { score: 95, feature: 'Tax advantages' },
                  'estonia': { score: 92, feature: 'Digital innovation' },
                  'uae': { score: 88, feature: 'Strategic location' },
                  'malta': { score: 87, feature: 'EU membership' },
                  'switzerland': { score: 90, feature: 'Financial hub' },
                  'portugal': { score: 86, feature: 'EU access' },
                  'spain': { score: 84, feature: 'Market access' },
                  'usa': { score: 89, feature: 'Global market' }
                };

                const data = countryData[country.slug as keyof typeof countryData] || { score: 85, feature: 'Business friendly' };

                return (
                  <div key={country.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="text-2xl mb-2">{country.flag_emoji || '🌍'}</div>
                      <div className="text-sm font-bold text-gray-900 mb-1">{country.name}</div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">{data.score}%</div>
                      <div className="text-xs text-gray-600 mb-3">{data.feature}</div>
                      <Link
                        to={`/countries/${country.slug}`}
                        className="text-purple-600 hover:text-purple-700 text-xs font-medium flex items-center justify-center space-x-1"
                      >
                        <span>Learn More</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-center">
            <Link
              to="/countries"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <span>View All Countries</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-purple-600">Consulting19</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI technology meets human expertise to deliver unparalleled business consulting services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive <span className="text-purple-600">Business Services</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From company formation to ongoing compliance, we provide end-to-end business solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by <span className="text-purple-600">Global Entrepreneurs</span>
            </h2>
            <p className="text-lg text-gray-600">
              See what our clients say about their experience with our AI-enhanced consulting platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                    <p className="text-xs text-purple-600">{testimonial.country}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Global Business Journey?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Get personalized AI-powered recommendations and expert guidance from our global consultants
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/ai-assistant"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <Bot className="h-5 w-5" />
              <span>Start with AI Oracle</span>
            </Link>
            <Link
              to="/get-started"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;