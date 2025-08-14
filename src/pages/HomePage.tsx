import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Shield, Zap, BarChart3, MessageSquare, Users, Globe2, TrendingUp, Clock, Building, CheckCircle, Calculator, Scale, Plane, Search, CreditCard, Mail, Globe, Eye, Sparkles } from 'lucide-react';
import ModernCountryCard from '../components/ModernCountryCard';
import ServiceCard from '../components/ServiceCard';
import { useCountries } from '../hooks/useCountries';
import { useServices } from '../hooks/useServices';
import { getPublicImageUrl } from '../lib/supabase';

const HomePage = () => {
  const { countries, loading: countriesLoading } = useCountries(true);
  const { services, loading: servicesLoading } = useServices(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const featuredCountries = countries.filter(country => country.is_active).slice(0, 8);
  const featuredServices = services.slice(0, 6);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechStart LLC',
      country: 'Estonia',
      text: 'Consulting19 made our Estonian e-Residency and company formation incredibly smooth. The AI recommendations were spot-on!',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Ahmed Al-Rashid',
      company: 'Global Investments',
      country: 'UAE',
      text: 'Outstanding service for UAE company formation. The consultant was knowledgeable and the process was faster than expected.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Maria Garcia',
      company: 'European Trading',
      country: 'Malta',
      text: 'Perfect for EU market access. The team handled everything professionally and kept us informed throughout.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const aiFeatures = [
    {
      icon: Bot,
      title: 'AI Oracle Intelligence',
      description: 'Advanced AI analyzes your business needs and recommends the perfect jurisdiction and consultant',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI recommendation is verified by legal experts for compliance and accuracy',
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
      title: 'Human Expertise',
      description: 'AI-powered efficiency combined with human expertise for complex requirements',
      color: 'bg-orange-500'
    }
  ];

  const platformStats = [
    { value: '15,000+', label: 'Businesses Formed', icon: Building },
    { value: '127', label: 'Countries Served', icon: Globe },
    { value: '98.5%', label: 'Success Rate', icon: TrendingUp },
    { value: '2.3h', label: 'Avg Response Time', icon: Clock }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Bot className="h-12 w-12 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <Sparkles className="h-12 w-12 text-yellow-300" />
                </div>
              </div>
              
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                World's First{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  AI-Enhanced
                </span>{' '}
                Business Consulting
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Revolutionary AI Oracle technology combined with expert human consultants. 
                Get instant, intelligent guidance for your international business journey 
                across 127+ countries.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Link
                  to="/get-started"
                  className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/ai-assistant"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <Bot className="h-5 w-5" />
                  <span>Try AI Oracle</span>
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-300" />
                  <span>8+ Years Experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-yellow-300" />
                  <span>AI-Powered Innovation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-300" />
                  <span>Global Reach</span>
                </div>
              </div>
            </div>

            {/* AI Demo Interface */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-purple-300" />
                <span className="font-semibold text-white">AI Oracle</span>
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm">Online</span>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <div className="text-purple-200 text-sm mb-2">"I want to start a tech company..."</div>
                <div className="text-white text-sm">
                  Based on your tech startup requirements, I recommend Estonia for e-Residency 
                  benefits or Delaware for US market access. Both offer excellent tax advantages 
                  for your business model.
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>✓ Verified by legal experts</span>
                <span>Response time: 0.3s</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {platformStats.map((stat, index) => (
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

      {/* AI Features */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Revolutionary <span className="text-yellow-300">AI Technology</span>
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Experience the future of business consulting with our groundbreaking AI Oracle system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
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

      {/* Featured Countries */}
      <section id="countries" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Country <span className="text-purple-600">Recommendations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI analyzes your business needs with intelligent guidance from our AI-powered 
              consultants and comprehensive business services.
            </p>
          </div>

          {countriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredCountries.map((country) => (
                <ModernCountryCard key={country.id} country={country} />
              ))}
            </div>
          )}

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

      {/* Featured Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert <span className="text-purple-600">Business Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive international business solutions delivered by expert consultants
            </p>
          </div>

          {servicesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : featuredServices.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Services Coming Soon</h3>
              <p className="text-gray-600">Our consultants are preparing amazing services for you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

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

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by <span className="text-purple-600">Global Entrepreneurs</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of successful businesses who chose our platform
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center">
                <img
                  src={testimonials[currentTestimonial].avatar}
                  alt={testimonials[currentTestimonial].name}
                  className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
                />
                
                <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <CheckCircle key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <div>
                  <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].company}</div>
                  <div className="text-purple-600 text-sm">{testimonials[currentTestimonial].country}</div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg text-purple-100 mb-8">
            Join the AI revolution in business consulting. Get started with our intelligent 
            platform and expert consultants today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/get-started"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/ai-assistant"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center space-x-2"
            >
              <Bot className="h-5 w-5" />
              <span>Experience AI Oracle</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;