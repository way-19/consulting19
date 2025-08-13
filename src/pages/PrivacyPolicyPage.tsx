import React from 'react';
import { Shield, Eye, Lock, Globe, Users, FileText, Clock, CheckCircle } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const lastUpdated = "January 1, 2025";

  const dataTypes = [
    {
      icon: Users,
      title: 'Personal Information',
      description: 'Name, email, phone number, and business details you provide during registration and service usage.',
      color: 'bg-blue-500'
    },
    {
      icon: FileText,
      title: 'Business Data',
      description: 'Company information, financial documents, and business requirements shared for consulting services.',
      color: 'bg-green-500'
    },
    {
      icon: Globe,
      title: 'Usage Information',
      description: 'How you interact with our platform, AI assistant conversations, and service preferences.',
      color: 'bg-purple-500'
    },
    {
      icon: Lock,
      title: 'Technical Data',
      description: 'IP addresses, browser information, and device data for security and platform optimization.',
      color: 'bg-orange-500'
    }
  ];

  const protectionMeasures = [
    'End-to-end encryption for all data transmission',
    'Secure cloud storage with enterprise-grade security',
    'Regular security audits and penetration testing',
    'Multi-factor authentication for account access',
    'GDPR and international privacy law compliance',
    'Data minimization and purpose limitation principles',
    'Regular staff training on data protection',
    'Incident response and breach notification procedures'
  ];

  const yourRights = [
    {
      title: 'Access Your Data',
      description: 'Request a copy of all personal data we hold about you'
    },
    {
      title: 'Correct Information',
      description: 'Update or correct any inaccurate personal information'
    },
    {
      title: 'Delete Your Data',
      description: 'Request deletion of your personal data (subject to legal requirements)'
    },
    {
      title: 'Data Portability',
      description: 'Receive your data in a structured, machine-readable format'
    },
    {
      title: 'Restrict Processing',
      description: 'Limit how we process your personal information'
    },
    {
      title: 'Withdraw Consent',
      description: 'Withdraw consent for data processing at any time'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="h-12 w-12 text-blue-200" />
              <h1 className="text-4xl sm:text-5xl font-bold">
                Privacy <span className="text-yellow-300">Policy</span>
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy and data security are our top priorities. Learn how we protect 
              and handle your information across our global consulting platform.
            </p>
            <div className="mt-6 text-sm text-blue-200">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Consulting19 ("we," "our," or "us") is committed to protecting your privacy and ensuring 
            the security of your personal information. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our AI-enhanced global 
            business consulting platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our services span across 10 primary jurisdictions (Georgia, United States, Montenegro, 
            Estonia, Portugal, Malta, Panama, UAE, Switzerland, and Spain) with additional coverage 
            in 127+ countries worldwide. This policy applies to all our services, including our 
            AI Oracle assistant, consultant matching, and business formation services.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataTypes.map((type, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`${type.color} rounded-lg p-2`}>
                    <type.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Service Delivery</h4>
                <p className="text-gray-600 text-sm">Provide business consulting, company formation, and related services across our supported jurisdictions.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">AI Oracle Enhancement</h4>
                <p className="text-gray-600 text-sm">Improve our AI assistant's responses and consultant matching algorithms while maintaining anonymity.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Communication</h4>
                <p className="text-gray-600 text-sm">Send service updates, legal notifications, and important information about your business formation process.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Legal Compliance</h4>
                <p className="text-gray-600 text-sm">Meet regulatory requirements in the jurisdictions where we operate and provide services.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900">Platform Security</h4>
                <p className="text-gray-600 text-sm">Detect and prevent fraud, unauthorized access, and ensure platform security across all countries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Protection Measures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Protection Measures</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protectionMeasures.map((measure, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800">{measure}</span>
              </div>
            ))}
          </div>
        </div>

        {/* International Data Transfers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">International Data Transfers</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              As a global platform operating across 10 primary jurisdictions and 127+ countries, 
              we may transfer your personal data internationally to provide our services effectively. 
              We ensure all transfers comply with applicable data protection laws.
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Our Global Operations</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { country: 'Georgia', flag: '🇬🇪' },
                  { country: 'USA', flag: '🇺🇸' },
                  { country: 'Montenegro', flag: '🇲🇪' },
                  { country: 'Estonia', flag: '🇪🇪' },
                  { country: 'Portugal', flag: '🇵🇹' },
                  { country: 'Malta', flag: '🇲🇹' },
                  { country: 'Panama', flag: '🇵🇦' },
                  { country: 'UAE', flag: '🇦🇪' },
                  { country: 'Switzerland', flag: '🇨🇭' },
                  { country: 'Spain', flag: '🇪🇸' }
                ].map((location, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-1">{location.flag}</div>
                    <div className="text-xs text-blue-700 font-medium">{location.country}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yourRights.map((right, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{right.title}</h4>
                <p className="text-gray-600 text-sm">{right.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">How to Exercise Your Rights</h4>
            <p className="text-purple-800 text-sm mb-3">
              To exercise any of these rights, please contact us at privacy@consulting19.com or 
              through your consultant dashboard. We will respond within 30 days.
            </p>
            <div className="text-xs text-purple-700">
              Note: Some rights may be limited by legal requirements in the jurisdiction where your business is being formed.
            </div>
          </div>
        </div>

        {/* AI Oracle Specific Privacy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Oracle Privacy</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Our AI Oracle assistant processes your conversations to provide intelligent business 
              consulting recommendations. Here's how we protect your privacy:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Voice Data</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Voice recordings processed locally when possible</li>
                  <li>• Automatic deletion after conversation ends</li>
                  <li>• No permanent voice data storage</li>
                  <li>• Encrypted transmission to AI processing</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Conversation Data</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Anonymized for AI training purposes</li>
                  <li>• Legal expert verification maintained</li>
                  <li>• No personal identifiers in training data</li>
                  <li>• Conversation history available to you</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Cookies and Tracking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to enhance your experience and provide 
              personalized services across our global platform.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">Required for platform functionality, security, and user authentication.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us understand platform usage and improve our services (with your consent).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                  <p className="text-sm text-gray-600">Remember your language, country preferences, and AI assistant settings.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third-Party Services */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              To provide comprehensive services across multiple jurisdictions, we work with 
              trusted third-party providers. All partners are carefully vetted and bound by 
              strict data protection agreements.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Payment Processing</h4>
                <p className="text-sm text-gray-600">Stripe and other secure payment processors for international transactions.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Cloud Infrastructure</h4>
                <p className="text-sm text-gray-600">Enterprise-grade cloud services with data residency compliance.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">AI Processing</h4>
                <p className="text-sm text-gray-600">Secure AI services for language processing and intelligent recommendations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yourRights.map((right, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">{right.title}</h4>
                <p className="text-gray-600 text-sm">{right.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data only as long as necessary to provide our services 
              and comply with legal obligations in the jurisdictions where we operate.
            </p>
            
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3">Retention Periods by Data Type</h4>
              <div className="space-y-2 text-sm text-yellow-800">
                <p>• <strong>Account Information:</strong> Retained while account is active + 7 years</p>
                <p>• <strong>Business Documents:</strong> Retained per legal requirements (varies by jurisdiction)</p>
                <p>• <strong>AI Conversations:</strong> 30 days for service improvement, then anonymized</p>
                <p>• <strong>Payment Records:</strong> 7 years for tax and audit purposes</p>
                <p>• <strong>Marketing Data:</strong> Until consent is withdrawn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us About Privacy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Data Protection Officer</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Email: privacy@consulting19.com</p>
                <p>Response Time: Within 72 hours</p>
                <p>Available: 24/7 for urgent privacy matters</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal Department</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Email: legal@consulting19.com</p>
                <p>For: Legal requests and compliance matters</p>
                <p>Jurisdiction: All 10 supported countries</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> This privacy policy applies to all services across our 
              10 primary jurisdictions. Specific local privacy laws may provide additional 
              protections depending on your location and chosen business jurisdiction.
            </p>
          </div>
        </div>

        {/* Updates to Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy periodically to reflect changes in our practices, 
            technology, legal requirements, or other factors. We will notify you of any material 
            changes through email or prominent notices on our platform.
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;