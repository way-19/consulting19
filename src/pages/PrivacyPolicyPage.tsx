import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Globe, Mail, Calendar, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link 
              to="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-purple-100 rounded-full p-3">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">How we collect, use, and protect your information</p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 15, 2025</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Consulting19 ("we," "our," or "us"), we are committed to protecting your privacy and ensuring 
              the security of your personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our AI-enhanced business consulting platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Business information and company details</li>
                  <li>Professional background and expertise areas</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences and language settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Platform usage patterns and feature interactions</li>
                  <li>AI assistant conversations and queries</li>
                  <li>Document uploads and consultation history</li>
                  <li>Device information and browser data</li>
                  <li>IP address and location data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Business Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Business formation documents and legal papers</li>
                  <li>Financial information for compliance purposes</li>
                  <li>Consultation notes and project documentation</li>
                  <li>Communication records with consultants</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">AI-Enhanced Services</h3>
              <p className="text-purple-800">
                Our AI Oracle system uses your business information to provide personalized 
                jurisdiction recommendations and consultant matching. All AI processing is 
                conducted with strict privacy safeguards and legal oversight.
              </p>
            </div>

            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide personalized business consulting services</li>
              <li>Match you with appropriate consultants and jurisdictions</li>
              <li>Process payments and manage billing</li>
              <li>Communicate important updates and notifications</li>
              <li>Improve our AI algorithms and service quality</li>
              <li>Ensure legal compliance and regulatory requirements</li>
              <li>Prevent fraud and maintain platform security</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              We may share your information in the following circumstances:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>With Consultants:</strong> Relevant business information shared with assigned consultants</li>
              <li><strong>Service Providers:</strong> Third-party services for payment processing and platform operations</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
            </ul>

            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <p className="text-green-800 text-sm">
                <strong>Note:</strong> We never sell your personal information to third parties for marketing purposes.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Technical Safeguards</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• End-to-end encryption for all data</li>
                  <li>• Secure cloud infrastructure</li>
                  <li>• Regular security audits</li>
                  <li>• Multi-factor authentication</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Operational Security</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Limited access controls</li>
                  <li>• Employee training programs</li>
                  <li>• Incident response procedures</li>
                  <li>• Regular backup systems</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900">Access and Portability</h3>
                <p className="text-gray-700 text-sm">Request access to your personal data and receive it in a portable format</p>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Correction and Updates</h3>
                <p className="text-gray-700 text-sm">Update or correct inaccurate personal information</p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Deletion</h3>
                <p className="text-gray-700 text-sm">Request deletion of your personal data (subject to legal requirements)</p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900">Opt-out</h3>
                <p className="text-gray-700 text-sm">Unsubscribe from marketing communications at any time</p>
              </div>
            </div>
          </section>

          {/* International Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              As a global platform serving 127+ countries, your information may be transferred to and 
              processed in countries other than your own. We ensure appropriate safeguards are in place 
              for all international transfers, including standard contractual clauses and adequacy decisions.
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and provide personalized services. You can control cookie preferences through your browser settings.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Types of Cookies We Use:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Essential:</strong> Required for platform functionality</li>
                <li>• <strong>Analytics:</strong> Help us understand usage patterns</li>
                <li>• <strong>Preferences:</strong> Remember your settings and choices</li>
                <li>• <strong>Marketing:</strong> Provide relevant content and offers</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <p className="text-purple-900 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              
              <div className="space-y-2 text-purple-800">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>privacy@consulting19.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Data Protection Officer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Way19 LLC, Wyoming, USA</span>
                </div>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Policy Updates</h2>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              Your continued use of our services after such modifications constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;