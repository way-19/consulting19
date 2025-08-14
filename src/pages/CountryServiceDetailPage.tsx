import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, Clock, Users, Shield, MessageSquare, Phone } from 'lucide-react';
import { useCountries } from '../hooks/useCountries';
import { getPublicImageUrl } from '../lib/supabase';

const CountryServiceDetailPage = () => {
  const { countrySlug, serviceSlug } = useParams<{ countrySlug: string; serviceSlug: string }>();
  const { countries, loading: countriesLoading } = useCountries();
  
  const country = countries.find(c => c.slug === countrySlug);

  if (countriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Country Not Found</h1>
          <Link to="/countries" className="text-purple-600 hover:text-purple-700">
            ← Back to Countries
          </Link>
        </div>
      </div>
    );
  }

  // Service data based on service slug
  const getServiceData = (slug: string) => {
    switch (slug) {
      case 'company-registration':
        return {
          title: 'Company Registration In Georgia',
          subtitle: 'Open your business fast, easy and reliable',
          overview: {
            description: 'Company registration in Georgia is streamlined and efficient, making it one of the most business-friendly jurisdictions globally. Our comprehensive service handles all aspects of company formation, from initial planning to post-registration setup.',
            details: 'We ensure your company is properly structured for tax efficiency, operational flexibility, and future growth while maintaining full compliance with Georgian corporate law and regulations.'
          },
          consultant: {
            name: 'Nino Kvaratskhelia',
            title: 'Senior Business Consultant',
            experience: '5+ years',
            rating: 4.9,
            clients: 1247,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          whatsIncluded: [
            'LLC registration and setup',
            'Tax number acquisition',
            'Bank account opening assistance',
            'Legal address provision',
            'Corporate seal preparation',
            'Shareholder agreements',
            'Board resolutions',
            'Ongoing compliance support'
          ],
          requiredInfo: [
            'Company name (3 options)',
            'Business activity description',
            'Shareholder information',
            'Director details',
            'Registered address',
            'Share capital amount'
          ],
          companyTypes: [
            {
              name: 'Limited Liability Company (LLC)',
              description: 'Most popular business structure in Georgia',
              features: [
                'Limited liability protection',
                'Flexible management',
                'Tax advantages',
                'Easy maintenance'
              ]
            },
            {
              name: 'Joint Stock Company (JSC)',
              description: 'For larger businesses and public companies',
              features: [
                'Share capital structure',
                'Board of directors',
                'Public offering option',
                'Corporate governance'
              ]
            },
            {
              name: 'Branch Office',
              description: 'Extension of foreign company in Georgia',
              features: [
                'Foreign company extension',
                'Local presence',
                'Limited activities',
                'Simplified setup'
              ]
            }
          ],
          registrationProcess: [
            {
              step: 1,
              title: 'Company Structure Planning',
              description: 'Determine optimal company structure for your business needs'
            },
            {
              step: 2,
              title: 'Name Reservation',
              description: 'Reserve your preferred company name with authorities'
            },
            {
              step: 3,
              title: 'Document Preparation',
              description: 'Prepare all incorporation documents and agreements'
            },
            {
              step: 4,
              title: 'Registration Filing',
              description: 'Submit registration to House of Justice'
            },
            {
              step: 5,
              title: 'Post-Registration Setup',
              description: 'Complete tax registration and bank account opening'
            }
          ],
          registrationDetails: {
            processingTime: '3-5 days',
            minShareCapital: '1 GEL',
            directorsRequired: '1 minimum',
            shareholders: '1 minimum'
          }
        };

      case 'bank-account-opening':
        return {
          title: 'Bank Account Opening In Georgia',
          subtitle: 'Open Georgian bank accounts for residents and non-residents',
          overview: {
            description: 'Georgian banking system offers excellent opportunities for both residents and non-residents to open personal and business accounts with competitive features and international banking services.',
            details: 'We assist with account opening at major Georgian banks, ensuring you get the best terms and services for your specific needs, including multi-currency accounts and online banking facilities.'
          },
          consultant: {
            name: 'Nino Kvaratskhelia',
            title: 'Senior Business Consultant',
            experience: '5+ years',
            rating: 4.9,
            clients: 1247,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          whatsIncluded: [
            'Bank selection consultation',
            'Document preparation',
            'Application submission',
            'Account activation support',
            'Online banking setup',
            'Debit card issuance',
            'Multi-currency options',
            'Ongoing banking support'
          ],
          requiredInfo: [
            'Passport and ID documents',
            'Proof of address',
            'Income verification',
            'Business registration (for business accounts)',
            'Initial deposit amount',
            'Banking preferences'
          ],
          companyTypes: [
            {
              name: 'Personal Banking',
              description: 'Individual accounts for residents and non-residents',
              features: [
                'Current and savings accounts',
                'Multi-currency support',
                'Online and mobile banking',
                'International transfers'
              ]
            },
            {
              name: 'Business Banking',
              description: 'Corporate accounts for business operations',
              features: [
                'Business current accounts',
                'Merchant services',
                'Corporate cards',
                'Trade finance'
              ]
            },
            {
              name: 'Investment Banking',
              description: 'Specialized services for investments',
              features: [
                'Investment portfolios',
                'Wealth management',
                'Private banking',
                'Advisory services'
              ]
            }
          ],
          registrationProcess: [
            {
              step: 1,
              title: 'Bank Selection',
              description: 'Choose the most suitable bank based on your requirements'
            },
            {
              step: 2,
              title: 'Document Collection',
              description: 'Gather all required documents and certifications'
            },
            {
              step: 3,
              title: 'Application Submission',
              description: 'Submit application with all supporting documents'
            },
            {
              step: 4,
              title: 'Bank Interview',
              description: 'Attend bank interview and account verification'
            },
            {
              step: 5,
              title: 'Account Activation',
              description: 'Complete account setup and receive banking materials'
            }
          ],
          registrationDetails: {
            processingTime: '5-10 days',
            minShareCapital: 'Varies by bank',
            directorsRequired: 'N/A',
            shareholders: 'N/A'
          }
        };

      case 'visa-residence':
        return {
          title: 'Visa & Residence In Georgia',
          subtitle: 'Get Your Georgian Visa or Residence Permit',
          overview: {
            description: 'Georgia offers various visa and residence options for international visitors and investors. Our comprehensive service covers tourist visas, work permits, and residence permits with full documentation support.',
            details: 'We guide you through the entire visa and residence application process, ensuring all requirements are met and applications are submitted correctly to Georgian authorities.'
          },
          consultant: {
            name: 'Nino Kvaratskhelia',
            title: 'Senior Business Consultant',
            experience: '5+ years',
            rating: 4.9,
            clients: 1247,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          whatsIncluded: [
            'Visa type consultation',
            'Document preparation',
            'Application submission',
            'Status tracking',
            'Interview preparation',
            'Permit collection',
            'Renewal assistance',
            'Legal compliance support'
          ],
          requiredInfo: [
            'Passport and photos',
            'Purpose of visit/stay',
            'Financial statements',
            'Accommodation proof',
            'Health insurance',
            'Background checks'
          ],
          companyTypes: [
            {
              name: 'Tourist Visa',
              description: 'Short-term visits for tourism and business',
              features: [
                'Up to 90 days stay',
                'Multiple entry options',
                'Fast processing',
                'Minimal requirements'
              ]
            },
            {
              name: 'Work Permit',
              description: 'Employment-based residence permits',
              features: [
                'Employment authorization',
                'Renewable permits',
                'Family inclusion',
                'Path to permanent residence'
              ]
            },
            {
              name: 'Investment Residence',
              description: 'Residence through investment programs',
              features: [
                'Investment-based residence',
                'Fast-track processing',
                'Family benefits',
                'Business opportunities'
              ]
            }
          ],
          registrationProcess: [
            {
              step: 1,
              title: 'Consultation & Planning',
              description: 'Determine the best visa/residence option for your needs'
            },
            {
              step: 2,
              title: 'Document Preparation',
              description: 'Collect and prepare all required documentation'
            },
            {
              step: 3,
              title: 'Application Submission',
              description: 'Submit application to relevant Georgian authorities'
            },
            {
              step: 4,
              title: 'Processing & Follow-up',
              description: 'Monitor application status and provide updates'
            },
            {
              step: 5,
              title: 'Permit Collection',
              description: 'Collect approved visa/permit and complete setup'
            }
          ],
          registrationDetails: {
            processingTime: '10-30 days',
            minShareCapital: 'N/A',
            directorsRequired: 'N/A',
            shareholders: 'N/A'
          }
        };

      case 'tax-residency':
        return {
          title: 'Tax Residency In Georgia',
          subtitle: 'One of the lowest tax rates in the world',
          overview: {
            description: 'Georgia offers one of the most attractive tax systems globally with territorial taxation principles and 0% tax on foreign-sourced income for qualified individuals and businesses.',
            details: 'Our tax residency service helps you establish Georgian tax residency legally and efficiently, ensuring full compliance while maximizing tax benefits available under Georgian law.'
          },
          consultant: {
            name: 'Nino Kvaratskhelia',
            title: 'Senior Business Consultant',
            experience: '5+ years',
            rating: 4.9,
            clients: 1247,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          whatsIncluded: [
            'Tax residency consultation',
            'Residency application',
            'Tax registration',
            'Compliance setup',
            'Annual filing support',
            'Tax optimization advice',
            'Ongoing monitoring',
            'Legal compliance'
          ],
          requiredInfo: [
            'Personal identification',
            'Residence proof',
            'Income sources',
            'Previous tax history',
            'Business activities',
            'Family information'
          ],
          companyTypes: [
            {
              name: 'Individual Tax Residency',
              description: 'Personal tax residency for individuals',
              features: [
                '0% tax on foreign income',
                'Territorial taxation',
                'Simple compliance',
                'Low local tax rates'
              ]
            },
            {
              name: 'Business Tax Residency',
              description: 'Corporate tax benefits for businesses',
              features: [
                'Small business status',
                'Profit tax deferral',
                'International tax treaties',
                'Simplified reporting'
              ]
            },
            {
              name: 'Investment Tax Benefits',
              description: 'Special tax treatment for investors',
              features: [
                'Capital gains exemptions',
                'Investment incentives',
                'Free zone benefits',
                'Treaty shopping opportunities'
              ]
            }
          ],
          registrationProcess: [
            {
              step: 1,
              title: 'Tax Assessment',
              description: 'Evaluate your current tax situation and Georgian benefits'
            },
            {
              step: 2,
              title: 'Residency Planning',
              description: 'Plan optimal residency structure for tax efficiency'
            },
            {
              step: 3,
              title: 'Application Process',
              description: 'Submit tax residency application with authorities'
            },
            {
              step: 4,
              title: 'Registration Setup',
              description: 'Complete tax registration and compliance setup'
            },
            {
              step: 5,
              title: 'Ongoing Support',
              description: 'Provide ongoing tax compliance and optimization support'
            }
          ],
          registrationDetails: {
            processingTime: '2-4 weeks',
            minShareCapital: 'N/A',
            directorsRequired: 'N/A',
            shareholders: 'N/A'
          }
        };

      case 'accounting-services':
        return {
          title: 'Accounting Services In Georgia',
          subtitle: 'Your accounting partner for all accounting needs',
          overview: {
            description: 'Professional accounting services tailored for Georgian businesses, ensuring full compliance with local regulations while providing strategic financial insights for business growth.',
            details: 'Our experienced accounting team provides comprehensive bookkeeping, tax preparation, financial reporting, and advisory services to help your business maintain accurate records and optimize financial performance.'
          },
          consultant: {
            name: 'Nino Kvaratskhelia',
            title: 'Senior Business Consultant',
            experience: '5+ years',
            rating: 4.9,
            clients: 1247,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          whatsIncluded: [
            'Monthly bookkeeping',
            'Tax preparation and filing',
            'Financial statement preparation',
            'Payroll processing',
            'VAT compliance',
            'Management reporting',
            'Audit support',
            'Financial advisory'
          ],
          requiredInfo: [
            'Business registration documents',
            'Bank statements',
            'Transaction records',
            'Employee information',
            'Previous financial records',
            'Business activity details'
          ],
          companyTypes: [
            {
              name: 'Small Business Accounting',
              description: 'Accounting services for small enterprises',
              features: [
                'Basic bookkeeping',
                'Tax compliance',
                'Monthly reporting',
                'Cost-effective solutions'
              ]
            },
            {
              name: 'Corporate Accounting',
              description: 'Full-service accounting for larger companies',
              features: [
                'Comprehensive bookkeeping',
                'Financial analysis',
                'Management reporting',
                'Strategic advisory'
              ]
            },
            {
              name: 'International Accounting',
              description: 'Specialized services for international businesses',
              features: [
                'Multi-currency accounting',
                'Transfer pricing',
                'International compliance',
                'Cross-border transactions'
              ]
            }
          ],
          registrationProcess: [
            {
              step: 1,
              title: 'Business Assessment',
              description: 'Evaluate your accounting needs and current systems'
            },
            {
              step: 2,
              title: 'Service Setup',
              description: 'Configure accounting systems and processes'
            },
            {
              step: 3,
              title: 'Data Migration',
              description: 'Transfer existing financial data to our systems'
            },
            {
              step: 4,
              title: 'Monthly Processing',
              description: 'Begin regular monthly accounting and reporting'
            },
            {
              step: 5,
              title: 'Ongoing Support',
              description: 'Provide continuous accounting and advisory support'
            }
          ],
          registrationDetails: {
            processingTime: '1-2 weeks',
            minShareCapital: 'N/A',
            directorsRequired: 'N/A',
            shareholders: 'N/A'
          }
        };

      case 'legal-consulting':
        return {
          title: 'Legal Consulting In Georgia',
          subtitle: 'Professional legal services for business operations',
          overview: {
            description: 'Comprehensive legal consulting services for businesses operating in Georgia, covering corporate law, contract drafting, compliance, and dispute resolution with expert legal guidance.',
            details: 'Our legal team provides strategic legal advice and practical solutions to help your business navigate Georgian legal requirements while protecting your interests and ensuring regulatory compliance.'
          },
          consultant: {
            name: 'Nino Kvaratskhelia',
            title: 'Senior Business Consultant',
            experience: '5+ years',
            rating: 4.9,
            clients: 1247,
            avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
          },
          whatsIncluded: [
            'Legal consultation',
            'Contract drafting and review',
            'Corporate governance',
            'Compliance monitoring',
            'Dispute resolution',
            'Regulatory advice',
            'Due diligence',
            'Legal documentation'
          ],
          requiredInfo: [
            'Business structure details',
            'Legal requirements',
            'Contract specifications',
            'Compliance needs',
            'Risk assessment',
            'Industry regulations'
          ],
          companyTypes: [
            {
              name: 'Corporate Law',
              description: 'Legal services for corporate matters',
              features: [
                'Corporate structure',
                'Governance advice',
                'Merger & acquisition',
                'Shareholder agreements'
              ]
            },
            {
              name: 'Contract Law',
              description: 'Contract drafting and negotiation services',
              features: [
                'Contract drafting',
                'Legal compliance',
                'Risk mitigation',
                'Dispute resolution'
              ]
            },
            {
              name: 'Regulatory Compliance',
              description: 'Compliance with Georgian regulations',
              features: [
                'Regulatory monitoring',
                'Compliance audits',
                'Policy development',
                'Training programs'
              ]
            }
          ],
          registrationProcess: [
            {
              step: 1,
              title: 'Legal Assessment',
              description: 'Evaluate your legal needs and current compliance status'
            },
            {
              step: 2,
              title: 'Strategy Development',
              description: 'Develop comprehensive legal strategy for your business'
            },
            {
              step: 3,
              title: 'Implementation',
              description: 'Implement legal solutions and documentation'
            },
            {
              step: 4,
              title: 'Monitoring',
              description: 'Monitor compliance and provide ongoing legal support'
            },
            {
              step: 5,
              title: 'Updates & Maintenance',
              description: 'Keep legal documentation current and compliant'
            }
          ],
          registrationDetails: {
            processingTime: 'Varies by project',
            minShareCapital: 'N/A',
            directorsRequired: 'N/A',
            shareholders: 'N/A'
          }
        };

      default:
        return null;
    }
  };

  const service = getServiceData(serviceSlug || '');

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Link to={`/countries/${countrySlug}`} className="text-purple-600 hover:text-purple-700">
            ← Back to {country.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to={`/countries/${countrySlug}`}
            className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Georgia Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Section */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{country.flag}</span>
                <span className="text-sm text-gray-500">Georgia</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
              <p className="text-lg text-gray-600">{service.subtitle}</p>
            </div>

            {/* Service Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Overview</h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">{service.overview.description}</p>
              <p className="text-gray-700 leading-relaxed">{service.overview.details}</p>
            </div>

            {/* Company Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Company Types</h2>
              <div className="space-y-8">
                {service.companyTypes.map((type, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6 border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{type.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{type.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {type.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Process */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Registration Process</h2>
              <div className="space-y-6">
                {service.registrationProcess.map((step) => (
                  <div key={step.step} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Consultant Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={service.consultant.avatar}
                  alt={service.consultant.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{service.consultant.name}</h3>
                  <p className="text-sm text-green-600 font-medium">{service.consultant.title}</p>
                  <p className="text-sm text-gray-500">{service.consultant.experience}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-xl font-bold text-gray-900">{service.consultant.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Rating</p>
                </div>
                <div className="text-center bg-gray-50 rounded-lg p-4">
                  <div className="text-xl font-bold text-gray-900 mb-2">{service.consultant.clients.toLocaleString()}</div>
                  <p className="text-xs text-gray-500 font-medium">Clients</p>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">What's Included</h3>
              <div className="space-y-3">
                {service.whatsIncluded.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Required Information</h3>
              <div className="space-y-3">
                {service.requiredInfo.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Registration Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Processing Time</span>
                  <span className="text-sm font-bold text-gray-900">{service.registrationDetails.processingTime}</span>
                </div>
                {service.registrationDetails.minShareCapital !== 'N/A' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Min. Share Capital</span>
                    <span className="text-sm font-bold text-gray-900">{service.registrationDetails.minShareCapital}</span>
                  </div>
                )}
                {service.registrationDetails.directorsRequired !== 'N/A' && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Directors Required</span>
                    <span className="text-sm font-bold text-gray-900">{service.registrationDetails.directorsRequired}</span>
                  </div>
                )}
                {service.registrationDetails.shareholders !== 'N/A' && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Shareholders</span>
                    <span className="text-sm font-bold text-gray-900">{service.registrationDetails.shareholders}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Ready to Register?</h3>
              <p className="text-sm text-gray-600 mb-6">
                Register now and let Nino handle your company registration
              </p>
              <div className="space-y-3">
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 transition-colors">
                  Register & Start Process
                </button>
                <button className="w-full bg-white border border-green-600 text-green-600 py-3 px-4 rounded-lg font-bold hover:bg-green-50 transition-colors">
                  Ask Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryServiceDetailPage;