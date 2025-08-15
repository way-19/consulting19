import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Globe, Users, DollarSign, Mail, Send, CheckCircle, AlertTriangle, ArrowRight, Star, Shield, Zap, TrendingUp, Award, Building, Clock, Target, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCountries } from '../hooks/useCountries';
import useNotifications from '../hooks/useNotifications';

const PartnershipProgramPage = () => {
  const { countries, loading: countriesLoading } = useCountries(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { createNotification } = useNotifications();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('partnership_applications')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          message: formData.message,
          status: 'new'
        }]);

      if (error) throw error;

      // Notify admins
      const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminError) console.error('Error fetching admins for notification:', adminError);

      if (admins) {
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'new_partnership_application',
            'New Partnership Application',
            `A new partnership application from ${formData.fullName} (${formData.country}) has been submitted.`,
            'high',
            'partnership_applications',
            null,
            '/admin-dashboard'
          );
        }
      }

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting partnership application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const aiFeatures = [
    {
      icon: Bot,
      title: 'AI Oracle Intelligence',
      description: 'Advanced AI system that analyzes business needs and matches clients with perfect jurisdictions and consultants',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI recommendation is verified by legal experts to ensure compliance and accuracy',
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
      title: 'Global Network',
      description: 'Access to our curated network of expert consultants across 19+ countries',
      color: 'bg-orange-500'
    }
  ];

  const partnershipBenefits = [
    {
      icon: DollarSign,
      title: 'Lucrative Revenue Streams',
      description: 'Access high-value clients with average order values of $2,500-$5,000 per engagement',
      stats: '$2.5M+ annual platform revenue'
    },
    {
      icon: Bot,
      title: 'AI-Enhanced Efficiency',
      description: 'Our AI Oracle pre-qualifies leads and matches you with ideal clients automatically',
      stats: '85% faster client acquisition'
    },
    {
      icon: Globe,
      title: 'Global Market Access',
      description: 'Tap into international markets with clients seeking expertise in your jurisdiction',
      stats: '127+ countries served'
    },
    {
      icon: Users,
      title: 'Expert Support Network',
      description: 'Join a community of top-tier consultants with shared resources and knowledge',
      stats: '98.5% client satisfaction rate'
    },
    {
      icon: Shield,
      title: 'Platform Infrastructure',
      description: 'Leverage our secure, scalable platform with built-in compliance and legal tools',
      stats: '99.9% uptime guarantee'
    },
    {
      icon: TrendingUp,
      title: 'Business Growth',
      description: 'Scale your practice with our marketing, lead generation, and business development support',
      stats: '300% average partner growth'
    }
  ];

  const platformFeatures = [
    {
      icon: Bot,
      title: 'AI Oracle System',
      description: 'Intelligent client matching and jurisdiction recommendations powered by machine learning'
    },
    {
      icon: Building,
      title: 'Multi-Country Operations',
      description: 'Seamless operations across 19+ jurisdictions with local expertise and global standards'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time performance metrics, client insights, and revenue optimization tools'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with end-to-end encryption and compliance monitoring'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Professional Background */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern business meeting"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/90 to-blue-900/95" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Bot className="h-16 w-16 text-yellow-300" />
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
              <Globe className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            Partner with the World's First <span className="text-yellow-300">AI-Powered</span> Consulting Platform
          </h1>
          <p className="text-xl text-purple-100 max-w-4xl mx-auto mb-8 leading-relaxed">
            Join Consulting19 and revolutionize global business formation with our cutting-edge AI Oracle technology, 
            expert network spanning 19+ countries, and proven track record of 98.5% client satisfaction.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-300" />
              <span>8+ Years Experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-yellow-300" />
              <span>AI-Powered Innovation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-yellow-300" />
              <span>15,000+ Businesses Formed</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Platform Overview */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Revolutionary <span className="text-yellow-300">AI-Enhanced</span> Business Consulting
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto">
              Our proprietary AI Oracle system combines advanced machine learning with human expertise, 
              creating an unprecedented level of service efficiency and client satisfaction in the business consulting industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">The AI Oracle Advantage</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Instant jurisdiction analysis and recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Automated consultant matching based on expertise</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>24/7 intelligent assistance and support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Legal compliance verification for all recommendations</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Bot className="h-6 w-6 text-purple-400" />
                  <span className="font-semibold">AI Oracle</span>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-sm">
                  <p className="text-purple-200 mb-2">"Based on your tech startup requirements..."</p>
                  <p className="text-white">I recommend Estonia for e-Residency benefits or Delaware for US market access. Both offer excellent tax advantages for your business model.</p>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  ✓ Verified by legal experts • Response time: 0.3s
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Partnership Benefits & Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join our exclusive network of expert consultants and unlock unprecedented business opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnershipBenefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-3">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-purple-600 font-medium">{benefit.stats}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced Platform Features</h2>
            <p className="text-xl text-gray-600">
              Leverage cutting-edge technology and comprehensive tools designed for modern consulting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {platformFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Investment */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 border border-gray-200 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Partnership Investment</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our annual maintenance and dealership fee ensures access to our premium platform features, 
              AI tools, global client network, and comprehensive business support.
            </p>
            
            {/* First Year Free Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg mb-8 transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Star className="h-8 w-8 text-yellow-300" />
                <span className="text-2xl font-bold">SPECIAL LAUNCH OFFER</span>
                <Star className="h-8 w-8 text-yellow-300" />
              </div>
              <p className="text-3xl font-bold mb-2">First Year FREE</p>
              <p className="text-lg text-green-100">
                Join now and get complete platform access at no cost for your first 12 months
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-8 shadow-lg mb-8">
              <p className="text-sm font-semibold mb-2 text-purple-200">Annual Fee (Starting Year 2)</p>
              <p className="text-5xl font-bold mb-4">$9,000 USD</p>
              <p className="text-lg text-purple-100">
                Includes platform access, AI Oracle tools, global client referrals, and dedicated support
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-yellow-900">Important Application Criteria</h3>
              </div>
              <p className="text-lg text-yellow-800 mb-4">
                We are seeking partners to expand our global reach. Therefore, applications are currently 
                accepted <strong>ONLY for countries where Consulting19 does NOT yet have an existing service presence.</strong>
              </p>
              <p className="text-sm text-yellow-700">
                Please ensure your country of specialization is not already listed on our "Countries" page before applying.
              </p>
              <div className="mt-4">
                <Link
                  to="/countries"
                  className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span>Check Available Countries</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Partner Success Stories</h2>
            <p className="text-xl text-gray-600">See how our partners are thriving with Consulting19</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Nino Kvaratskhelia"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">Nino Kvaratskhelia</h4>
                  <p className="text-purple-600 font-medium">Georgia Specialist</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">4.9 Rating</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The AI Oracle has transformed my practice. I now serve 3x more clients with better outcomes 
                and higher satisfaction rates."
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">1,247</p>
                  <p className="text-xs text-gray-600">Clients Served</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">$245K</p>
                  <p className="text-xs text-gray-600">Annual Revenue</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Johnson</h4>
                  <p className="text-purple-600 font-medium">USA Specialist</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">4.8 Rating</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The platform's efficiency tools and AI matching have doubled my client acquisition rate 
                while reducing administrative overhead."
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">892</p>
                  <p className="text-xs text-gray-600">Clients Served</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">$189K</p>
                  <p className="text-xs text-gray-600">Annual Revenue</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Ahmed Al-Rashid</h4>
                  <p className="text-purple-600 font-medium">UAE Specialist</p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">4.7 Rating</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Joining Consulting19 was the best business decision I made. The AI tools and global 
                network opened doors I never imagined."
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">634</p>
                  <p className="text-xs text-gray-600">Clients Served</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">$156K</p>
                  <p className="text-xs text-gray-600">Annual Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Apply for Partnership</h2>
              <p className="text-lg text-gray-600">
                Submit your application for an initial consultation and learn more about becoming a Consulting19 partner
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Your application has been sent successfully! We will review it and get back to you within 48 hours.</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">An error occurred while submitting your application. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country of Specialization *
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select your country of expertise...</option>
                    {countriesLoading ? (
                      <option disabled>Loading countries...</option>
                    ) : (
                      countries.map(country => (
                        <option key={country.id} value={country.name}>
                          {country.flag_emoji} {country.name}
                        </option>
                      ))
                    )}
                    <option value="Other">🌍 Other (Not Listed)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose your area of expertise or select "Other" for unlisted countries
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Tell Us About Your Experience
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Tell us about your consulting experience, expertise, and why you'd like to partner with Consulting19..."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">What Happens Next?</h4>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• We'll review your application within 48 hours</p>
                  <p>• Qualified candidates will be invited for a video consultation</p>
                  <p>• Successful applicants receive onboarding and training</p>
                  <p>• Start earning with your first year completely free</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Partnership Application</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Consulting Practice?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join the future of business consulting with AI-powered efficiency and global reach
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/ai-assistant"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <Bot className="h-5 w-5" />
              <span>Try AI Oracle</span>
            </Link>
            <Link
              to="/countries"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center space-x-2"
            >
              <Globe className="h-5 w-5" />
              <span>View Available Countries</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnershipProgramPage;