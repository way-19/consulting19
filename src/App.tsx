import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AIAssistantPage from './pages/AIAssistantPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Dashboard Pages
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
import AccountSettingsPage from './pages/AccountSettingsPage';
import ClientServices from './pages/ClientServices';
import ConsultantServices from './pages/ConsultantServices';
import LegacyOrders from './pages/LegacyOrders';
import CustomersManagement from './pages/CustomersManagement';
import ConsultantPayments from './pages/ConsultantPayments';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
            <Footer />
          </>
        } />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        <Route path="/countries" element={
          <>
            <Navbar />
            <CountriesPage />
            <Footer />
          </>
        } />
        
        <Route path="/countries/:slug" element={
          <>
            <Navbar />
            <CountryDetailPage />
            <Footer />
          </>
        } />
        
        <Route path="/countries/:countrySlug/services/:serviceSlug" element={
          <>
            <Navbar />
            <CountryServiceDetailPage />
            <Footer />
          </>
        } />
        
        <Route path="/services" element={
          <>
            <Navbar />
            <ServicesPage />
            <Footer />
          </>
        } />
        
        <Route path="/services/:slug" element={
          <>
            <Navbar />
            <ServiceDetailPage />
            <Footer />
          </>
        } />
        
        <Route path="/about" element={
          <>
            <Navbar />
            <AboutPage />
            <Footer />
          </>
        } />
        
        <Route path="/contact" element={
          <>
            <Navbar />
            <ContactPage />
            <Footer />
          </>
        } />
        
        <Route path="/blog" element={
          <>
            <Navbar />
            <BlogPage />
            <Footer />
          </>
        } />
        
        <Route path="/blog/:postId" element={
          <>
            <Navbar />
            <BlogPostPage />
            <Footer />
          </>
        } />
        
        <Route path="/ai-assistant" element={
          <>
            <Navbar />
            <AIAssistantPage />
            <Footer />
          </>
        } />
        
        <Route path="/privacy" element={
          <>
            <Navbar />
            <PrivacyPolicyPage />
            <Footer />
          </>
        } />
        
        <Route path="/terms" element={
          <>
            <Navbar />
            <TermsOfServicePage />
            <Footer />
          </>
        } />

        {/* Protected Routes */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/consultant-dashboard" element={
          <ProtectedRoute requiredRole="consultant">
            <ConsultantDashboard />
          </ProtectedRoute>
        } />

        <Route path="/consultant-services" element={
          <ProtectedRoute requiredRole="consultant">
            <ConsultantServices />
          </ProtectedRoute>
        } />

        <Route path="/legacy-orders" element={
          <ProtectedRoute requiredRole="consultant">
            <LegacyOrders />
          </ProtectedRoute>
        } />

        <Route path="/customers-management" element={
          <ProtectedRoute requiredRole="consultant">
            <CustomersManagement />
          </ProtectedRoute>
        } />

        <Route path="/payments" element={
          <ProtectedRoute requiredRole="consultant">
            <ConsultantPayments />
          </ProtectedRoute>
        } />

        <Route path="/client-accounting" element={
          <ProtectedRoute requiredRole="client">
            <ClientAccountingDashboard />
          </ProtectedRoute>
        } />

        <Route path="/account-settings" element={
          <ProtectedRoute>
            <AccountSettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/client-services" element={
          <ProtectedRoute requiredRole="client">
            <ClientServices />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;