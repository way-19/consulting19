import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Globe, Users, Award, TrendingUp, Shield, Zap, Clock, CheckCircle, Star, MessageSquare, Building, CreditCard, Calculator, Target } from 'lucide-react';
import { useCountries } from '../hooks/useCountries';
import ModernCountryCard from '../components/ModernCountryCard';

const HomePage = () => {
  const { countries, loading: countriesLoading, error: countriesError } = useCountries(true);

  const stats = [
    { value: '15,000+', label: 'Businesses Formed', icon: Building },
    { value: '127', label: 'Countries Served', icon: Globe },
    { value: '98.5%', label: 'Success Rate', icon: Star },
    { value: '24/7', label: 'AI Support', icon: Bot }
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI Oracle Intelligence',
      description: 'Advanced AI system that analyzes your business needs and matches you with the perfect jurisdiction',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI recommendation is verified by our legal experts to ensure compliance',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: '24/7 AI assistance with real-time responses and immediate consultant matching',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Expert Consultants',
      description: 'AI-powered efficiency combined with human expertise for complex requirements',
      color: 'bg-orange-500'
    }
  ];

  const services = [
    {
      icon: Building,
      title: 'Company Formation',
      description: 'Complete business registration and setup services',
      price: 'From $2,500'
    },
    {
      icon: CreditCard,
      title: 'Banking Solutions',
      description: 'Bank account opening and financial services',
      price: 'From $800'
    },
    {
      icon: Calculator,
      title: 'Accounting Services',
      description: 'Professional bookkeeping and tax compliance',
      price: 'From $500/month'
    },
    {
      icon: Shield,
      title: 'Legal Consulting',
      description: 'Expert legal advice and document preparation',
      price: 'From $300'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              World's First{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI-Enhanced
              </span>{' '}
              Business Consulting
            </h1>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Revolutionary AI technology meets human expertise. Get instant, intelligent 
              guidance for your international business formation and growth strategies.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/get-started"
                className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/ai-assistant"
                className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center space-x-2"
              >
                <Bot className="h-5 w-5" />
                <span>Try AI Oracle</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 group-hover:shadow-lg transition-shadow">
                  <stat.icon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Country Recommendations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Country <span className="text-purple-600">Recommendations</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Advanced AI analyzes your business needs with intelligent guidance from our AI-powered 
              consultants and comprehensive business services.
            </p>
          </div>

          {countriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : countriesError ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Countries Temporarily Unavailable</h3>
              <p className="text-gray-600">Please try again later or contact support.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {countries.slice(0, 8).map((country) => (
                  <ModernCountryCard key={country.id} country={country} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  to="/countries"
                  className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <span>View All Countries</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Revolutionary <span className="text-yellow-300">AI Technology</span>
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              We've revolutionized business consulting by integrating advanced AI technology 
              with human expertise, creating an unprecedented level of service and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-purple-100 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600">Comprehensive business solutions for your international expansion</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow group">
                <div className="bg-purple-100 rounded-lg p-3 w-fit mb-4 group-hover:bg-purple-200 transition-colors">
                  <service.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-purple-600">{service.price}</span>
                  <Link
                    to="/services"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="bg-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Global Business?</h2>
          <p className="text-lg text-purple-100 mb-8">
            Join thousands of entrepreneurs who trust our AI-enhanced platform for their international business needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/get-started"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Contact Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;