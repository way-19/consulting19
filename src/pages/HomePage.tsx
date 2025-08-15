import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle, Globe, Star, TrendingUp, Users, Zap, Building, Calculator, Scale, BarChart3, CreditCard, Shield } from 'lucide-react';
import { useCountries } from '../hooks/useCountries';
import CountryCard from '../components/CountryCard';

const HomePage = () => {
  const { countries, loading: countriesLoading } = useCountries(true);
  
  // Get first 6 countries for display
  const featuredCountries = countries.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium text-white">AI-Enhanced Platform</span>
                  </div>
                </div>
                <div className="bg-green-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-green-400/30">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-green-300">Live</span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                World's First{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  AI-Enhanced
                </span>{' '}
                Business Consulting
              </h1>
              
              <p className="text-xl text-purple-100 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Revolutionary platform combining artificial intelligence with human expertise. 
                Get instant guidance, expert matching, and comprehensive support for your 
                international business journey.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <Link
                  to="/get-started"
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <Bot className="h-5 w-5" />
                  <span>Try AI Oracle</span>
                </Link>
                <Link
                  to="/countries"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <Globe className="h-5 w-5" />
                  <span>Explore Countries</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-yellow-300" />
                  <span className="text-white/90">15,000+ Businesses Formed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-300 fill-current" />
                  <span className="text-white/90">4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-yellow-300" />
                  <span className="text-white/90">127 Countries</span>
                </div>
              </div>
            </div>

            {/* Right Content - AI Demo */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">AI Oracle is online</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <p className="text-white/90 text-sm mb-2">👤 "I want to start a tech company with low taxes"</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-300" />
                      <span className="text-blue-200 text-xs font-medium">AI Oracle</span>
                    </div>
                    <p className="text-white text-sm">
                      🤖 Based on your tech startup requirements, I recommend <strong>Estonia</strong> for 
                      e-Residency benefits or <strong>Delaware</strong> for US market access. Both offer 
                      excellent tax advantages for your business model.
                    </p>
                    <div className="mt-3 flex items-center space-x-4 text-xs text-blue-200">
                      <span>✓ Verified by legal experts</span>
                      <span>⚡ Response time: 0.3s</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
                <Zap className="h-6 w-6 text-yellow-900" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-400 rounded-full p-3 shadow-lg animate-pulse">
                <CheckCircle className="h-6 w-6 text-green-900" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by <span className="text-purple-600">Artificial Intelligence</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of business consulting with our revolutionary AI Oracle system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Bot,
                title: 'AI Oracle Intelligence',
                description: 'Advanced AI analyzes your needs and matches you with perfect jurisdictions',
                color: 'bg-purple-500'
              },
              {
                icon: Zap,
                title: 'Instant Responses',
                description: '24/7 AI assistance with real-time answers to complex business questions',
                color: 'bg-blue-500'
              },
              {
                icon: Users,
                title: 'Expert Matching',
                description: 'AI-powered consultant matching based on expertise and specialization',
                color: 'bg-green-500'
              },
              {
                icon: Shield,
                title: 'Legal Oversight',
                description: 'Every AI recommendation verified by legal experts for compliance',
                color: 'bg-red-500'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert <span className="text-purple-600">Business Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive international business solutions delivered by expert consultants 
              with AI-enhanced efficiency and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Formation */}
            <Link to="/services/company-formation" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Company Formation"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Company Formation</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    Complete business registration and incorporation services across 127+ jurisdictions
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $2,500</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Investment Advisory */}
            <Link to="/services/investment-advisory" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Investment Advisory"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Investment Advisory</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    Strategic investment guidance and portfolio optimization for international markets
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $1,500</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Legal Consulting */}
            <Link to="/services/legal-consulting" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Legal Consulting"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Legal Consulting</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    Expert legal advice and compliance support for international business operations
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $800</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Accounting Services */}
            <Link to="/services/accounting-services" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Accounting Services"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Accounting Services</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    Professional bookkeeping, tax preparation, and financial reporting services
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $500/mo</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Market Research */}
            <Link to="/services/market-research" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Market Research"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Market Research</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    In-depth market analysis and business intelligence for strategic decision making
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $1,200</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Banking Solutions */}
            <Link to="/services/banking-solutions" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Banking Solutions"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Banking Solutions</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    International banking setup, account opening, and financial infrastructure
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $800</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Ongoing Compliance */}
            <Link to="/services/ongoing-compliance" className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white h-80">
              <div className="relative h-full overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/6863515/pexels-photo-6863515.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ongoing Compliance"
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-2 w-fit mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold drop-shadow-2xl mb-3">Ongoing Compliance</h3>
                  <p className="text-white/95 text-sm mb-4 leading-relaxed">
                    Continuous compliance monitoring and regulatory updates for your business
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">From $300/mo</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
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

      {/* Countries Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your <span className="text-purple-600">Perfect Jurisdiction</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore business-friendly countries with our expert consultants and AI-powered recommendations
            </p>
          </div>

          {countriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCountries.map((country) => (
                <CountryCard key={country.id} country={country} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/countries"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
            >
              <span>Explore All Countries</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Trusted by <span className="text-yellow-300">Thousands</span> Worldwide
            </h2>
            <p className="text-xl text-purple-100">
              Join the global community of successful entrepreneurs
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '15,000+', label: 'Businesses Formed', icon: Building },
              { value: '127', label: 'Countries Served', icon: Globe },
              { value: '98.5%', label: 'Success Rate', icon: TrendingUp },
              { value: '4.9/5', label: 'Client Rating', icon: Star }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 group-hover:bg-white/20 transition-colors border border-white/20">
                  <stat.icon className="h-8 w-8 text-yellow-300 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-purple-200 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Global Business?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Get instant AI-powered guidance and connect with expert consultants in minutes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/get-started"
              className="bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <Bot className="h-5 w-5" />
              <span>Start with AI Oracle</span>
            </Link>
            <Link
              to="/countries"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Explore Countries
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;