import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Shield, Zap, BarChart3, MessageSquare, Users, Globe2, TrendingUp, Clock, Mic, Volume2 } from 'lucide-react';
import CountryCard from '../components/CountryCard';
import ServiceCard from '../components/ServiceCard';
import { countries } from '../data/countries';
import { services } from '../data/services';

const HomePage = () => {
  const featuredCountries = countries.slice(0, 8);
  const [isAIAssistantActive, setIsAIAssistantActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCountries.map((country, index) => (
              <CountryCard 
                key={country.id} 
                country={country} 
                featured={index === 0} 
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/countries"
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
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
              Expert consultants for every aspect of international business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Analytics */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Real-Time Platform <span className="text-blue-400">Analytics</span>
            </h2>
            <p className="text-xl text-slate-300">
              Transparent insights on platform performance and global impact
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {analyticsMetrics.map((metric, index) => (
              <div key={index} className="text-center group">
                <div className="bg-slate-800 rounded-2xl p-6 group-hover:bg-slate-700 transition-colors">
                  <metric.icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-slate-400 text-sm">{metric.label}</div>
                </div>
              </div>
            ))}
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
            {countries
              .filter(country => country.insights.length > 0)
              .flatMap(country => 
                country.insights.map(insight => ({
                  ...insight,
                  country: country
                }))
              )
              .slice(0, 3)
              .map((insight, index) => (
                <article key={insight.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className={`h-48 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-purple-600' :
                    index === 1 ? 'from-green-500 to-teal-600' :
                    'from-orange-500 to-red-600'
                  }`} />
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg">{insight.country.flag}</span>
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
                      to={`/countries/${insight.country.slug}/insights/${insight.id}`}
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

      {/* AI Voice Assistant Floating Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          {/* Pulse animation rings */}
          <div className={`absolute inset-0 rounded-full ${isListening ? 'animate-ping' : ''} bg-gradient-to-r from-blue-400 to-purple-600 opacity-75`}></div>
          <div className={`absolute inset-0 rounded-full ${isListening ? 'animate-pulse' : ''} bg-gradient-to-r from-blue-500 to-purple-700 opacity-50`}></div>
          
          {/* Main button */}
          <button
            onClick={() => {
              setIsAIAssistantActive(!isAIAssistantActive);
              if (!isAIAssistantActive) {
                setIsListening(true);
                // Simulate voice activation
                setTimeout(() => setIsListening(false), 3000);
              }
            }}
            className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
              isAIAssistantActive 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600'
            } ${isListening ? 'animate-bounce' : ''}`}
            title="AI Voice Assistant"
          >
            {isListening ? (
              <Volume2 className="h-8 w-8 text-white mx-auto animate-pulse" />
            ) : isAIAssistantActive ? (
              <Bot className="h-8 w-8 text-white mx-auto" />
            ) : (
              <Mic className="h-8 w-8 text-white mx-auto" />
            )}
          </button>

          {/* Status indicator */}
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${
            isAIAssistantActive ? 'bg-green-500' : 'bg-gray-400'
          }`}>
            <div className={`w-full h-full rounded-full ${isAIAssistantActive ? 'animate-pulse bg-green-400' : ''}`}></div>
          </div>

          {/* Tooltip */}
          <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${
            isAIAssistantActive || isListening ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
            {isListening ? 'Listening...' : isAIAssistantActive ? 'AI Assistant Active' : 'Click to activate AI Assistant'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>

          {/* Voice waves animation */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '8px', animationDelay: '0ms' }}></div>
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '12px', animationDelay: '150ms' }}></div>
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '16px', animationDelay: '300ms' }}></div>
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '12px', animationDelay: '450ms' }}></div>
                <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '8px', animationDelay: '600ms' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {isAIAssistantActive && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Voice Assistant</h3>
                    <p className="text-xs text-blue-100">Powered by Admin Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAIAssistantActive(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="text-center mb-4">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                  isListening ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {isListening ? (
                    <Volume2 className="h-6 w-6 text-green-600 animate-pulse" />
                  ) : (
                    <Mic className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {isListening ? 'Listening to your voice...' : 'Click the microphone to start'}
                </p>
              </div>

              {/* Voice Controls */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsListening(!isListening);
                    if (!isListening) {
                      setTimeout(() => setIsListening(false), 3000);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isListening ? 'Stop Listening' : 'Start Voice Chat'}
                </button>

                <div className="text-xs text-gray-500 text-center">
                  <p>• Multi-language support</p>
                  <p>• Webhook independent</p>
                  <p>• Admin panel controlled</p>
                </div>
              </div>

              {/* Sample Commands */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Try saying:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>"Which country is best for my startup?"</p>
                  <p>"Help me with company formation"</p>
                  <p>"Show me tax benefits in Estonia"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;