import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, CheckCircle, Globe, Star, TrendingUp, Users, Zap, Building2, Scale, Calculator, Search, CreditCard, Shield, MessageSquare } from 'lucide-react';
import CountryCard from '../components/CountryCard';
import { useCountries } from '../hooks/useCountries';

const HomePage = () => {
  const { countries, loading: countriesLoading } = useCountries(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredCountries = countries.slice(0, 8);

  const processSteps = [
    {
      step: 1,
      title: "AI Analysis",
      description: "Our AI Oracle analyzes your business needs, goals, and requirements to understand your unique situation.",
      icon: Bot,
      color: "from-blue-500 to-cyan-500"
    },
    {
      step: 2,
      title: "Smart Matching",
      description: "Advanced algorithms match you with the perfect jurisdiction and expert consultant based on your specific needs.",
      icon: Zap,
      color: "from-purple-500 to-pink-500"
    },
    {
      step: 3,
      title: "Expert Guidance",
      description: "Connect with specialized consultants who provide personalized guidance throughout your business journey.",
      icon: Users,
      color: "from-green-500 to-emerald-500"
    },
    {
      step: 4,
      title: "Legal Verification",
      description: "All recommendations are verified by our legal experts to ensure compliance and accuracy.",
      icon: Shield,
      color: "from-orange-500 to-red-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % processSteps.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-indigo-900/90"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 mb-8">
              <Bot className="h-5 w-5 text-yellow-300" />
              <span className="text-white font-medium">World's First AI-Enhanced Business Consulting</span>
              <Zap className="h-5 w-5 text-yellow-300" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            Global Business
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            AI-powered platform connecting you with expert consultants across 127+ countries. 
            From company formation to ongoing compliance, we make international business effortless.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link
              to="/get-started"
              className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 flex items-center space-x-3"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/ai-assistant"
              className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center space-x-3"
            >
              <Bot className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Try AI Oracle</span>
            </Link>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">127+</div>
              <div className="text-gray-300 text-sm">Countries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">15K+</div>
              <div className="text-gray-300 text-sm">Businesses Formed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">98.5%</div>
              <div className="text-gray-300 text-sm">Success Rate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-300 text-sm">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Consulting Process Slider */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Our <span className="text-purple-600">AI Oracle</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI technology combined with human expertise for unparalleled business consulting
            </p>
          </div>

          <div className="relative">
            {/* Process Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`relative transition-all duration-500 transform ${
                    currentSlide === index ? 'scale-105 z-10' : 'scale-100'
                  }`}
                >
                  <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-8 text-white shadow-xl ${
                    currentSlide === index ? 'shadow-2xl' : ''
                  }`}>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-16 h-16 flex items-center justify-center mb-6">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center mb-4">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                    <p className="text-white/90 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {processSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-purple-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Country Recommendations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered <span className="text-purple-600">Country Recommendations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI Oracle analyzes your business needs and recommends the perfect jurisdictions for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {countriesLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              featuredCountries.map((country) => (
                <CountryCard key={country.id} country={country} />
              ))
            )}
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
        </div>
      </section>

      {/* AI Oracle Band */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Bot className="h-12 w-12 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Zap className="h-12 w-12 text-yellow-300" />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Meet the <span className="text-yellow-300">AI Oracle</span>
              </h2>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                World's first AI-enhanced business consulting assistant. Get instant, intelligent 
                recommendations verified by legal experts.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-purple-100">Instant jurisdiction analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-purple-100">Expert consultant matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-300" />
                  <span className="text-purple-100">Legal compliance verification</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <Bot className="h-8 w-8 text-purple-400" />
                <span className="text-white font-semibold text-lg">AI Oracle</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              </div>
              <div className="bg-slate-700 rounded-xl p-6 mb-6">
                <p className="text-purple-200 text-sm mb-3">"I need to start a tech company with international reach..."</p>
                <p className="text-white leading-relaxed">
                  Based on your tech startup requirements, I recommend <strong className="text-blue-300">Estonia</strong> for 
                  e-Residency benefits or <strong className="text-green-300">Delaware</strong> for US market access. 
                  Both offer excellent tax advantages for your business model.
                </p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">✓ Verified by legal experts</span>
                <span className="text-slate-400">Response time: 0.3s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert Services for <span className="text-purple-600">Global Success</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From company formation to ongoing compliance, our AI-enhanced platform connects you with
              expert consultants for every aspect of international business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Company Formation */}
            <Link 
              to="/services/company-formation"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Company Formation</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Complete business registration with expert guidance across 127+ jurisdictions
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">LLC & Corporation setup</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Legal documentation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Compliance support</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Investment Advisory */}
            <Link 
              to="/services/investment-advisory"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/7357/startup-photos.jpg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Investment Advisory</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Strategic investment guidance and portfolio optimization for international markets
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Portfolio analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Risk assessment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Market insights</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Legal Consulting */}
            <Link 
              to="/services/legal-consulting"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Legal Consulting</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Expert legal advice and compliance support for international business operations
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Contract review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Regulatory compliance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Legal documentation</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Accounting Services */}
            <Link 
              to="/services/accounting-services"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Accounting Services</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Professional bookkeeping, tax preparation, and financial reporting services
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Monthly bookkeeping</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Tax optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Financial reports</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Market Research */}
            <Link 
              to="/services/market-research"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Market Research</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Comprehensive market analysis and business intelligence for informed decisions
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Market analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Competitor research</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Industry insights</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Banking Solutions */}
            <Link 
              to="/services/banking-solutions"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Banking Solutions</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    International banking setup and financial infrastructure for global businesses
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Account opening</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Multi-currency support</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Payment processing</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Ongoing Compliance */}
            <Link 
              to="/services/ongoing-compliance"
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 bg-cover bg-center bg-no-repeat text-white"
              style={{
                backgroundImage: `url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Ongoing Compliance</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Continuous compliance monitoring and regulatory updates for your business
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Regulatory monitoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Annual filings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-gray-200 text-sm">Compliance alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
            >
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-purple-600">Consulting19</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              8+ years of excellence in international business consulting with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Enhanced</h3>
              <p className="text-gray-600">World's first AI-powered business consulting platform with human expertise</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600">Expert consultants in 127+ countries with local knowledge and expertise</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Proven Success</h3>
              <p className="text-gray-600">98.5% success rate with 15,000+ businesses formed worldwide</p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Team</h3>
              <p className="text-gray-600">Dedicated specialists with deep knowledge of local regulations and markets</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Ready to Go Global?</h2>
          <p className="text-xl text-purple-100 mb-10">
            Join thousands of successful businesses who trust our AI-enhanced platform for their international expansion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/get-started"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>Start Your Business Journey</span>
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
      </section>
    </div>
  );
};

export default HomePage;