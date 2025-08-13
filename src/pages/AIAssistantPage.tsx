import React, { useState } from 'react';
import { useEffect } from 'react';
import { Bot, Mic, Volume2, Globe, Shield, Zap, MessageSquare, Users, CheckCircle, ArrowRight, Play, Pause } from 'lucide-react';

const AIAssistantPage = () => {
  const [isListening, setIsListening] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const demoConversations = [
    {
      country: 'Georgia',
      flag: '🇬🇪',
      question: "What are the tax benefits of starting a company in Georgia?",
      answer: "Georgia offers territorial taxation with 0% tax on foreign-sourced income. You can benefit from small business status with deferred profit tax and access to free economic zones."
    },
    {
      country: 'Estonia',
      flag: '🇪🇪',
      question: "How does e-Residency work for my business?",
      answer: "Estonian e-Residency allows you to establish and manage an EU company entirely online. You get digital identity, access to banking, and can run your business from anywhere."
    },
    {
      country: 'UAE',
      flag: '🇦🇪',
      question: "Can I get 0% tax in UAE free zones?",
      answer: "Yes! UAE free zones offer 0% corporate and personal income tax, 100% foreign ownership, and full profit repatriation. Perfect for international businesses."
    }
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Intelligence',
      description: 'Advanced AI analyzes your business requirements and matches you with optimal jurisdictions and expert consultants.',
      color: 'bg-blue-500'
    },
    {
      icon: Mic,
      title: 'Voice Interaction',
      description: 'Natural voice conversations in multiple languages. Simply speak your questions and get instant intelligent responses.',
      color: 'bg-green-500'
    },
    {
      icon: Globe,
      title: 'Multi-Language Support',
      description: 'Communicate in English, Turkish, Georgian, Russian, Spanish, French, German, Italian, Portuguese, and Arabic.',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Legal Oversight',
      description: 'Every AI recommendation is verified by our legal experts to ensure compliance and accuracy across all jurisdictions.',
      color: 'bg-red-500'
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: '24/7 availability with real-time responses. Get immediate answers to complex international business questions.',
      color: 'bg-yellow-500'
    },
    {
      icon: Users,
      title: 'Expert Backup',
      description: 'Seamless handoff to human experts when needed. AI efficiency combined with human expertise for complex requirements.',
      color: 'bg-indigo-500'
    }
  ];

  const supportedCountries = [
    { name: 'Georgia', flag: '🇬🇪', specialties: ['0% Foreign Tax', 'Free Zones', 'Easy Setup'] },
    { name: 'United States', flag: '🇺🇸', specialties: ['Delaware LLC', 'Market Access', 'Banking'] },
    { name: 'Montenegro', flag: '🇲🇪', specialties: ['EU Candidate', 'Investment', 'Citizenship'] },
    { name: 'Estonia', flag: '🇪🇪', specialties: ['e-Residency', 'Digital', 'EU Access'] },
    { name: 'Portugal', flag: '🇵🇹', specialties: ['Golden Visa', 'EU Benefits', 'Atlantic Hub'] },
    { name: 'Malta', flag: '🇲🇹', specialties: ['EU Member', 'Financial Hub', 'Tax Benefits'] },
    { name: 'Panama', flag: '🇵🇦', specialties: ['Offshore', 'Privacy', 'Banking'] },
    { name: 'UAE', flag: '🇦🇪', specialties: ['0% Tax Zones', 'Middle East', 'Modern'] },
    { name: 'Switzerland', flag: '🇨🇭', specialties: ['Stability', 'Banking', 'Premium'] },
    { name: 'Spain', flag: '🇪🇸', specialties: ['EU Member', 'Startups', 'Quality Life'] }
  ];

  const useCases = [
    {
      title: 'Jurisdiction Selection',
      description: 'Find the perfect country for your business based on tax benefits, regulations, and market access.',
      example: '"Which country offers the best tax advantages for my tech startup?"'
    },
    {
      title: 'Company Formation',
      description: 'Get step-by-step guidance on company registration processes across different jurisdictions.',
      example: '"How do I register a company in Estonia with e-Residency?"'
    },
    {
      title: 'Tax Optimization',
      description: 'Understand tax implications and optimization strategies for international business structures.',
      example: '"What are the tax benefits of Georgian territorial taxation?"'
    },
    {
      title: 'Banking Solutions',
      description: 'Learn about banking options and requirements for opening accounts in different countries.',
      example: '"Can I open a bank account in Switzerland as a non-resident?"'
    },
    {
      title: 'Compliance Requirements',
      description: 'Stay informed about ongoing compliance obligations and regulatory requirements.',
      example: '"What are the annual filing requirements for a Malta company?"'
    },
    {
      title: 'Investment Opportunities',
      description: 'Discover investment programs, residency options, and citizenship by investment opportunities.',
      example: '"Tell me about Portugal\'s Golden Visa investment requirements."'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold">
                AI <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Oracle</span>
              </h1>
            </div>
            <p className="text-xl text-purple-100 mb-8 leading-relaxed">
              World's first AI-enhanced business consulting assistant. Get instant, intelligent guidance 
              for international business formation across 127+ countries with voice interaction and 
              multi-language support.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Mic className="h-5 w-5 text-yellow-300" />
                <span>Voice Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-yellow-300" />
                <span>10 Languages</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-300" />
                <span>Legal Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AI Oracle Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI technology combined with human expertise to provide 
              unparalleled business consulting services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              See AI Oracle in <span className="text-cyan-400">Action</span>
            </h2>
            <p className="text-xl text-purple-100">
              Experience real conversations with our AI assistant
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Chat Interface */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-700 px-4 py-3 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <span className="text-white text-sm ml-4">AI Oracle Assistant</span>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs">Online</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 h-80 overflow-y-auto">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="bg-slate-700 rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm text-white">
                        {demoConversations[currentDemo].answer}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 justify-end">
                    <div className="bg-purple-600 text-white rounded-lg px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        {demoConversations[currentDemo].question}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                  </div>

                  <div className="bg-blue-900/50 rounded-lg p-3 border border-blue-400/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{demoConversations[currentDemo].flag}</span>
                      <span className="text-cyan-400 font-medium">{demoConversations[currentDemo].country} Specialist</span>
                    </div>
                    <p className="text-sm text-blue-200">✨ AI Analysis Complete - Matched with expert consultant</p>
                  </div>
                </div>

                <div className="border-t border-slate-700 p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsListening(!isListening);
                        if (!isListening) {
                          setTimeout(() => setIsListening(false), 3000);
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isListening ? <Volume2 className="h-4 w-4 text-white animate-pulse" /> : <Mic className="h-4 w-4 text-white" />}
                    </button>
                    <div className="flex-1 bg-slate-700 rounded-lg px-3 py-2">
                      <input 
                        type="text" 
                        placeholder={isListening ? "Listening..." : "Ask about any jurisdiction..."}
                        className="w-full bg-transparent text-sm text-white placeholder-slate-400 outline-none"
                        disabled
                      />
                    </div>
                    <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Demo Controls */}
              <div className="mt-6 flex items-center justify-center space-x-4">
                {demoConversations.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDemo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentDemo 
                        ? 'bg-cyan-400 scale-125' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Intelligent Capabilities</h3>
              
              {features.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className={`${feature.color} rounded-lg p-2 shadow-lg`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                    <p className="text-purple-100 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Countries */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Expert Knowledge Across <span className="text-purple-600">10 Jurisdictions</span>
            </h2>
            <p className="text-xl text-gray-600">
              AI Oracle has comprehensive knowledge of business formation, tax benefits, 
              and regulatory requirements across our supported countries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {supportedCountries.map((country, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="text-4xl mb-4">{country.flag}</div>
                <h3 className="font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {country.name}
                </h3>
                <div className="space-y-1">
                  {country.specialties.map((specialty, idx) => (
                    <span key={idx} className="block text-xs text-gray-600 bg-gray-100 rounded-full px-2 py-1">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What You Can Ask</h2>
            <p className="text-xl text-gray-600">
              AI Oracle can help with any aspect of international business formation and optimization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{useCase.description}</p>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-purple-700 italic">{useCase.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Technical <span className="text-cyan-400">Specifications</span>
            </h2>
            <p className="text-xl text-slate-300">
              Advanced AI technology with enterprise-grade security and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-cyan-400 text-2xl font-bold mb-2">24/7</div>
              <h4 className="font-semibold text-white mb-2">Availability</h4>
              <p className="text-slate-300 text-sm">Always online and ready to assist</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-green-400 text-2xl font-bold mb-2">10</div>
              <h4 className="font-semibold text-white mb-2">Languages</h4>
              <p className="text-slate-300 text-sm">Multi-language voice and text support</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-purple-400 text-2xl font-bold mb-2">127+</div>
              <h4 className="font-semibold text-white mb-2">Countries</h4>
              <p className="text-slate-300 text-sm">Global jurisdiction knowledge</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-yellow-400 text-2xl font-bold mb-2">0.3s</div>
              <h4 className="font-semibold text-white mb-2">Response Time</h4>
              <p className="text-slate-300 text-sm">Lightning-fast intelligent responses</p>
            </div>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Admin Panel Integration</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Webhook-independent operation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Admin panel controlled settings</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Embed code integration ready</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span>Real-time monitoring and analytics</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-6 w-6 text-purple-400" />
                  <span className="font-semibold">Security Features</span>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• End-to-end encryption</p>
                  <p>• GDPR compliant data handling</p>
                  <p>• Legal expert verification</p>
                  <p>• Audit trail logging</p>
                  <p>• Multi-factor authentication</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Languages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Speak in Your <span className="text-purple-600">Native Language</span>
            </h2>
            <p className="text-xl text-gray-600">
              AI Oracle communicates fluently in 10 languages with voice and text support
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { code: 'en', name: 'English', flag: '🇺🇸' },
              { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
              { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
              { code: 'ru', name: 'Русский', flag: '🇷🇺' },
              { code: 'es', name: 'Español', flag: '🇪🇸' },
              { code: 'fr', name: 'Français', flag: '🇫🇷' },
              { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
              { code: 'it', name: 'Italiano', flag: '🇮🇹' },
              { code: 'pt', name: 'Português', flag: '🇵🇹' },
              { code: 'ar', name: 'العربية', flag: '🇸🇦' }
            ].map((lang, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center hover:bg-purple-50 transition-colors border border-gray-200">
                <div className="text-3xl mb-2">{lang.flag}</div>
                <h4 className="font-medium text-gray-900">{lang.name}</h4>
                <p className="text-xs text-gray-500 mt-1">Voice & Text</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience AI Oracle?</h2>
          <p className="text-lg text-purple-100 mb-8">
            Start your conversation with the world's most advanced business consulting AI. 
            Get instant answers and expert consultant matching.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Start AI Conversation</span>
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center space-x-2">
              <Mic className="h-5 w-5" />
              <span>Try Voice Assistant</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIAssistantPage;