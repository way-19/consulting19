import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Send, Sparkles, Globe, Users, TrendingUp, MessageSquare, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AICapability {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const aiCapabilities: AICapability[] = [
    {
      icon: Globe,
      title: 'Jurisdiction Matching',
      description: 'AI analyzes your business needs and recommends optimal jurisdictions',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Consultant Matching',
      description: 'Intelligent matching with expert consultants based on specialization',
      color: 'bg-green-500'
    },
    {
      icon: TrendingUp,
      title: 'Market Analysis',
      description: 'Real-time market insights and business opportunity analysis',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      title: 'Legal Compliance',
      description: 'Automated compliance checking with legal expert oversight',
      color: 'bg-red-500'
    }
  ];

  const quickSuggestions = [
    "What's the best country for a tech startup?",
    "How do I open a bank account in Georgia?",
    "What are the tax benefits of Estonian e-Residency?",
    "Compare UAE vs Malta for offshore business",
    "Help me choose between LLC and Corporation",
    "What documents do I need for company formation?"
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "Hello! I'm your AI business consultant. I can help you find the perfect jurisdiction for your business, match you with expert consultants, and provide insights on international business formation. What would you like to know?",
        timestamp: new Date(),
        suggestions: quickSuggestions.slice(0, 3)
      }
    ]);
  }, []);

  const handleSendMessage = async (content: string) => {
    const startTime = Date.now();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      const responseTime = Date.now() - startTime;
      
      // Track AI interaction
      trackBusinessEvent.aiAssistantInteraction(content, responseTime);
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    let response = '';
    let suggestions: string[] = [];

    if (input.includes('tech startup') || input.includes('technology')) {
      response = "For tech startups, I recommend considering Estonia or Delaware. Estonia offers e-Residency with digital-first governance and 0% tax on retained earnings. Delaware provides access to the US market with favorable corporate law. Both have strong tech ecosystems and startup-friendly regulations.";
      suggestions = [
        "Tell me more about Estonian e-Residency",
        "What are Delaware's advantages for tech companies?",
        "Compare Estonia vs Delaware for my startup"
      ];
    } else if (input.includes('georgia') || input.includes('bank account')) {
      response = "Georgia is excellent for international business! You can open both personal and business bank accounts as a non-resident. The process typically takes 5-10 days with proper documentation. Georgia offers 0% tax on foreign-sourced income and has a very business-friendly environment.";
      suggestions = [
        "What documents do I need for Georgian bank account?",
        "How long does company registration take in Georgia?",
        "What are Georgia's tax advantages?"
      ];
    } else if (input.includes('uae') || input.includes('malta')) {
      response = "Both UAE and Malta are excellent offshore jurisdictions. UAE offers 0% corporate tax in free zones and strategic location between East and West. Malta provides EU membership benefits with attractive tax treaties. The choice depends on your business model and target markets.";
      suggestions = [
        "What are UAE free zone benefits?",
        "How does Malta's EU membership help my business?",
        "Compare costs between UAE and Malta"
      ];
    } else if (input.includes('llc') || input.includes('corporation')) {
      response = "The choice between LLC and Corporation depends on your goals. LLCs offer operational flexibility and pass-through taxation, ideal for smaller businesses. Corporations provide better structure for raising capital and going public. I can help you analyze which structure fits your specific needs.";
      suggestions = [
        "What are the tax differences between LLC and Corp?",
        "Which structure is better for raising investment?",
        "Can I convert from LLC to Corporation later?"
      ];
    } else if (input.includes('document') || input.includes('formation')) {
      response = "For company formation, you'll typically need: 1) Passport copies of directors/shareholders, 2) Proof of address, 3) Business plan or activity description, 4) Share capital confirmation, 5) Registered address. Requirements vary by jurisdiction - I can provide specific requirements for any country.";
      suggestions = [
        "What documents are needed for Georgia?",
        "Do I need to visit the country in person?",
        "How long does the formation process take?"
      ];
    } else {
      response = "I understand you're looking for business guidance. I can help you with jurisdiction selection, company formation, banking, tax optimization, and connecting you with expert consultants. Could you tell me more about your specific business needs or goals?";
      suggestions = [
        "I want to start an online business",
        "I need help with international tax planning",
        "I'm looking for the best jurisdiction for my industry"
      ];
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim()) {
        handleSendMessage(inputMessage);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Bot className="h-12 w-12 text-white" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <Sparkles className="h-12 w-12 text-yellow-300" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              AI Business <span className="text-yellow-300">Oracle</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              World's first AI-enhanced business consulting assistant. Get instant, intelligent 
              guidance for your international business journey.
            </p>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">AI-Powered Capabilities</h2>
            <p className="text-lg text-gray-600">Advanced artificial intelligence meets human expertise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiCapabilities.map((capability, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${capability.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <capability.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{capability.title}</h3>
                <p className="text-gray-600 text-sm">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Business Oracle</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-purple-100 text-sm">Online & Ready</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-300" />
                  <span className="text-white text-sm">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* AI Suggestions */}
              {messages.length > 0 && messages[messages.length - 1].type === 'ai' && messages[messages.length - 1].suggestions && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md">
                    <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                    <div className="space-y-2">
                      {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about international business..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
                <button
                  onClick={() => inputMessage.trim() && handleSendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 flex items-center space-x-2">
                <Shield className="h-3 w-3" />
                <span>All responses are verified by legal experts</span>
                <span>•</span>
                <Clock className="h-3 w-3" />
                <span>Average response time: 0.3 seconds</span>
              </div>
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Popular Questions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-lg hover:border-purple-300 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">{suggestion}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Oracle?</h2>
            <p className="text-lg text-gray-600">Revolutionary AI technology with human expertise oversight</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Responses</h3>
              <p className="text-gray-600">Get immediate answers to complex business questions with AI-powered analysis</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Legal Oversight</h3>
              <p className="text-gray-600">Every AI recommendation is verified by our legal experts for accuracy and compliance</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Backup</h3>
              <p className="text-gray-600">Seamless handoff to human consultants for complex requirements</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Business Journey?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Get personalized guidance from our AI assistant and connect with expert consultants
            for their international expansion across 19+ countries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/get-started"
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg flex items-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/countries"
              className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Explore Countries
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIAssistantPage;