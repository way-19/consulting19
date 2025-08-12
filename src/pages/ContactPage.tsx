import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle, AlertCircle, Globe, Users, Shield } from 'lucide-react';

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
                  🌍 Önemli Bilgilendirme - Important Notice
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p className="leading-relaxed">
                    <strong>Türkçe:</strong> Her ülke danışmanlığımız yerel olarak hizmet vermektedir. 
                    Kayıt işleminiz tamamlandıktan sonra, tüm iletişim sadece online platformumuz 
                    üzerinden gerçekleştirilmektedir. Telefon görüşmesi yapılmamaktadır.
                  </p>
                  <p className="leading-relaxed">
                    <strong>English:</strong> Each of our country consultants provides services locally. 
                    After your registration is completed, all communication is conducted exclusively 
                    through our online platform. No phone calls are made.
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
                Ana Sistem Formu - Main System Form
              </h2>
              <p className="text-gray-600">
                Öneri ve şikayetleriniz için ana sistem formumuzu kullanabilirsiniz. 
                Use our main system form for suggestions and complaints.
              </p>
            </div>

            {submitStatus === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Mesajınız başarıyla gönderildi! / Your message has been sent successfully!</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">Bir hata oluştu. Lütfen tekrar deneyin. / An error occurred. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad / Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Adınızı ve soyadınızı girin"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta / Email *
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
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj Türü / Message Type *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="suggestion">Öneri / Suggestion</option>
                  <option value="complaint">Şikayet / Complaint</option>
                  <option value="support">Destek / Support</option>
                  <option value="general">Genel / General</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Konu / Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mesajınızın konusunu girin"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj / Message *
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
                    placeholder="Mesajınızı detaylı olarak yazın..."
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
                    <span>Gönderiliyor... / Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Mesaj Gönder / Send Message</span>
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
                İletişim Bilgileri / Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">E-posta / Email</h4>
                    <p className="text-gray-600">hello@consulting19.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      24 saat içinde yanıt / Response within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-3">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Online Destek / Online Support</h4>
                    <p className="text-gray-600">Platform üzerinden canlı destek</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Live support through platform
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Ana Şirket Adresi / Head Office</h4>
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
                Hizmet Özellikleri / Service Features
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">127+ ülkede uzman danışman</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">%98.5 başarı oranı</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">AI destekli danışmanlık</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Çok dilli destek</span>
                </div>
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Sık Sorulan Sorular / FAQ
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Kayıt sonrası süreç nasıl işler?</p>
                  <p className="text-xs text-gray-600 mt-1">How does the process work after registration?</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Hangi ülkelerde hizmet veriyorsunuz?</p>
                  <p className="text-xs text-gray-600 mt-1">Which countries do you serve?</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">AI danışman nasıl çalışır?</p>
                  <p className="text-xs text-gray-600 mt-1">How does the AI consultant work?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;