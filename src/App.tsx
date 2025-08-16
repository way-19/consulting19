import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyProfilePage from './pages/MyProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import BlogPage from './pages/BlogPage';
import FAQPage from './pages/FAQPage';
import AIAssistantPage from './pages/AIAssistantPage';
import PartnershipProgramPage from './pages/PartnershipProgramPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import NotificationCenter from './pages/NotificationCenter';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CountryManagement from './pages/admin/CountryManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import ContentManagement from './pages/admin/ContentManagement';
import FinancialReports from './pages/admin/FinancialReports';
import SecurityAudit from './pages/admin/SecurityAudit';
import SystemSettings from './pages/admin/SystemSettings';

// Consultant pages
import ConsultantDashboard from './pages/ConsultantDashboard';
import ConsultantServices from './pages/ConsultantServices';
import LegacyOrders from './pages/LegacyOrders';
import CustomersManagement from './pages/CustomersManagement';
import AccountingManagement from './pages/AccountingManagement';
import DocumentManagement from './pages/consultant/DocumentManagement';
import ProjectManagement from './pages/consultant/ProjectManagement';
import TaskManagement from './pages/consultant/TaskManagement';
import ConsultantPayments from './pages/consultant/ConsultantPayments';
import ConsultantCountryManagement from './pages/consultant/ConsultantCountryManagement';

// Client pages
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientProjects from './pages/client/ClientProjects';
import ClientServices from './pages/ClientServices';

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Consulting19 Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/:slug" element={<CountryDetailPage />} />
          <Route path="/countries/:countrySlug/services/:serviceSlug" element={<CountryServiceDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/partnership-program" element={<PartnershipProgramPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />

          {/* Protected routes - All authenticated users */}
          <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationCenter /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/countries" element={<ProtectedRoute requiredRole="admin"><CountryManagement /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><ServiceManagement /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute requiredRole="admin"><ContentManagement /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><FinancialReports /></ProtectedRoute>} />
          <Route path="/admin/security" element={<ProtectedRoute requiredRole="admin"><SecurityAudit /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><SystemSettings /></ProtectedRoute>} />

          {/* Consultant routes */}
          <Route path="/consultant-dashboard" element={<ProtectedRoute requiredRole="consultant"><ConsultantDashboard /></ProtectedRoute>} />
          <Route path="/consultant-services" element={<ProtectedRoute requiredRole="consultant"><ConsultantServices /></ProtectedRoute>} />
          <Route path="/legacy-orders" element={<ProtectedRoute requiredRole="consultant"><LegacyOrders /></ProtectedRoute>} />
          <Route path="/customers-management" element={<ProtectedRoute requiredRole="consultant"><CustomersManagement /></ProtectedRoute>} />
          <Route path="/accounting-management" element={<ProtectedRoute requiredRole="consultant"><AccountingManagement /></ProtectedRoute>} />
          <Route path="/consultant/documents" element={<ProtectedRoute requiredRole="consultant"><DocumentManagement /></ProtectedRoute>} />
          <Route path="/consultant/projects" element={<ProtectedRoute requiredRole="consultant"><ProjectManagement /></ProtectedRoute>} />
          <Route path="/consultant/tasks" element={<ProtectedRoute requiredRole="consultant"><TaskManagement /></ProtectedRoute>} />
          <Route path="/consultant/payments" element={<ProtectedRoute requiredRole="consultant"><ConsultantPayments /></ProtectedRoute>} />
          <Route path="/consultant/country-management" element={<ProtectedRoute requiredRole="consultant"><ConsultantCountryManagement /></ProtectedRoute>} />

          {/* Client routes */}
          <Route path="/client-accounting" element={<ProtectedRoute requiredRole="client"><ClientAccountingDashboard /></ProtectedRoute>} />
          <Route path="/client-dashboard" element={<ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>} />
          <Route path="/client/documents" element={<ProtectedRoute requiredRole="client"><ClientDocuments /></ProtectedRoute>} />
          <Route path="/client/projects" element={<ProtectedRoute requiredRole="client"><ClientProjects /></ProtectedRoute>} />
          <Route path="/client/services" element={<ProtectedRoute requiredRole="client"><ClientServices /></ProtectedRoute>} />

          {/* Redirects for legacy URLs */}
          <Route path="/get-started" element={<Navigate to="/signup" replace />} />
          <Route path="/consultation" element={<Navigate to="/contact" replace />} />

          {/* 404 page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <Link 
                  to="/" 
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;