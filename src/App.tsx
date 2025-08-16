import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
import FAQPage from './pages/FAQPage';
import PartnershipProgramPage from './pages/PartnershipProgramPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import AIAssistantPage from './pages/AIAssistantPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import BlogPage from './pages/BlogPage';

// Client Pages
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjects from './pages/client/ClientProjects';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientServices from './pages/ClientServices';
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';

// Consultant Pages
import ConsultantDashboard from './pages/ConsultantDashboard';
import ConsultantPayments from './pages/consultant/ConsultantPayments';
import ConsultantServices from './pages/ConsultantServices';
import DocumentManagement from './pages/consultant/DocumentManagement';
import ProjectManagement from './pages/consultant/ProjectManagement';
import TaskManagement from './pages/consultant/TaskManagement';
import ConsultantCountryManagement from './pages/consultant/ConsultantCountryManagement';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CountryManagement from './pages/admin/CountryManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import ContentManagement from './pages/admin/ContentManagement';
import FinancialReports from './pages/admin/FinancialReports';
import SystemSettings from './pages/admin/SystemSettings';
import SecurityAudit from './pages/admin/SecurityAudit';

// Common Authenticated Pages
import MyProfilePage from './pages/MyProfilePage';
import NotificationCenter from './pages/NotificationCenter';
import CustomersManagement from './pages/CustomersManagement';
import AccountingManagement from './pages/AccountingManagement';
import LegacyOrders from './pages/LegacyOrders';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-b-2 border-purple-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing Consulting19 Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/:slug" element={<CountryDetailPage />} />
          <Route path="/countries/:countrySlug/services/:serviceSlug" element={<CountryServiceDetailPage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/partnership-program" element={<PartnershipProgramPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Auth Routes - Redirect if already logged in */}
          <Route
            path="/login"
            element={user ? <Navigate to="/my-profile" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/my-profile" replace /> : <SignupPage />}
          />

          {/* Authenticated Routes (Common) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-profile" element={<MyProfilePage />} />
            <Route path="/notifications" element={<NotificationCenter />} />
          </Route>

          {/* Client Routes */}
          <Route element={<ProtectedRoute requiredRole="client" />}>
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/client/projects" element={<ClientProjects />} />
            <Route path="/client/documents" element={<ClientDocuments />} />
            <Route path="/client/services" element={<ClientServices />} />
            <Route path="/client-accounting" element={<ClientAccountingDashboard />} />
          </Route>

          {/* Consultant Routes */}
          <Route element={<ProtectedRoute requiredRole="consultant" />}>
            <Route path="/consultant-dashboard" element={<ConsultantDashboard />} />
            <Route path="/consultant/payments" element={<ConsultantPayments />} />
            <Route path="/consultant-services" element={<ConsultantServices />} />
            <Route path="/consultant/documents" element={<DocumentManagement />} />
            <Route path="/consultant/projects" element={<ProjectManagement />} />
            <Route path="/consultant/tasks" element={<TaskManagement />} />
            <Route path="/consultant/country-management" element={<ConsultantCountryManagement />} />
            <Route path="/customers-management" element={<CustomersManagement />} />
            <Route path="/legacy-orders" element={<LegacyOrders />} />
            <Route path="/accounting-management" element={<AccountingManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/countries" element={<CountryManagement />} />
            <Route path="/admin/services" element={<ServiceManagement />} />
            <Route path="/admin/content" element={<ContentManagement />} />
            <Route path="/admin/reports" element={<FinancialReports />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/security" element={<SecurityAudit />} />
          </Route>

          {/* Catch-all for 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-gray-700">
              <h1 className="text-6xl font-bold text-purple-600">404</h1>
              <p className="text-2xl font-medium mb-4">Page Not Found</p>
              <p className="text-lg text-gray-600 mb-8">The page you are looking for does not exist.</p>
              <Link to="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Go to Homepage
              </Link>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;