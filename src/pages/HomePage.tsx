import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Globe, Users, TrendingUp, MessageSquare, CheckCircle, Star, Building, Zap, Shield, Clock } from 'lucide-react';
import { useCountries } from '../hooks/useCountries';
import ModernCountryCard from '../components/ModernCountryCard';

const HomePage = () => {
  const { countries, loading } = useCountries(true);

  // Get all active countries for the homepage
  const featuredCountries = countries.filter(country => 
    country.is_active && country.slug !== 'singapore'
  ).slice(0, 12); // Show up to 12 countries

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Bot className="h-12 w-12 text-white" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Globe className="h-12 w-12 text-yellow-300" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              World's First{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                AI-Enhanced
              </span>{' '}
              Business Consulting
            </h1>
            <p className="text-xl text-purple-100 max-w-4xl mx-auto mb-8 leading-relaxed">
              Revolutionary AI Oracle technology combined with expert human consultants. 
              Get instant, intelligent guidance for international business formation across 127+ countries.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/get-started"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center space-x-2"
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
            <div className="flex items-center justify-center space-x-8 text-sm mt-8">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-300" />
                <span>8+ Years Experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-yellow-300" />
                <span>15,000+ Businesses Formed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-300" />
                <span>98.5% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered <span className="text-purple-600">Business Intelligence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI technology that analyzes your business needs and provides 
              intelligent recommendations verified by legal experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI Oracle Intelligence',
                description: 'Advanced AI analyzes your needs and matches perfect jurisdictions',
                color: 'bg-purple-500'
              },
              {
                icon: Shield,
                title: 'Legal Verification',
                description: 'Every AI recommendation verified by legal experts',
                color: 'bg-green-500'
              },
              {
                icon: Zap,
                title: 'Instant Processing',
                description: '24/7 AI assistance with real-time responses',
                color: 'bg-blue-500'
              },
              {
                icon: Users,
                title: 'Expert Consultants',
                description: 'Human expertise for complex business requirements',
                color: 'bg-orange-500'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section id="countries" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-purple-600">Perfect Jurisdiction</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive guide to the world's most business-friendly countries. 
              Find the perfect jurisdiction for your international business goals.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredCountries.map((country) => (
                  <ModernCountryCard key={country.id} country={country} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  to="/countries"
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <span>View All Countries</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive <span className="text-purple-600">Business Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From company formation to ongoing compliance, our expert consultants 
              provide end-to-end business solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building,
                title: 'Company Formation',
                description: 'Complete business registration with legal compliance',
                features: ['LLC/Corporation setup', 'Tax registration', 'Legal documentation'],
                price: 'From $2,500',
                popular: true
              },
              {
                icon: Users,
                title: 'Banking Solutions',
                description: 'International banking and account opening services',
                features: ['Business accounts', 'Multi-currency', 'Online banking'],
                price: 'From $800'
              },
              {
                icon: Shield,
                title: 'Legal & Compliance',
                description: 'Ongoing legal support and regulatory compliance',
                features: ['Legal consulting', 'Compliance monitoring', 'Document review'],
                price: 'From $300'
              },
              {
                icon: TrendingUp,
                title: 'Tax Optimization',
                description: 'Strategic tax planning and residency services',
                features: ['Tax residency', 'Optimization strategies', 'Annual filing'],
                price: 'From $1,500'
              },
              {
                icon: Globe,
                title: 'Visa & Residence',
                description: 'Immigration and residence permit assistance',
                features: ['Visa applications', 'Residence permits', 'Family inclusion'],
                price: 'From $1,200'
              },
              {
                icon: MessageSquare,
                title: 'Ongoing Support',
                description: '24/7 multilingual support and consultation',
                features: ['Expert guidance', 'Multi-language', 'Priority support'],
                price: 'From $500/month'
              }
            ].map((service, index) => (
              <div key={index} className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    Popular
                  </div>
                )}
                
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4`}>
                    <service.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{service.price}</span>
                    <Link
                      to="/services"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-1"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="text-yellow-300">Consulting19</span>?
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              8+ years of excellence in international business consulting with revolutionary AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI-Powered',
                description: 'World\'s first AI-enhanced business consulting platform',
                stat: '0.3s',
                statLabel: 'Response Time'
              },
              {
                icon: Users,
                title: 'Expert Team',
                description: 'Specialized consultants in 127+ countries worldwide',
                stat: '15,000+',
                statLabel: 'Businesses Formed'
              },
              {
                icon: TrendingUp,
                title: 'Proven Success',
                description: 'Industry-leading success rate with satisfied clients',
                stat: '98.5%',
                statLabel: 'Success Rate'
              },
              {
                icon: Shield,
                title: 'Legal Compliance',
                description: 'Full legal compliance with expert oversight',
                stat: '100%',
                statLabel: 'Compliance Rate'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 group-hover:bg-white/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-yellow-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-purple-100 text-sm mb-4">{feature.description}</p>
                  <div className="text-2xl font-bold text-yellow-300 mb-1">{feature.stat}</div>
                  <div className="text-purple-200 text-xs">{feature.statLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of successful entrepreneurs who trust our AI-enhanced platform 
            for their international business expansion.
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
              Contact Our Experts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;