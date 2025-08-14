import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Bot, 
  Globe, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Star,
  Zap,
  Shield,
  Clock,
  Award,
  MessageSquare,
  Building,
  Calculator,
  Scale,
  CreditCard,
  FileText,
  Target,
  Sparkles
} from 'lucide-react';
import { useCountries } from '../hooks/useCountries';
import CountryCard from '../components/CountryCard';

const HomePage = () => {
  const { countries, loading: countriesLoading } = useCountries(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Featured countries for the recommendations section
  const featuredCountries = countries.slice(0, 8);

  const testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'TechStart LLC',
      country: 'Georgia',
      rating: 5,
      text: 'Consulting19 made our Georgian company formation incredibly smooth. The AI recommendations were spot-on, and our consultant Nino was exceptional.',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Ahmed Al-Rashid',
      company: 'Global Investments',
      country: 'UAE',
      rating: 5,
      text: 'The AI Oracle helped us choose the perfect jurisdiction for our investment fund. Professional service and excellent results.',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Maria Santos',
      company: 'Digital Nomad Co',
      country: 'Estonia',
      rating: 5,
      text: 'Estonian e-Residency through Consulting19 was perfect for our digital business. Fast, efficient, and completely online.',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const services = [
    {
      icon: Building,
      title: 'Company Formation',
      description: 'Complete business registration and setup in your chosen jurisdiction',
      features: ['Legal entity creation', 'Tax optimization', 'Compliance setup'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Calculator,
      title: 'Accounting Services',
      description: 'Professional bookkeeping and financial management',
      features: ['Monthly bookkeeping', 'Tax preparation', 'Financial reporting'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Scale,
      title: 'Legal Consulting',
      description: 'Expert legal advice and document preparation',
      features: ['Contract drafting', 'Legal compliance', 'Dispute resolution'],
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: CreditCard,
      title: 'Banking Solutions',
      description: 'Bank account opening and financial services',
      features: ['Account opening', 'Multi-currency', 'Online banking'],
      color: 'from-orange-500 to-red-500'
    }
  ];

  const aiFeatures = [
    {
      icon: Bot,
      title: 'AI Oracle Intelligence',
      description: 'Advanced AI analyzes your business needs and recommends optimal jurisdictions',
      stat: '99.2% accuracy'
    },
    {
      icon: Users,
      title: 'Expert Consultants',
      description: 'Connect with specialized consultants in 127+ countries worldwide',
      stat: '500+ experts'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: '24/7 AI assistance with real-time responses and immediate matching',
      stat: '< 0.3s response'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI recommendation verified by legal experts for compliance',
      stat: '100% verified'
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium">World's First AI-Enhanced Business Consulting</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Global Business
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              AI-powered jurisdiction matching meets human expertise. Get instant recommendations, 
              connect with expert consultants, and launch your international business in 127+ countries.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <Link
                to="/get-started"
                className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <Bot className="h-6 w-6" />
                <span>Try AI Oracle</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/countries"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
              >
                <Globe className="h-6 w-6" />
                <span>Explore Countries</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-1">15,000+</div>
                <div className="text-slate-400 text-sm">Businesses Formed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">127</div>
                <div className="text-slate-400 text-sm">Countries Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">98.5%</div>
                <div className="text-slate-400 text-sm">Success Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
                <div className="text-slate-400 text-sm">Client Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Innovation</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Your AI Business Oracle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI technology that understands your business needs and connects you 
              with the perfect jurisdiction and expert consultant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-3 w-fit mb-6 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg px-3 py-2 w-fit">
                    <span className="text-sm font-semibold text-purple-700">{feature.stat}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Country Recommendations */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full px-6 py-3 mb-6">
              <Bot className="h-5 w-5" />
              <span className="font-medium">AI-Powered Country Recommendations</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect Jurisdictions for Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI analyzes your business needs with intelligent guidance from our AI-powered 
              consultants and comprehensive business services.
            </p>
          </div>

          {countriesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {featuredCountries.map((country, index) => (
                  <CountryCard 
                    key={country.id} 
                    country={country} 
                    featured={index < 2}
                  />
                ))}
              </div>

              <div className="text-center">
                <Link
                  to="/countries"
                  className="inline-flex items-center space-x-2 bg-white border-2 border-purple-200 text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-lg"
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
              Comprehensive Business Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From company formation to ongoing compliance, our expert consultants 
              provide end-to-end business solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className="relative">
                  <div className={`bg-gradient-to-br ${service.color} rounded-xl p-3 w-fit mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our clients say about their experience with Consulting19
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-xl text-gray-700 mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].company}
                    </div>
                    <div className="text-sm text-purple-600">
                      {testimonials[currentTestimonial].country}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex items-center justify-center space-x-2 mt-8">
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

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 rounded-full px-4 py-2 mb-6">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">8+ Years of Excellence</span>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why 15,000+ Businesses Choose Consulting19
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI-Enhanced Efficiency</h4>
                    <p className="text-gray-600">Get instant jurisdiction analysis and consultant matching in seconds, not days.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-lg p-2 flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Legal Compliance Guaranteed</h4>
                    <p className="text-gray-600">Every recommendation is verified by legal experts to ensure full compliance.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-lg p-2 flex-shrink-0">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Global Expert Network</h4>
                    <p className="text-gray-600">Access to 500+ specialized consultants across 127 countries worldwide.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Bot className="h-8 w-8 text-yellow-300" />
                  <div>
                    <h3 className="text-xl font-bold">AI Oracle</h3>
                    <p className="text-purple-200">Your Business Intelligence Assistant</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-100 mb-2">"Based on your tech startup requirements..."</p>
                  <p className="text-white">I recommend Estonia for e-Residency benefits or Delaware for US market access. Both offer excellent tax advantages for your business model.</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-200">✓ Verified by legal experts</span>
                  <span className="text-purple-200">Response time: 0.3s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Launch Your Global Business?
          </h2>
          <p className="text-xl text-purple-100 mb-12">
            Join thousands of successful entrepreneurs who trust our AI-enhanced platform 
            for their international business needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/get-started"
              className="group bg-white text-purple-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <Bot className="h-6 w-6" />
              <span>Start with AI Oracle</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/contact"
              className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
            >
              <MessageSquare className="h-6 w-6" />
              <span>Talk to Expert</span>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Clock className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <h4 className="font-semibold mb-2">Fast Setup</h4>
              <p className="text-purple-100 text-sm">Get started in minutes with AI guidance</p>
            </div>
            <div>
              <Shield className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <h4 className="font-semibold mb-2">100% Compliant</h4>
              <p className="text-purple-100 text-sm">Legal expert verification included</p>
            </div>
            <div>
              <Target className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <h4 className="font-semibold mb-2">Success Guaranteed</h4>
              <p className="text-purple-100 text-sm">98.5% success rate with full support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;