import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Globe, Users, Award, TrendingUp, Shield, Zap, Clock, CheckCircle, Star } from 'lucide-react';

const AboutPage = () => {
  const milestones = [
    {
      year: '2016',
      title: 'Foundation',
      description: 'Consulting19 was founded in May 2016 with a vision to simplify international business formation',
      icon: Globe
    },
    {
      year: '2018',
      title: 'Global Expansion',
      description: 'Extended services to 15+ countries, establishing partnerships with local experts worldwide',
      icon: TrendingUp
    },
    {
      year: '2021',
      title: 'Digital Transformation',
      description: 'Launched comprehensive digital platform for streamlined client management and services',
      icon: Zap
    },
    {
      year: '2024',
      title: 'AI Revolution',
      description: 'Introduced AI Oracle - the world\'s first AI-enhanced business consulting platform',
      icon: Bot
    }
  ];

  const aiFeatures = [
    {
      icon: Bot,
      title: 'AI Oracle Intelligence',
      description: 'Advanced AI system that analyzes your business needs and matches you with the perfect jurisdiction and consultant',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI recommendation is verified by our legal experts to ensure compliance and accuracy',
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
      description: 'AI-powered efficiency combined with human expertise for complex business requirements',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    { value: '8+', label: 'Years of Excellence', icon: Award },
    { value: '15,000+', label: 'Businesses Formed', icon: TrendingUp },
    { value: '127', label: 'Countries Served', icon: Globe },
    { value: '98.5%', label: 'Success Rate', icon: Star }
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              Pioneering the Future of{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Business Consulting
              </span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              Since 2016, we've been revolutionizing international business formation. 
              Today, we're proud to introduce the world's first AI-enhanced consulting platform 
              that combines artificial intelligence with human expertise.
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
                <Globe className="h-5 w-5 text-yellow-300" />
                <span>Global Reach</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
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

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a small consulting firm to the world's first AI-enhanced business platform
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-purple-200" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg z-10" />
                  
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <div className="flex items-center space-x-3 mb-3">
                        {index % 2 === 0 ? (
                          <>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{milestone.year}</div>
                              <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                            </div>
                            <div className="bg-purple-100 rounded-lg p-2">
                              <milestone.icon className="h-6 w-6 text-purple-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-purple-100 rounded-lg p-2">
                              <milestone.icon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">{milestone.year}</div>
                              <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Innovation */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              World's First <span className="text-yellow-300">AI-Enhanced</span> Consulting Platform
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              We've revolutionized business consulting by integrating advanced AI technology 
              with human expertise, creating an unprecedented level of service and efficiency.
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

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
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


      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future?</h2>
          <p className="text-lg text-purple-100 mb-8">
            Join thousands of businesses who trust our AI-enhanced consulting platform 
            for their international expansion needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/get-started"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
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

export default AboutPage;