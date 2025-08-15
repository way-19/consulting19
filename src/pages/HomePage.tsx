import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, Shield, Zap, BarChart3, MessageSquare, Users, Globe2,
  TrendingUp, Clock, Building, CheckCircle, Calculator, Scale, Plane, Search,
  CreditCard, Mail, Globe, Eye, Sparkles, FileText
} from 'lucide-react';
import CountryCard from '../components/ModernCountryCard';
import ServiceCard from '../components/ServiceCard';
import { useCountries } from '../hooks/useCountries';
import { useServices } from '../hooks/useServices';
import { getPublicImageUrl } from '../lib/supabase';

const HomePage = () => {
  const navigate = useNavigate(); // <-- eklendi
  const { countries, loading: countriesLoading } = useCountries(true);
  const { services, loading: servicesLoading } = useServices(true);

  const featuredCountries = countries.slice(0, 8);

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    { id: 1, title: "AI-Enhanced Global Intelligence", subtitle: "at Your Service",
      description: "Next-level regulatory guidance with intelligent automation. Our AI-powered platform connects you with expert consultants across the world's most business-friendly jurisdictions.",
      backgroundImage: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Get Started Today", secondaryButton: "Explore Services",
      stats: { companies: "15,247", countries: "127", successRate: "98.2%" } },
    { id: 2, title: "Global Business Formation", subtitle: "Made Simple",
      description: "Expert consultants guide you through international business setup with AI-powered jurisdiction matching. Start your global expansion with confidence and legal compliance.",
      backgroundImage: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Start Formation", secondaryButton: "View Countries",
      stats: { companies: "12,500+", countries: "50+", successRate: "99.1%" } },
    { id: 3, title: "Tax Optimization Strategies", subtitle: "Worldwide",
      description: "Minimize your global tax burden legally with our expert tax consultants. From 0% territorial taxation to offshore structures, we optimize your international tax strategy.",
      backgroundImage: "https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Optimize Taxes", secondaryButton: "Tax Calculator",
      stats: { saved: "$50M+", clients: "3,200+", avgSaving: "35%" } },
    { id: 4, title: "Banking & Financial Services", subtitle: "Global Access",
      description: "Open international bank accounts and access global financial services. Our banking specialists help you establish financial infrastructure in business-friendly jurisdictions.",
      backgroundImage: "https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=1920",
      primaryButton: "Open Account", secondaryButton: "Banking Guide",
      stats: { accounts: "8,900+", banks: "150+", countries: "45+" } }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const aiFeatures = [
    { icon: Bot, title: 'AI-Powered Matching', description: 'Intelligent consultant matching based on your specific requirements', color: 'bg-blue-500' },
    { icon: Shield, title: 'Legal Oversight', description: 'Every AI interaction monitored by legal experts for compliance', color: 'bg-green-500' },
    { icon: Zap, title: 'Instant Responses', description: '24/7 AI assistance with human expert backup when needed', color: 'bg-purple-500' }
  ];

  const analyticsMetrics = [
    { value: '15,247', label: 'Active Businesses', icon: Users },
    { value: '98.2%', label: 'Success Rate', icon: TrendingUp },
    { value: '127', label: 'Countries Served', icon: Globe2 },
    { value: '47min', label: 'Avg Response Time', icon: Clock }
  ];

  return (
    <div className="min-h-screen">
      {/* ... HERO ve diğer bölümler aynı ... */}

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
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=company_formation')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=company_formation')}
              role="link" tabIndex={0} aria-label="Company Formation"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Company Formation</h3>
                  <p className="text-gray-200 text-sm mb-4">
                    Complete business registration and incorporation services across 127+ jurisdictions
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">LLC & Corporation setup</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Legal documentation</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Compliance support</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Get Started</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Advisory */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/7357/startup-photos.jpg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=investment')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=investment')}
              role="link" tabIndex={0} aria-label="Investment Advisory"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><TrendingUp className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Investment Advisory</h3>
                  <p className="text-gray-200 text-sm mb-4">Strategic investment guidance and portfolio optimization for international markets</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Market analysis</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Risk assessment</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Portfolio strategy</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Learn More</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Consulting */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=legal')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=legal')}
              role="link" tabIndex={0} aria-label="Legal Consulting"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><Scale className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Legal Consulting</h3>
                  <p className="text-gray-200 text-sm mb-4">Expert legal advice and documentation for international business operations</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Contract drafting</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Compliance review</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Legal representation</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Explore</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accounting Services */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=accounting')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=accounting')}
              role="link" tabIndex={0} aria-label="Accounting Services"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><Calculator className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Accounting Services</h3>
                  <p className="text-gray-200 text-sm mb-4">Professional bookkeeping, tax preparation, and financial reporting services</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Monthly bookkeeping</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Tax preparation</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Financial reports</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>View Services</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Visa & Residence */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=visa')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=visa')}
              role="link" tabIndex={0} aria-label="Visa & Residence"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><Globe className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Visa & Residence</h3>
                  <p className="text-gray-200 text-sm mb-4">Comprehensive visa and residence permit services for global mobility</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Visa applications</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Residence permits</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Citizenship pathways</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Apply Now</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Market Research */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=research')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=research')}
              role="link" tabIndex={0} aria-label="Market Research"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><Users className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Market Research</h3>
                  <p className="text-gray-200 text-sm mb-4">In-depth market analysis and business intelligence for informed decision making</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Market analysis</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Competitor research</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Industry insights</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Research</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Banking Solutions */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=banking')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=banking')}
              role="link" tabIndex={0} aria-label="Banking Solutions"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><CreditCard className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Banking Solutions</h3>
                  <p className="text-gray-200 text-sm mb-4">International banking services and account opening assistance worldwide</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Account opening</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Multi-currency accounts</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Online banking setup</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Open Account</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Ongoing Compliance */}
            <div
              className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group h-80 cursor-pointer"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              onClick={() => navigate('/services?category=compliance')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/services?category=compliance')}
              role="link" tabIndex={0} aria-label="Ongoing Compliance"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="relative z-10 p-6 flex flex-col h-full justify-between text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6 w-fit"><FileText className="h-8 w-8 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Ongoing Compliance</h3>
                  <p className="text-gray-200 text-sm mb-4">Continuous compliance monitoring and regulatory updates for your business</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Regulatory monitoring</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Annual filings</span></div>
                    <div className="flex items-center space-x-2"><CheckCircle className="h-4 w-4 text-green-300" /><span className="text-sm text-gray-200">Updates & alerts</span></div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium border border-white/30">
                    <span>Stay Compliant</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* NOT: Digital Nomad Services ve Wealth Management KALDIRILDI */}
          </div>
        </div>
      </section>

      {/* ... sayfanın devamı aynı ... */}
    </div>
  );
};

export default HomePage;
