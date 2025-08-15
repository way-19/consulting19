import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, Shield, Zap, Users, Globe2, TrendingUp, Clock,
  Building, CheckCircle, Calculator, Scale, Globe, CreditCard, FileText,
  Mail, Eye, Sparkles, MessageSquare, Send
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

      {/* Real-Time Platform Analytics */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-purple-400/10 rounded-full animate-bounce" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Real-Time Platform <span className="text-cyan-400">Analytics</span>
            </h2>
            <p className="text-xl text-indigo-100">
              Live insights from our worldwide network of expert consultants and AI-powered 
              analytics driving successful business formations.
            </p>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {/* Active Consultations */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="bg-blue-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">1,247+</div>
              <div className="text-white/80 text-sm">Active Consultations</div>
              <div className="text-cyan-400 text-xs mt-1">Ongoing client engagements worldwide</div>
            </div>

            {/* Strategic Jurisdictions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="bg-green-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">127</div>
              <div className="text-white/80 text-sm">Strategic Jurisdictions</div>
              <div className="text-cyan-400 text-xs mt-1">Countries with expert consultants</div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="bg-purple-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">98.5%</div>
              <div className="text-white/80 text-sm">Success Rate</div>
              <div className="text-cyan-400 text-xs mt-1">Successful business formations</div>
            </div>

            {/* Avg Response Time */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="bg-orange-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">2.1h</div>
              <div className="text-white/80 text-sm">Avg Response Time</div>
              <div className="text-cyan-400 text-xs mt-1">AI-powered instant support</div>
            </div>

            {/* AI-Powered Matching */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="bg-cyan-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">AI</div>
              <div className="text-white/80 text-sm">AI-Powered Matching</div>
              <div className="text-cyan-400 text-xs mt-1">Intelligent consultant-client pairing based on expertise and requirements</div>
            </div>

            {/* Legal Compliance */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <div className="bg-yellow-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-white/80 text-sm">Legal Compliance</div>
              <div className="text-cyan-400 text-xs mt-1">All recommendations reviewed by legal experts for full compliance assurance</div>
            </div>
          </div>

          {/* Success Optimization */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
            <div className="bg-green-500 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">Success Optimization</div>
            <div className="text-white/80 text-sm">Continuous optimization based on successful case patterns</div>
          </div>

          {/* CTA Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join Thousands of Successful Businesses
            </h3>
            <p className="text-white/90 mb-6">
              Experience the power of AI-enhanced consulting with expert guidance across 10 
              strategic jurisdictions worldwide.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Experience the Future of Business Consulting */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Bot className="h-6 w-6 text-blue-500" />
              <span className="text-blue-600 font-medium">AI Intelligence Preview</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Experience the Future of <span className="text-blue-600">Business Consulting</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Our AI assistant combines global regulatory knowledge with real-time market 
              insights to provide personalized recommendations for your international 
              business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* AI Chat Interface Mockup */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Business Oracle</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-100 text-sm">Online & Ready</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4 h-80 overflow-y-auto">
                {/* AI Message */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                    <p className="text-sm text-gray-900">
                      Based on your tech startup requirements, I recommend Estonia for e-Residency benefits or Delaware for US market access.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">AI Oracle • Just now</p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-xs">
                    <p className="text-sm text-white">
                      What about tax implications?
                    </p>
                    <p className="text-xs text-blue-200 mt-2">You • Now</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                    <p className="text-sm text-gray-900">
                      Estonia offers 0% tax on retained earnings, while Delaware provides excellent tax treaties. Both have been verified by our legal experts for compliance.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">✓ Verified by legal experts</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Ask about international business formation..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                  <button className="bg-blue-600 text-white p-2 rounded-lg">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Intelligent Business Guidance */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Intelligent Business Guidance</h3>
                
                {/* Smart Country Matching */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Smart Country Matching</h4>
                      <p className="text-sm text-gray-600">AI analyzes your business profile to recommend optimal jurisdictions</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      "Based on your tech startup profile, I recommend Estonia for digital-first governance 
                      or Delaware for US market access. Both offer excellent tax advantages for your business model."
                    </p>
                  </div>
                </div>

                {/* AI-Powered Insights */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">AI-Powered Insights</h4>
                      <p className="text-sm text-gray-600">Real-time market analysis with intelligent recommendations</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700">
                    Every AI response is reviewed by legal experts for complete compliance assurance.
                  </div>
                </div>

                {/* Multilingual Support */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-green-100 rounded-lg p-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Multilingual Support</h4>
                      <p className="text-sm text-gray-600">Communicate seamlessly in English, Turkish, Portuguese, or Spanish</p>
                    </div>
                  </div>
                </div>

                {/* Instant Responses */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-orange-100 rounded-lg p-3">
                      <Zap className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Instant Responses</h4>
                      <p className="text-sm text-gray-600">Get immediate answers with human consultant backup within 0.3 seconds</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Bot className="h-5 w-5" />
                  <span>Try AI Assistant Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
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

      {/* Expert Insights from Our Global Consultants */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Users className="h-6 w-6 text-purple-600" />
              <span className="text-purple-600 font-medium">Latest Insights</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert Insights from Our <span className="text-purple-600">Global Consultants</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest regulatory changes, market opportunities, and 
              expert analysis from our consultants across 8 strategic jurisdictions.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Singapore Banking Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Singapore Banking"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Banking
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🇸🇬</span>
                  <span className="text-sm text-gray-500">Wei Chen • Singapore • 5 min read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  New Investment Opportunities in Estonia
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Complete guide to setting up your business in Dubai with latest regulations. 
                  Residency benefits and international entrepreneur programs and e-...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">25 Jan 10, 2024</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Read More →
                  </button>
                </div>
              </div>
            </div>

            {/* Malta Golden Visa Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Malta Golden Visa"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Investment
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🇦🇪</span>
                  <span className="text-sm text-gray-500">Antonia Rossi • Malta • 8 min read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  UAE Company Formation Guide 2024
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Complete guide to setting up your business in Dubai with latest regulations. 
                  Residency benefits and international entrepreneur programs and e-...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">25 Jan 12, 2024</span>
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                    Read More →
                  </button>
                </div>
              </div>
            </div>

            {/* UK Post-Brexit Post */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="UK Post-Brexit Business"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Featured
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🇨🇾</span>
                  <span className="text-sm text-gray-500">James Thompson • Cyprus • 12 min read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Cyprus Visa Updates for 2024
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Latest changes in Cyprus immigration policy and new visa categories for investors. 
                  Complete analysis of the new EU investment...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">25 Jan 30, 2024</span>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 bg-white border border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-sm"
            >
              <FileText className="h-5 w-5" />
              <span>View All Insights</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;