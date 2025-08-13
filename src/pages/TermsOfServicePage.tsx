import React from 'react';
import { FileText, Scale, Globe, Shield, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TermsOfServicePage = () => {
  const lastUpdated = "January 1, 2025";

  const serviceCategories = [
    {
      icon: Globe,
      title: 'Company Formation Services',
      description: 'Business registration and setup across our 10 primary jurisdictions',
      jurisdictions: ['Georgia', 'USA', 'Montenegro', 'Estonia', 'Portugal', 'Malta', 'Panama', 'UAE', 'Switzerland', 'Spain']
    },
    {
      icon: Users,
      title: 'Consulting Services',
      description: 'Expert business advice and strategic guidance from local consultants',
      jurisdictions: ['All 127+ supported countries']
    },
    {
      icon: Shield,
      title: 'AI Oracle Assistant',
      description: 'AI-powered business consulting with voice and text interaction',
      jurisdictions: ['Global availability with local expertise']
    }
  ];

  const userObligations = [
    'Provide accurate and complete information for all business formation processes',
    'Comply with all applicable laws in your chosen jurisdiction',
    'Pay all fees and charges as agreed upon with your assigned consultant',
    'Maintain confidentiality of any proprietary information shared by consultants',
    'Use our AI Oracle assistant responsibly and for legitimate business purposes',
    'Notify us immediately of any unauthorized access to your account',
    'Cooperate with due diligence and compliance verification processes',
    'Respect intellectual property rights of our platform and content'
  ];

  const limitations = [
    {
      title: 'Service Availability',
      description: 'Services may vary by jurisdiction and are subject to local laws and regulations in each of our 10 primary countries.'
    },
    {
      title: 'AI Oracle Limitations',
      description: 'AI recommendations are for informational purposes and should be verified with human consultants for complex matters.'
    },
    {
      title: 'Third-Party Dependencies',
      description: 'Some services depend on third-party providers (banks, government agencies) which may cause delays beyond our control.'
    },
    {
      title: 'Regulatory Changes',
      description: 'Laws and regulations may change in any jurisdiction, potentially affecting service delivery or requirements.'
    }
  ];

  const jurisdictionSpecific = [
    {
      country: 'Georgia',
      flag: '🇬🇪',
      laws: 'Georgian Law on Entrepreneurs',
      regulator: 'House of Justice',
      specialNotes: 'Territorial taxation system, free economic zones available'
    },
    {
      country: 'United States',
      flag: '🇺🇸',
      laws: 'Delaware General Corporation Law',
      regulator: 'Delaware Division of Corporations',
      specialNotes: 'State-specific regulations, federal tax implications'
    },
    {
      country: 'Estonia',
      flag: '🇪🇪',
      laws: 'Estonian Commercial Code',
      regulator: 'Estonian Business Register',
      specialNotes: 'e-Residency program, EU regulations apply'
    },
    {
      country: 'UAE',
      flag: '🇦🇪',
      laws: 'UAE Commercial Companies Law',
      regulator: 'Department of Economic Development',
      specialNotes: 'Free zone regulations, Emirate-specific rules'
    },
    {
      country: 'Switzerland',
      flag: '🇨🇭',
      laws: 'Swiss Code of Obligations',
      regulator: 'Commercial Register',
      specialNotes: 'Cantonal variations, banking secrecy laws'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Scale className="h-12 w-12 text-slate-300" />
              <h1 className="text-4xl sm:text-5xl font-bold">
                Terms of <span className="text-blue-400">Service</span>
              </h1>
            </div>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Legal terms and conditions governing the use of our AI-enhanced global 
              business consulting platform across 10 primary jurisdictions and 127+ countries.
            </p>
            <div className="mt-6 text-sm text-slate-400">
              Last updated: {lastUpdated}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement Overview</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms of Service ("Terms") constitute a legally binding agreement between you 
            and Consulting19 ("Company," "we," "our," or "us") regarding your use of our 
            AI-enhanced global business consulting platform and related services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            By accessing or using our platform, AI Oracle assistant, or any of our consulting 
            services across our 10 primary jurisdictions (Georgia, United States, Montenegro, 
            Estonia, Portugal, Malta, Panama, UAE, Switzerland, and Spain) or any of our 
            127+ supported countries, you agree to be bound by these Terms.
          </p>
        </div>

        {/* Services Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
          
          <div className="space-y-6">
            {serviceCategories.map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <category.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.jurisdictions.map((jurisdiction, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Obligations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">User Obligations</h2>
          
          <div className="space-y-3">
            {userObligations.map((obligation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-800">{obligation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Oracle Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Oracle Assistant Terms</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Our AI Oracle assistant is an advanced AI system designed to provide intelligent 
              business consulting guidance. By using this service, you acknowledge and agree to the following:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">What AI Oracle Provides</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Intelligent jurisdiction recommendations</li>
                  <li>• Business formation guidance</li>
                  <li>• Tax optimization insights</li>
                  <li>• Consultant matching services</li>
                  <li>• Multi-language support</li>
                  <li>• Voice interaction capabilities</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">Important Limitations</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• AI advice is for informational purposes only</li>
                  <li>• Not a substitute for professional legal advice</li>
                  <li>• Recommendations verified by human experts</li>
                  <li>• Subject to local laws and regulations</li>
                  <li>• May require consultant confirmation</li>
                  <li>• Continuous learning and improvement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Jurisdiction-Specific Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jurisdiction-Specific Terms</h2>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-700 leading-relaxed">
              Our services are subject to the laws and regulations of each jurisdiction where 
              we operate. Below are key regulatory frameworks for our primary countries:
            </p>
          </div>
          
          <div className="space-y-4">
            {jurisdictionSpecific.map((jurisdiction, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{jurisdiction.flag}</span>
                  <h4 className="font-semibold text-gray-900">{jurisdiction.country}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Governing Law:</span>
                    <p className="text-gray-600">{jurisdiction.laws}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Regulator:</span>
                    <p className="text-gray-600">{jurisdiction.regulator}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Special Notes:</span>
                    <p className="text-gray-600">{jurisdiction.specialNotes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Additional jurisdictions (117+ countries) are governed by 
              their respective local laws and international agreements. Our consultants ensure 
              compliance with all applicable regulations.
            </p>
          </div>
        </div>

        {/* Limitations and Disclaimers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Limitations</h2>
          
          <div className="space-y-4">
            {limitations.map((limitation, index) => (
              <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <h4 className="font-semibold text-orange-900 mb-2">{limitation.title}</h4>
                <p className="text-sm text-orange-800">{limitation.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liability and Indemnification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Liability and Indemnification</h2>
          
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">Limitation of Liability</h4>
                  <p className="text-sm text-red-800 leading-relaxed">
                    To the maximum extent permitted by law, Consulting19 shall not be liable for any 
                    indirect, incidental, special, consequential, or punitive damages, including but 
                    not limited to loss of profits, data, or business opportunities, arising from 
                    your use of our services across any jurisdiction.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Professional Services Disclaimer</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                Our consultants provide professional business formation services, but we do not 
                provide legal, tax, or financial advice. You should consult with qualified 
                professionals in your chosen jurisdiction for specific legal and tax matters.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Terms</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Payment terms vary by service type and jurisdiction. All fees are clearly 
              communicated before service commencement.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Accepted Payment Methods</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• International credit and debit cards</li>
                  <li>• Bank transfers (SWIFT/SEPA)</li>
                  <li>• Cryptocurrency (select jurisdictions)</li>
                  <li>• Local payment methods per country</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Refund Policy</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 30-day satisfaction guarantee</li>
                  <li>• Partial refunds for incomplete services</li>
                  <li>• Government fees are non-refundable</li>
                  <li>• Refund processing: 5-10 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              All content, software, AI algorithms, and materials on our platform are protected 
              by intellectual property laws. This includes our AI Oracle technology and 
              proprietary consulting methodologies.
            </p>
            
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">AI Oracle Technology</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                Our AI Oracle assistant, including its algorithms, training data, and response 
                generation capabilities, is proprietary technology owned by Consulting19. 
                Unauthorized reproduction, reverse engineering, or commercial use is strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Termination</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Termination by You</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Cancel your account at any time through your dashboard</li>
                <li>• Complete any ongoing business formation processes</li>
                <li>• Download important documents before termination</li>
                <li>• Settle any outstanding payments</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Termination by Us</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Violation of these Terms of Service</li>
                <li>• Fraudulent or illegal activity</li>
                <li>• Non-payment of fees</li>
                <li>• Misuse of AI Oracle or platform features</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law and Disputes</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of Wyoming, United States, where our 
              parent company Way19 LLC is incorporated. However, specific service delivery 
              is subject to local laws in each jurisdiction.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Dispute Resolution</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>1. <strong>Direct Resolution:</strong> Contact our legal team at legal@consulting19.com</p>
                <p>2. <strong>Mediation:</strong> Good faith mediation before formal proceedings</p>
                <p>3. <strong>Arbitration:</strong> Binding arbitration under international commercial rules</p>
                <p>4. <strong>Jurisdiction:</strong> Courts of Wyoming, USA for final resolution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jurisdiction-Specific Regulations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jurisdiction-Specific Regulations</h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed mb-6">
              Each of our primary jurisdictions has specific regulatory requirements that 
              may affect service delivery and your obligations:
            </p>
            
            <div className="space-y-4">
              {jurisdictionSpecific.map((jurisdiction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{jurisdiction.flag}</span>
                    <h4 className="font-semibold text-gray-900">{jurisdiction.country}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Governing Law:</span>
                      <p className="text-gray-600">{jurisdiction.laws}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Regulator:</span>
                      <p className="text-gray-600">{jurisdiction.regulator}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Special Considerations:</span>
                      <p className="text-gray-600">{jurisdiction.specialNotes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Legal Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal Department</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Email: legal@consulting19.com</p>
                <p>Address: Way19 LLC, Wyoming, USA</p>
                <p>Response Time: Within 5 business days</p>
                <p>Languages: English, Turkish, Georgian</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Terms Questions</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Email: terms@consulting19.com</p>
                <p>For: Terms clarification and amendments</p>
                <p>Available: 24/7 for urgent legal matters</p>
                <p>Jurisdiction: All supported countries</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-900">Effective Date</span>
            </div>
            <p className="text-sm text-slate-700">
              These Terms of Service are effective as of {lastUpdated} and apply to all 
              users of our platform across all supported jurisdictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;