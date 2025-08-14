import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Clock, Users, Award, MessageSquare } from 'lucide-react';
import * as Icons from 'lucide-react';
import { services } from '../data/services';
import { countries } from '../data/countries';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find(s => s.slug === slug);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Link to="/services" className="text-purple-600 hover:text-purple-700">
          <span>Get Started</span>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = Icons[service.icon as keyof typeof Icons] as any;
  const popularCountries = countries.slice(0, 6); // Show first 6 countries

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`py-20 ${service.color} text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {service.category}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">{service.name}</h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {service.description}. Our expert consultants provide comprehensive 
                guidance and support throughout the entire process.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/get-started"
                  className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/consultation"
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Free Consultation
                </Link>
              </div>
            </div>

            {/* Service Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Service Highlights</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-white/80" />
                    <span className="text-white/80">Typical Timeline</span>
                  </div>
                  <span className="text-white font-medium">2-4 weeks</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-white/80" />
                    <span className="text-white/80">Expert Consultants</span>
                  </div>
                  <span className="text-white font-medium">24/7 Available</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-white/80" />
                    <span className="text-white/80">Success Rate</span>
                  </div>
                  <span className="text-green-300 font-medium">99.1%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-white/80" />
                    <span className="text-white/80">Support Language</span>
                  </div>
                  <span className="text-white font-medium">Multi-language</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white mb-2">
                    Custom Pricing Available
                  </div>
                  <div className="text-white/80 text-sm">
                    Contact our consultants for personalized quotes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* What's Included */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">What's Included</h2>
              
              <div className="space-y-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{feature}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Expert guidance and comprehensive support included
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Process */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Process</h2>
              
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Initial Consultation', desc: 'Free 30-minute consultation to understand your needs' },
                  { step: 2, title: 'Strategy Development', desc: 'Custom strategy tailored to your business goals' },
                  { step: 3, title: 'Implementation', desc: 'Expert execution with regular progress updates' },
                  { step: 4, title: 'Ongoing Support', desc: 'Continued support and compliance monitoring' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 ${service.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available in Countries */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Available in These Jurisdictions
            </h2>
            <p className="text-lg text-gray-600">
              This service is available across our network of business-friendly countries
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCountries.map((country) => (
              <Link
                key={country.id}
                to={`/countries/${country.slug}`}
                className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow group border border-gray-100"
              >
                <div className="text-3xl mb-2">{country.flag}</div>
                <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                  {country.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">Available</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started with {service.name}?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Connect with our expert consultants who specialize in {service.name.toLowerCase()} 
            and get personalized guidance for your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/get-started"
              className={`${service.color} text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2`}
            >
              <span>Start {service.name}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/consultation"
              className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetailPage;