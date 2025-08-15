import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Scale, Shield, Globe, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

const TermsOfServicePage = () => {
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
              <div className="bg-blue-100 rounded-full p-3">
                <Scale className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Legal terms and conditions for using our platform</p>
            <p className="text-sm text-gray-500 mt-2">Last updated: January 15, 2025</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Consulting19 platform, you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">2. Service Description</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">AI-Enhanced Consulting Platform</h3>
              <p className="text-blue-800">
                Consulting19 provides AI-enhanced business consulting services across 127+ countries, 
                combining artificial intelligence with human expertise for international business formation 
                and advisory services.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Our services include but are not limited to: company formation, legal consulting, 
              accounting services, tax advisory, banking assistance, and ongoing business support 
              through our network of expert consultants.
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">3. User Responsibilities</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Security</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Use strong passwords and enable two-factor authentication</li>
                  <li>Keep your contact information current and accurate</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Accurate Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Provide truthful and accurate information</li>
                  <li>Update your profile when circumstances change</li>
                  <li>Ensure all documents submitted are genuine and current</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* AI Oracle Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. AI Oracle Usage Terms</h2>
            
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">AI-Powered Recommendations</h3>
              <div className="space-y-3 text-purple-800">
                <p>
                  Our AI Oracle provides intelligent business guidance, but all recommendations are:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Subject to legal expert verification</li>
                  <li>Based on information provided by you</li>
                  <li>General guidance, not specific legal advice</li>
                  <li>Continuously improved through machine learning</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">5. Payment Terms</h2>
            </div>
            
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>All fees are quoted in USD unless otherwise specified</li>
              <li>Payment is required before service delivery begins</li>
              <li>Refunds are subject to our refund policy</li>
              <li>Additional services may incur extra charges</li>
              <li>Consultant commissions are calculated automatically</li>
              <li>Platform fees are clearly disclosed before payment</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Consulting19 platform, including its AI Oracle technology, design, content, and 
              functionality, is owned by Way19 LLC and protected by international copyright, 
              trademark, and other intellectual property laws.
            </p>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-900">Important Notice</h3>
              </div>
              <p className="text-yellow-800 text-sm">
                You may not copy, modify, distribute, or reverse engineer any part of our platform 
                without explicit written permission.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide accurate and reliable services, Consulting19 and its consultants 
              are not liable for any indirect, incidental, special, or consequential damages arising from 
              the use of our platform.
            </p>
            
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Maximum Liability:</strong> Our total liability shall not exceed the amount 
                paid by you for the specific service in question.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service are governed by and construed in accordance with the laws of 
              Wyoming, USA. Any disputes arising under these terms shall be subject to the exclusive 
              jurisdiction of the courts of Wyoming.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, your access 
              to the platform will cease, but certain provisions (including payment obligations and 
              intellectual property rights) will survive termination.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-purple-600" />
                  <span>legal@consulting19.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Way19 LLC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <span>Wyoming, United States</span>
                </div>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Acknowledgment</h3>
              </div>
              <p className="text-green-800 text-sm">
                By using our platform, you acknowledge that you have read, understood, and agree 
                to be bound by these Terms of Service and our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;