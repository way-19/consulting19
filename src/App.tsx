import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AIAssistantPage from './pages/AIAssistantPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Dashboard Pages
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import AccountingManagement from './pages/AccountingManagement';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';

// Consultant Pages
import ClientsPage from './pages/consultant/ClientsPage';
import OrdersPage from './pages/consultant/OrdersPage';
import ConsultantServicesPage from './pages/consultant/ServicesPage';
import PaymentsPage from './pages/consultant/PaymentsPage';
import CountrySitePage from './pages/consultant/CountrySitePage';

// Client Pages
import ClientServices from './pages/ClientServices';

// Standalone Pages
import CustomersManagement from './pages/CustomersManagement';
import LegacyOrders from './pages/LegacyOrders';
import ConsultantServices from './pages/ConsultantServices';
import ConsultantPayments from './pages/ConsultantPayments';

function App() {
  const { loading, user, profile } = useAuth();

  // Show loading only when actually loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in but no profile, show error
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Profile Not Found</h2>
            <p className="text-red-700 text-sm mb-4">
              Your account exists but profile information is missing. Please contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
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

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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

        <Route path="/client-accounting" element={
          <ProtectedRoute requiredRole="client">
            <AccountingManagement />
          </ProtectedRoute>
        } />

        {/* Consultant Routes */}
        <Route path="/consultant/clients" element={
          <ProtectedRoute requiredRole="consultant">
            <ClientsPage />
          </ProtectedRoute>
        } />

        <Route path="/consultant/orders" element={
          <ProtectedRoute requiredRole="consultant">
            <OrdersPage />
          </ProtectedRoute>
        } />

        <Route path="/consultant/services" element={
          <ProtectedRoute requiredRole="consultant">
            <ConsultantServicesPage />
          </ProtectedRoute>
        } />

        <Route path="/consultant/payments" element={
          <ProtectedRoute requiredRole="consultant">
            <PaymentsPage />
          </ProtectedRoute>
        } />

        <Route path="/consultant/country-site" element={
          <ProtectedRoute requiredRole="consultant">
            <CountrySitePage />
          </ProtectedRoute>
        } />

        {/* Client Routes */}
        <Route path="/client-services" element={
          <ProtectedRoute requiredRole="client">
            <ClientServices />
          </ProtectedRoute>
        } />

        {/* Standalone Routes */}
        <Route path="/customers-management" element={
          <ProtectedRoute requiredRole="consultant">
            <CustomersManagement />
          </ProtectedRoute>
        } />

        <Route path="/legacy-orders" element={
          <ProtectedRoute requiredRole="consultant">
            <LegacyOrders />
          </ProtectedRoute>
        } />

        <Route path="/consultant-services" element={
          <ProtectedRoute requiredRole="consultant">
            <ConsultantServices />
          </ProtectedRoute>
        } />

        <Route path="/consultant-payments" element={
          <ProtectedRoute requiredRole="consultant">
            <ConsultantPayments />
          </ProtectedRoute>
        } />

        {/* Redirects */}
        <Route path="/get-started" element={<Navigate to="/signup" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;