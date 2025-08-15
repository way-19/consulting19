import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, Shield, Zap, Users, Globe2, TrendingUp, Clock,
  Building, CheckCircle, Calculator, Scale, Globe, CreditCard, FileText,
  Mail, Eye, Sparkles, MessageSquare
} from 'lucide-react';

import CountryCard from '../components/ModernCountryCard';
import { useCountries } from '../hooks/useCountries';

const HomePage = () => {
  const navigate = useNavigate();

  const { countries, loading: countriesLoading } = useCountries(true);
  const featuredCountries = countries.slice(0, 8);

  // Hero Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      id: 1,
      title: 'AI-Enhanced Global Intelligence',
      subtitle: 'at Your Service',
      description:
        "Next-level regulatory guidance with intelligent automation. Our AI-powered platform connects you with expert consultants across the world's most business-friendly jurisdictions.",
      backgroundImage:
        'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920',
      primaryButton: 'Get Started Today',
      secondaryButton: 'Explore Services',
      stats: { companies: '15,247', countries: '127', successRate: '98.2%' }
    },
    {
      id: 2,
      title: 'Global Business Formation',
      subtitle: 'Made Simple',
      description:
        'Expert consultants guide you through international business setup with AI-powered jurisdiction matching. Start your global expansion with confidence and legal compliance.',
      backgroundImage:
        'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1920',
      primaryButton: 'Start Formation',
      secondaryButton: 'View Countries',
      stats: { companies: '12,500+', countries: '50+', successRate: '99.1%' }
    },
    {
      id: 3,
      title: 'Tax Optimization Strategies',
      subtitle: 'Worldwide',
      description:
        'Minimize your global tax burden legally with our expert tax consultants. From 0% territorial taxation to offshore structures, we optimize your international tax strategy.',
      backgroundImage:
        'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=1920',
      primaryButton: 'Optimize Taxes',
      secondaryButton: 'Tax Calculator',
      stats: { saved: '$50M+', clients: '3,200+', avgSaving: '35%' }
    },
    {
      id: 4,
      title: 'Banking & Financial Services',
      subtitle: 'Global Access',
      description:
        'Open international bank accounts and access global financial services. Our banking specialists help you establish financial infrastructure in business-friendly jurisdictions.',
      backgroundImage:
        'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1920',
      primaryButton: 'Open Account',
      secondaryButton: 'Banking Guide',
      stats: { accounts: '8,900+', banks: '150+', countries: '45+' }
    }
  ];

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((p) => (p + 1) % heroSlides.length),
      6000
    );
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const aiFeatures = [
    {
      icon: Bot,
      title: 'AI-Powered Matching',
      description:
        'Intelligent consultant matching based on your specific requirements',
      color: 'bg-blue-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description:
        'Every AI interaction monitored by legal experts for compliance',
      color: 'bg-green-500'
    },
    {
      icon: Zap,
      title: 'Instant Responses',
      description: '24/7 AI assistance with human expert backup when needed',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={slide.backgroundImage}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-purple-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-transparent to-indigo-900/50" />
          </div>
        ))}

        {/* Decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse backdrop-blur-sm" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-yellow-300/10 rounded-full animate-bounce backdrop-blur-sm" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-400/20 rounded-full animate-ping" />
        <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-indigo-400/15 rounded-full animate-pulse" />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-5xl mx-auto">
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

              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                {Object.entries(heroSlides[currentSlide].stats).map(([k, v]) => (
                  <div
                    key={k}
                    className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20 shadow-lg"
                  >
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {v}
                    </div>
                    <div className="text-white/80 text-sm capitalize">
                      {k.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'bg-white shadow-lg scale-125' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)
          }
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20 border border-white/30"
        >
          <ArrowRight className="h-6 w-6 text-white rotate-180" />
        </button>
        <button
          onClick={() => setCurrentSlide((p) => (p + 1) % heroSlides.length)}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20 border border-white/30"
        >
          <ArrowRight className="h-6 w-6 text-white" />
        </button>

        <div className="absolute top-8 right-8 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium z-20 border border-white/20">
          {currentSlide + 1} / {heroSlides.length}
        </div>
      </section>

      {/* AI-Powered Consulting Process */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: '🤖',
                title: 'AI Analysis',
                description: 'Advanced algorithms analyze your business requirements',
                image:
                  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Machine Learning',
                color: 'from-cyan-400 to-blue-600'
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Smart Matching',
                description:
                  'Intelligent matching with optimal jurisdictions and consultants',
                image:
                  'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Neural Networks',
                color: 'from-green-400 to-emerald-600'
              },
              {
                step: '03',
                icon: '👨‍💼',
                title: 'Expert Review',
                description:
                  'Human experts validate and enhance AI recommendations',
                image:
                  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Human Intelligence',
                color: 'from-purple-400 to-pink-600'
              },
              {
                step: '04',
                icon: '⚡',
                title: 'Instant Execution',
                description:
                  'Rapid implementation with continuous monitoring',
                image:
                  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400',
                tech: 'Automation',
                color: 'from-orange-400 to-red-600'
              }
            ].map((process, index) => (
              <div key={index} className="group relative">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="absolute top-4 left-4 z-10">
                    <div
                      className={`bg-gradient-to-r ${process.color} rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {process.step}
                    </div>
                  </div>

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
                    <div
                      className={`absolute bottom-4 right-4 bg-gradient-to-r ${process.color} rounded-lg px-3 py-1 text-white text-xs font-bold shadow-lg`}
                    >
                      {process.tech}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {process.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {process.description}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                    <div
                      className={`h-full bg-gradient-to-r ${process.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`}
                    />
                  </div>

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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {countriesLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
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
              className="inline-flex items-center space-x-2 border border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-600 hover:text-white transition-colors"
            >
              <span>View All Countries</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
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
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-indigo-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Services (8 cards, card-click navigates) */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Company Formation */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=company_formation')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                navigate('/services?category=company_formation')
              }
              role="link"
              tabIndex={0}
              aria-label="Company Formation"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Company Formation</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Complete business registration and incorporation services across 19+ jurisdictions
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">LLC & Corporation setup</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Legal documentation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Compliance support</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Advisory */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/7357/startup-photos.jpg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=investment')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=investment')
              }
              role="link"
              tabIndex={0}
              aria-label="Investment Advisory"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Investment Advisory</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Strategic investment guidance and portfolio optimization for international markets
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Market analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Risk assessment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Portfolio strategy</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Learn More</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Consulting */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=legal')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=legal')
              }
              role="link"
              tabIndex={0}
              aria-label="Legal Consulting"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Legal Consulting</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Expert legal advice and documentation for international business operations
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Contract drafting</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Compliance review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Legal representation</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accounting Services */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=accounting')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') &&
                navigate('/services?category=accounting')
              }
              role="link"
              tabIndex={0}
              aria-label="Accounting Services"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Accounting Services</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Professional bookkeeping, tax preparation, and financial reporting services
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Monthly bookkeeping</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Tax preparation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Financial reports</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>View Services</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visa & Residence */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=visa')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=visa')
              }
              role="link"
              tabIndex={0}
              aria-label="Visa & Residence"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Visa & Residence</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Comprehensive visa and residence permit services for global mobility
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Visa applications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Residence permits</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Citizenship pathways</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Apply Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Market Research */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=research')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=research')
              }
              role="link"
              tabIndex={0}
              aria-label="Market Research"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Market Research</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    In-depth market analysis and business intelligence for informed decision making
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Market analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Competitor research</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Industry insights</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Research</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Solutions */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=banking')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=banking')
              }
              role="link"
              tabIndex={0}
              aria-label="Banking Solutions"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Banking Solutions</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    International banking services and account opening assistance worldwide
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Account opening</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Multi-currency accounts</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Online banking setup</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Open Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ongoing Compliance (8th card) */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={() => navigate('/services?category=compliance')}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=compliance')
              }
              role="link"
              tabIndex={0}
              aria-label="Ongoing Compliance"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Ongoing Compliance</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Continuous compliance monitoring and regulatory updates for your business
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Regulatory monitoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Annual filings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <span className="text-sm text-gray-200">Updates & alerts</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Stay Compliant</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Demo */}
      <section className
