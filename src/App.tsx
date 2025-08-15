import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BlogPage from './pages/BlogPage'; // Import BlogPage
import AIAssistantPage from './pages/AIAssistantPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import FAQPage from './pages/FAQPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';

// Protected Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CountryManagement from './pages/admin/CountryManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import ContentManagement from './pages/admin/ContentManagement';
import SystemSettings from './pages/admin/SystemSettings';
import FinancialReports from './pages/admin/FinancialReports';
import SecurityAudit from './pages/admin/SecurityAudit';

// Protected Pages - Consultant
import ConsultantDashboard from './pages/ConsultantDashboard';
import CustomersManagement from './pages/CustomersManagement';
import TaskManagement from './pages/consultant/TaskManagement';
import DocumentManagement from './pages/consultant/DocumentManagement';
import ProjectManagement from './pages/consultant/ProjectManagement';
import ConsultantServices from './pages/ConsultantServices';
import ConsultantPayments from './pages/consultant/ConsultantPayments';
import ConsultantCountryManagement from './pages/consultant/ConsultantCountryManagement';
import AccountingManagement from './pages/AccountingManagement';
import LegacyOrders from './pages/LegacyOrders';

// Protected Pages - Client
import ClientDashboard from './pages/client/ClientDashboard';
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
import ClientServices from './pages/ClientServices';
import ClientProjects from './pages/client/ClientProjects';
import ClientDocuments from './pages/client/ClientDocuments';
import MyProfilePage from './pages/MyProfilePage';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Consulting19 Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/countries/:slug" element={<CountryDetailPage />} />
          <Route path="/countries/:countrySlug/services/:serviceSlug" element={<CountryServiceDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/blog" element={<BlogPage />} /> {/* Change route to BlogPage */}
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/get-started" element={<AIAssistantPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/countries"
            element={
              <ProtectedRoute requiredRole="admin">
                <CountryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute requiredRole="admin">
                <ServiceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute requiredRole="admin">
                <ContentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SystemSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <FinancialReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/security"
            element={
              <ProtectedRoute requiredRole="admin">
                <SecurityAudit />
              </ProtectedRoute>
            }
          />

          {/* Consultant Routes */}
          <Route
            path="/consultant-dashboard"
            element={
              <ProtectedRoute requiredRole="consultant">
                <ConsultantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/country-content"
            element={
              <ProtectedRoute requiredRole="consultant">
                <ConsultantCountryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/customers"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <CustomersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/tasks"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/projects"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/services"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <ConsultantServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/payments"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <ConsultantPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/country-management"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <ConsultantCountryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/accounting"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <AccountingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/tasks"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/legacy-orders"
            element={
              <ProtectedRoute allowedRoles={["consultant"]}>
                <LegacyOrders />
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-accounting"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientAccountingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/services"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/projects"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/documents"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDocuments />
              </ProtectedRoute>
            }
          />

          {/* Profile Management - Available to all authenticated users */}
          <Route
            path="/my-profile"
            element={
              <ProtectedRoute allowedRoles={["admin", "consultant", "client"]}>
                <MyProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Legacy Routes for Backward Compatibility */}
          <Route path="/client/accounting" element={<Navigate to="/client-accounting" replace />} />
          <Route path="/consultant-services" element={<ConsultantServices />} />
          <Route path="/customers-management" element={<CustomersManagement />} />
          <Route path="/accounting-management" element={<AccountingManagement />} />
          <Route path="/legacy-orders" element={<LegacyOrders />} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}