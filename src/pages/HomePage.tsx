import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Shield, Zap, BarChart3, MessageSquare, Users, Globe2, TrendingUp, Clock, Building, CheckCircle, Calculator, Scale, Plane, Search, CreditCard, Mail, Globe, Eye, Sparkles } from 'lucide-react';
import CountryCard from '../components/CountryCard';
import ServiceCard from '../components/ServiceCard';
import { useCountries } from '../hooks/useCountries';
import { useServices } from '../hooks/useServices';
import { getPublicImageUrl } from '../lib/supabase';

const HomePage = () => {
  const { countries, loading: countriesLoading } = useCountries(true);
  const { services, loading: servicesLoading } = useServices(true);
  
  const featuredCountries = countries.slice(0, 8);
  
  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      id: 1,
      title: "AI-Enhanced Global Intelligence",
      subtitle: "at Your Service",
      description: "Next-level regulatory guidance with intelligent automation. Our AI-powered platform connects you with expert consultants across the world's most business-friendly jurisdictions.",
      backgroundImage: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Get Started Today",
      secondaryButton: "Explore Services",
      stats: { companies: "15,247", countries: "127", successRate: "98.2%" }
    },
    {
      id: 2,
      title: "Global Business Formation",
      subtitle: "Made Simple",
      description: "Expert consultants guide you through international business setup with AI-powered jurisdiction matching. Start your global expansion with confidence and legal compliance.",
      backgroundImage: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Start Formation",
      secondaryButton: "View Countries",
      stats: { companies: "12,500+", countries: "50+", successRate: "99.1%" }
    },
    {
      id: 3,
      title: "Tax Optimization Strategies",
      subtitle: "Worldwide",
      description: "Minimize your global tax burden legally with our expert tax consultants. From 0% territorial taxation to offshore structures, we optimize your international tax strategy.",
      backgroundImage: "https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Optimize Taxes",
      secondaryButton: "Tax Calculator",
      stats: { saved: "$50M+", clients: "3,200+", avgSaving: "35%" }
    },
    {
      id: 4,
      title: "Banking & Financial Services",
      subtitle: "Global Access",
      description: "Open international bank accounts and access global financial services. Our banking specialists help you establish financial infrastructure in business-friendly jurisdictions.",
      backgroundImage: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Open Account",
      secondaryButton: "Banking Guide",
      stats: { accounts: "8,900+", banks: "150+", countries: "45+" }
    }
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const aiFeatures = [
    {
      icon: Bot,
      title: 'AI-Powered Matching',
      description: 'Intelligent consultant matching based on your specific requirements',
      color: 'bg-blue-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI interaction monitored by legal experts for compliance',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Instant Responses',
      description: '24/7 AI assistance with human expert backup when needed',
      color: 'bg-purple-500'
    }
  ];

  const analyticsMetrics = [
    { value: '15,247', label: 'Active Businesses', icon: Users },
    { value: '98.2%', label: 'Success Rate', icon: TrendingUp },
    { value: '127', label: 'Countries Served', icon: Globe2 },
    { value: '47min', label: 'Avg Response Time', icon: Clock }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Images with Transitions */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.backgroundImage}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Multiple Shadow Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-purple-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-transparent to-indigo-900/50" />
          </div>
        ))}

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse backdrop-blur-sm" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-yellow-300/10 rounded-full animate-bounce backdrop-blur-sm" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400/20 rounded-full animate-ping" />
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-indigo-400/15 rounded-full animate-pulse" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
              {/* Slide Content */}
              <div className="mb-8">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
                  {heroSlides[currentSlide].title}{' '}
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    {heroSlides[currentSlide].subtitle}
                  </span>
                </h1>
                
                <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 rounded-2xl p-6 border border-white/10">
                  {heroSlides[currentSlide].description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
                <Link
                  to="/get-started"
                  className="bg-white text-purple-700 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-3 backdrop-blur-sm border border-white/20"
                >
                  <span>{heroSlides[currentSlide].primaryButton}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <Link
                  to="/services"
                  className="border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl"
                >
                  {heroSlides[currentSlide].secondaryButton}
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {Object.entries(heroSlides[currentSlide].stats).map(([key, value], index) => (
                  <div key={key} className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 shadow-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
                    <div className="text-white/80 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white shadow-lg scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20 border border-white/30"
        >
          <ArrowRight className="h-6 w-6 text-white rotate-180" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20 border border-white/30"
        >
          <ArrowRight className="h-6 w-6 text-white" />
        </button>

        {/* Slide Counter */}
        <div className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium z-20 border border-white/20">
          {currentSlide + 1} / {heroSlides.length}
        </div>
      </section>


      {/* AI-Powered Consulting Process Slider */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              AI-Powered <span className="text-cyan-400">Consulting Process</span>
            </h2>
            <p className="text-xl text-gray-300">
              Revolutionary approach combining artificial intelligence with human expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                icon: '🤖',
                title: 'AI Analysis',
                description: 'Advanced algorithms analyze your business requirements',
                image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Machine Learning',
                color: 'from-cyan-400 to-blue-600'
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Smart Matching',
                description: 'Intelligent matching with optimal jurisdictions and consultants',
                image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Neural Networks',
                color: 'from-green-400 to-emerald-600'
              },
              {
                step: '03',
                icon: '👨‍💼',
                title: 'Expert Review',
                description: 'Human experts validate and enhance AI recommendations',
                image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Human Intelligence',
                color: 'from-purple-400 to-pink-600'
              },
              {
                step: '04',
                icon: '⚡',
                title: 'Instant Execution',
                description: 'Rapid implementation with continuous monitoring',
                image: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Automation',
                color: 'from-orange-400 to-red-600'
              }
            ].map((process, index) => (
              <div key={index} className="group relative">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  {/* Step number */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`bg-gradient-to-r ${process.color} rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {process.step}
                    </div>
                  </div>
                  
                  {/* Image with overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={process.image}
                      alt={process.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 text-3xl drop-shadow-lg">
                      {process.icon}
                    </div>
                    <div className={`absolute bottom-4 right-4 bg-gradient-to-r ${process.color} rounded-lg px-3 py-1 text-white text-xs font-bold shadow-lg`}>
                      {process.tech}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {process.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {process.description}
                    </p>
                  </div>
                  
                  {/* Animated progress bar */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                    <div className={`h-full bg-gradient-to-r ${process.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`} />
                  </div>
                  
                  {/* Floating particles */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* AI-Powered Country Recommendations */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Country <span className="text-purple-600">Recommendations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI analyzes your business needs with intelligent guidance from 
              our AI-powered consultants and comprehensive business services.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { code: 'GE', name: 'Georgia', flag: '🇬🇪', score: '95%', feature: 'Tax advantages', slug: 'georgia' },
              { code: 'EE', name: 'Estonia', flag: '🇪🇪', score: '92%', feature: 'Digital innovation', slug: 'estonia' },
              { code: 'AE', name: 'UAE', flag: '🇦🇪', score: '88%', feature: 'Strategic location', slug: 'uae' },
              { code: 'MT', name: 'Malta', flag: '🇲🇹', score: '87%', feature: 'EU membership', slug: 'malta' },
              { code: 'CH', name: 'Switzerland', flag: '🇨🇭', score: '90%', feature: 'Financial hub', slug: 'switzerland' },
              { code: 'PT', name: 'Portugal', flag: '🇵🇹', score: '86%', feature: 'EU access', slug: 'portugal' },
              { code: 'ES', name: 'Spain', flag: '🇪🇸', score: '84%', feature: 'Market access', slug: 'spain' },
              { code: 'US', name: 'USA', flag: '🇺🇸', score: '89%', feature: 'Global market', slug: 'usa' }
            ].map((country) => (
              <div key={country.code} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-center">
                <div className="text-2xl mb-2">{country.flag}</div>
                <div className="text-xs font-medium text-gray-500 mb-1">{country.code}</div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{country.name}</h3>
                <div className="text-lg font-bold text-purple-600 mb-1">{country.score}</div>
                <p className="text-xs text-gray-600 mb-3">{country.feature}</p>
                <Link
                  to={`/countries/${country.slug}`}
                  className="text-purple-600 hover:text-purple-700 font-medium text-xs flex items-center justify-center space-x-1"
                >
                  <span>Learn More</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
          </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Add any additional sections here if needed */}
    </div>
  );
};

export default HomePage;
          </div>
        </div>
      </section>

      {/* AI Oracle Band */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powered by AI Oracle</h2>
            <p className="text-xl text-indigo-100">
              Advanced AI technology with human expertise oversight
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-indigo-100">{feature.description}</p>
              </div>
            ))}
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

          {/* Service Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Company Formation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-blue-100 rounded-xl p-4 mb-4 group-hover:bg-blue-200 transition-colors">
                <Building className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Company Formation</h3>
              <p className="text-gray-600 text-sm mb-4">
                Quick entity setup worldwide with expert guidance and AI-powered jurisdiction matching.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">LLC & Corporation setup</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Registered agent service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">EIN & tax ID</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Compliance support</span>
                </div>
              </div>
              <Link
                to="/services?category=company_formation"
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Investment Advisory */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-green-100 rounded-xl p-4 mb-4 group-hover:bg-green-200 transition-colors">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Investment Advisory</h3>
              <p className="text-gray-600 text-sm mb-4">
                Strategic market analysis and investment opportunities across global markets.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Market research</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Risk assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Portfolio optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Due diligence</span>
                </div>
              </div>
              <Link
                to="/services?category=investment"
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Legal Consulting */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-purple-100 rounded-xl p-4 mb-4 group-hover:bg-purple-200 transition-colors">
                <Scale className="h-8 w-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Legal Consulting</h3>
              <p className="text-gray-600 text-sm mb-4">
                Regulatory compliance and business law expertise for international operations.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Contract drafting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Compliance review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Legal structure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Dispute resolution</span>
                </div>
              </div>
              <Link
                to="/services?category=legal"
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Accounting Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-orange-100 rounded-xl p-4 mb-4 group-hover:bg-orange-200 transition-colors">
                <Calculator className="h-8 w-8 text-orange-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accounting Services</h3>
              <p className="text-gray-600 text-sm mb-4">
                International tax optimization and comprehensive accounting solutions.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Tax planning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Bookkeeping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Financial reporting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Audit support</span>
                </div>
              </div>
              <Link
                to="/services?category=accounting"
                className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Visa & Residence */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-teal-100 rounded-xl p-4 mb-4 group-hover:bg-teal-200 transition-colors">
                <Plane className="h-8 w-8 text-teal-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visa & Residence</h3>
              <p className="text-gray-600 text-sm mb-4">
                Global mobility solutions including visa applications and citizenship programs.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Visa applications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Residency programs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Citizenship planning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Immigration law</span>
                </div>
              </div>
              <Link
                to="/services?category=visa"
                className="w-full bg-teal-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Market Research */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-pink-100 rounded-xl p-4 mb-4 group-hover:bg-pink-200 transition-colors">
                <Search className="h-8 w-8 text-pink-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Market Research</h3>
              <p className="text-gray-600 text-sm mb-4">
                Industry insights and market intelligence for informed business decisions.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Industry analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Competitor research</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Market sizing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Trend analysis</span>
                </div>
              </div>
              <Link
                to="/services?category=research"
                className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Banking Solutions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-indigo-100 rounded-xl p-4 mb-4 group-hover:bg-indigo-200 transition-colors">
                <CreditCard className="h-8 w-8 text-indigo-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Banking Solutions</h3>
              <p className="text-gray-600 text-sm mb-4">
                International account opening and comprehensive wealth management.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Account opening</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Banking relationships</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Payment processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Credit facilities</span>
                </div>
              </div>
              <Link
                to="/services?category=banking"
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Ongoing Compliance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="bg-red-100 rounded-xl p-4 mb-4 group-hover:bg-red-200 transition-colors">
                <Shield className="h-8 w-8 text-red-600 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ongoing Compliance</h3>
              <p className="text-gray-600 text-sm mb-4">
                Continuous monitoring and compliance management services.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Regulatory updates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Filing management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Compliance calendar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">Risk monitoring</span>
                </div>
              </div>
              <Link
                to="/services?category=compliance"
                className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Platform Analytics */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Globe className="h-6 w-6 text-blue-400" />
              <span className="text-blue-400 font-medium">Global Intelligence Network</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Real-Time Platform <span className="text-blue-400">Analytics</span>
            </h2>
            <p className="text-xl text-slate-300">
              Live insights from our worldwide network of expert consultants and AI-powered 
              analytics driving successful business formations.
            </p>
          </div>

          {/* Top Row - Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Mail className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">1,247+</div>
                <div className="text-slate-400 text-sm">Active Consultations</div>
                <div className="text-xs text-blue-400 mt-1">Consultations with expert consultants worldwide</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Globe className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">127</div>
                <div className="text-slate-400 text-sm">Strategic Jurisdictions</div>
                <div className="text-xs text-green-400 mt-1">Countries with expert consultants</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">98.5%</div>
                <div className="text-slate-400 text-sm">Success Rate</div>
                <div className="text-xs text-purple-400 mt-1">Successful business formations</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Eye className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">47min</div>
                <div className="text-slate-400 text-sm">Avg Response Time</div>
                <div className="text-xs text-orange-400 mt-1">AI-powered instant support</div>
              </div>
            </div>
          </div>

          {/* Bottom Row - AI Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Bot className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">AI-Powered Matching</div>
                <div className="text-slate-400 text-sm">Intelligent consultant-client pairing based on expertise and requirements</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">Legal Compliance</div>
                <div className="text-slate-400 text-sm">All recommendations reviewed by legal experts for full compliance</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors border border-slate-700">
                <Zap className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">Success Optimization</div>
                <div className="text-slate-400 text-sm">Continuous optimization based on successful case patterns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Join Thousands of Successful Businesses
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Experience the power of AI-enhanced consulting with expert guidance across 8 
              strategic jurisdictions worldwide.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Start Your Journey</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/get-started"
                  className="bg-white text-purple-700 px-10 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center space-x-3"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <Link
                  to="/ai-assistant"
                  className="border-2 border-white/40 text-white px-10 py-4 rounded-xl font-bold hover:bg-white/20 transition-all duration-300 backdrop-blur-sm shadow-xl hover:shadow-2xl flex items-center space-x-3"
                >
                  <Bot className="h-5 w-5" />
                  <span>Try AI Oracle</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience the Future */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Experience the Future of{' '}
                <span className="text-purple-600">Business Consulting</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our AI assistant provides instant, intelligent guidance while expert consultants 
                ensure personalized service for complex requirements.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Instant AI-powered responses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Legal oversight and compliance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Expert human backup</span>
                </div>
              </div>

              <Link
                to="/ai-assistant"
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <span>Try AI Assistant</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* AI Assistant Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <span className="text-sm text-gray-600 ml-4">AI Business Assistant</span>
                </div>
                
                <div className="p-6 space-y-4 h-80 overflow-y-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm text-gray-800">
                        Hello! I can help you choose the best jurisdiction for your business. What type of company are you planning to establish?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-purple-600 text-white rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        I'm looking to start a tech startup with international clients
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm text-gray-800">
                        Based on your requirements, I recommend Estonia for e-Residency benefits or Delaware for US market access. Would you like detailed comparisons?
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">✨ AI Analysis Complete</p>
                    <p className="text-xs text-blue-600">Matched with 3 expert consultants in relevant jurisdictions</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                      <input 
                        type="text" 
                        placeholder="Ask about any jurisdiction..."
                        className="w-full bg-transparent text-sm text-gray-600 outline-none"
                        disabled
                      />
                    </div>
                    <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Insights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert Insights from Our <span className="text-purple-600">Global Consultants</span>
            </h2>
            <p className="text-xl text-gray-600">
              Latest insights and updates from our country specialists around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dynamic insights from countries */}
            {/* Sample insights - these would come from blog_posts table */}
            {[
              {
                id: 1,
                title: 'New Investment Opportunities in Georgia 2024',
                excerpt: 'Latest developments in Georgia\'s business landscape and emerging opportunities for international investors.',
                country: { name: 'Georgia', flag_emoji: '🇬🇪', slug: 'georgia' },
                category: 'Market Update',
                readTime: '5 min read'
              },
              {
                id: 2,
                title: 'UAE Free Zone Benefits for Tech Companies',
                excerpt: 'Comprehensive guide to UAE free zones and their advantages for technology startups.',
                country: { name: 'UAE', flag_emoji: '🇦🇪', slug: 'uae' },
                category: 'Business Guide',
                readTime: '7 min read'
              },
              {
                id: 3,
                title: 'Estonia e-Residency: Digital Nomad Paradise',
                excerpt: 'How Estonia\'s e-Residency program is revolutionizing remote business operations.',
                country: { name: 'Estonia', flag_emoji: '🇪🇪', slug: 'estonia' },
                category: 'Digital Innovation',
                readTime: '6 min read'
              }
            ].map((insight, index) => (
              <article key={insight.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
                <div className={`h-48 bg-gradient-to-br ${
                  index === 0 ? 'from-blue-500 to-purple-600' :
                  index === 1 ? 'from-green-500 to-teal-600' :
                  'from-orange-500 to-red-600'
                }`} />
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg">{insight.country.flag_emoji}</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      index === 0 ? 'bg-blue-100 text-blue-700' :
                      index === 1 ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {insight.category}
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{insight.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {insight.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {insight.excerpt}
                  </p>
                  <Link
                    to={`/blog/${insight.id}`}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-colors"
            >
              <span>View All Insights</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Businesses</h2>
          <p className="text-xl text-purple-100 mb-8">
            Discover AI-enhanced business consulting trusted by entrepreneurs worldwide
          </p>
          <Link
            to="/get-started"
            className="inline-flex items-center space-x-2 bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;