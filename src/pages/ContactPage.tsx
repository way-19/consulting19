import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, AlertCircle, Globe, Users, Shield, ChevronDown } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'suggestion'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'suggestion'
      });
    }, 2000);
  };

  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  const faqs = [
    {
      id: 'registration-process',
      question: 'How does the process work after registration?',
      answer: 'After registration, you will be assigned a dedicated consultant who specializes in your chosen jurisdiction. All communication is conducted through our secure online platform. Your consultant will guide you through each step of the business formation process, from document preparation to final registration.'
    },
    {
      id: 'countries-served',
      question: 'Which countries do you serve?',
      answer: 'We provide business formation services in 19+ countries worldwide, including popular jurisdictions like Georgia, Estonia, UAE, Malta, USA, Switzerland, and many more. Each country has dedicated local consultants who understand the specific requirements and regulations.'
    },
    {
      id: 'ai-consultant',
      question: 'How does the AI consultant work?',
      answer: 'Our AI Oracle analyzes your business requirements, goals, and preferences to recommend the most suitable jurisdictions and services. It considers factors like tax implications, business structure, market access, and regulatory requirements. All AI recommendations are verified by our legal experts before being presented to you.'
    },
    {
      id: 'communication',
      question: 'How do we communicate during the process?',
      answer: 'All communication is conducted exclusively through our secure online platform. You will have direct access to your assigned consultant via our messaging system, which includes real-time translation capabilities for international clients. No phone calls are made as part of our standardized process.'
    },
    {
      id: 'timeline',
      question: 'How long does company formation take?',
      answer: 'Timeline varies by jurisdiction. Most company formations are completed within 5-15 business days. Simple jurisdictions like Georgia can be completed in 3-5 days, while more complex jurisdictions may take 2-3 weeks. Your consultant will provide specific timelines based on your chosen jurisdiction and requirements.'
    },
    {
      id: 'pricing',
      question: 'What are your service fees?',
      answer: 'Our fees vary by jurisdiction and service complexity. Basic company formation starts from $800-$3000 depending on the country. All fees are transparent and disclosed upfront with no hidden charges. Additional services like banking, accounting, or legal consultation are priced separately.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Get in <span className="text-yellow-300">Touch</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              We're here to help you with your international business journey. 
              Connect with our global team for support and guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 bg-blue-50 border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  🌍 Important Notice
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p className="leading-relaxed">
                    <strong>English:</strong> Each of our country consultants provides services locally. 
                    After your registration is completed, all communication is conducted exclusively 
                    through our online platform. No phone calls are made.
                  </p>
                  <p className="leading-relaxed">
                    <strong>Türkçe:</strong> Her ülke danışmanlığımız yerel olarak hizmet vermektedir. 
                    Kayıt işleminiz tamamlandıktan sonra, tüm iletişim sadece online platformumuz 
                    üzerinden gerçekleştirilmektedir. Telefon görüşmesi yapılmamaktadır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Main System Form
              </h2>
              <p className="text-gray-600">
                Use our main system form for suggestions and complaints.
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Your message has been sent successfully!</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">An error occurred. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="support">Support</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your message subject"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Write your message in detail..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Company Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600">hello@consulting19.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Response within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Online Support</h4>
                    <p className="text-gray-600">Live support through platform</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Available 24/7 for registered users
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Head Office</h4>
                    <p className="text-gray-600">Way19 LLC</p>
                    <p className="text-gray-600">Wyoming, USA</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Registered business address
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Features */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Service Features
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">127+ countries with expert consultants</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">98.5% success rate</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">AI-enhanced consulting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Multilingual support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Get answers to common questions about our services and process
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${
                        openFAQ === faq.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Was this answer helpful?</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                Yes
                              </button>
                              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                                No
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Still have questions? Our support team is here to help.
              </p>
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Contact Support Team
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;