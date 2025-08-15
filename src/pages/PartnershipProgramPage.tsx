```typescript
    import React, { useState } from 'react';
    import { Link } from 'react-router-dom';
    import { Bot, Globe, Users, DollarSign, Mail, Send, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
    import { supabase } from '../lib/supabase';
    import useNotifications from '../hooks/useNotifications';

    const PartnershipProgramPage = () => {
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
                null, // No specific ID for now, admin can view all
                '/admin-dashboard' // Or a specific admin page for applications
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

      return (
        <div className="min-h-screen bg-gray-50">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Bot className="h-16 w-16 text-yellow-300" />
                <Globe className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                Partner with the World's First <span className="text-yellow-300">AI-Powered</span> Consulting Platform
              </h1>
              <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                Join Consulting19 and revolutionize global business formation with our cutting-edge AI Oracle and expert network.
              </p>
            </div>
          </section>

          {/* Why Partner With Us Section */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner With Consulting19?</h2>
                <p className="text-lg text-gray-600">Unlock unparalleled opportunities and grow your business globally.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-xl p-8 text-center shadow-sm border border-gray-200">
                  <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Driven Efficiency</h3>
                  <p className="text-gray-600">Leverage our AI Oracle for smart client matching, optimized processes, and data-driven insights.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center shadow-sm border border-gray-200">
                  <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
                  <p className="text-gray-600">Expand your services to a global clientele seeking international business solutions.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center shadow-sm border border-gray-200">
                  <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Network</h3>
                  <p className="text-gray-600">Join a curated network of top-tier consultants and legal experts worldwide.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center shadow-sm border border-gray-200">
                  <DollarSign className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Lucrative Opportunities</h3>
                  <p className="text-gray-600">Access high-value clients and recurring revenue streams through our platform.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center shadow-sm border border-gray-200">
                  <CheckCircle className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Seamless Operations</h3>
                  <p className="text-gray-600">Benefit from our robust platform, secure communication, and streamlined workflows.</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center shadow-sm border border-gray-200">
                  <ArrowRight className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                  <p className="text-gray-600">Receive comprehensive support and resources to ensure your success on our platform.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Partnership Details Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Partnership Investment</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Our annual maintenance and dealership fee ensures access to our premium platform features, AI tools, and global client network.
                </p>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl p-8 shadow-lg mb-8">
                  <p className="text-sm font-semibold mb-2">Annual Fee</p>
                  <p className="text-5xl font-bold mb-4">$9,000 USD</p>
                  <p className="text-lg">Includes platform access, AI Oracle tools, and global client referrals.</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <h3 className="text-xl font-bold text-yellow-900 mb-3">Important Application Criteria</h3>
                  <p className="text-lg text-yellow-800">
                    We are seeking partners to expand our global reach. Therefore, applications are currently accepted ONLY for countries where Consulting19 does NOT yet have an existing service presence.
                  </p>
                  <p className="text-sm text-yellow-700 mt-3">
                    Please ensure your country of specialization is not already listed on our "Countries" page before applying.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Application Form Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Initial Consultation Application</h2>
                <p className="text-lg text-gray-600 mb-8 text-center">
                  Fill out the form below to schedule an initial consultation and learn more about becoming a Consulting19 partner.
                </p>

                {submitStatus === 'success' && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-700">Your application has been sent successfully! We will review it and get back to you shortly.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700">An error occurred while submitting your application. Please try again.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country of Specialization *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Turkey, Brazil, Canada"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Tell us more about your interest in partnering with Consulting19..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      );
    };

    export default PartnershipProgramPage;
    ```