import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
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

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import ConsultantDashboard from './pages/ConsultantDashboard';
import AccountingManagement from './pages/AccountingManagement';
import ClientServices from './pages/ClientServices';

// New Consultant Pages
import ClientsPage from './pages/consultant/ClientsPage';
import OrdersPage from './pages/consultant/OrdersPage';
import ServicesPage from './pages/consultant/ServicesPage';
import PaymentsPage from './pages/consultant/PaymentsPage';
import CountrySitePage from './pages/consultant/CountrySitePage';

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
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Navbar />
            <main className="flex-1">
              <HomePage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/countries" element={
          <>
            <Navbar />
            <main className="flex-1">
              <CountriesPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/countries/:slug" element={
          <>
            <Navbar />
            <main className="flex-1">
              <CountryDetailPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/countries/:countrySlug/services/:serviceSlug" element={
          <>
            <Navbar />
            <main className="flex-1">
              <CountryServiceDetailPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/services" element={
          <>
            <Navbar />
            <main className="flex-1">
              <ServicesPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/services/:slug" element={
          <>
            <Navbar />
            <main className="flex-1">
              <ServiceDetailPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/about" element={
          <>
            <Navbar />
            <main className="flex-1">
              <AboutPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/contact" element={
          <>
            <Navbar />
            <main className="flex-1">
              <ContactPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/blog" element={
          <>
            <Navbar />
            <main className="flex-1">
              <BlogPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/blog/:postId" element={
          <>
            <Navbar />
            <main className="flex-1">
              <BlogPostPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/ai-assistant" element={
          <>
            <Navbar />
            <main className="flex-1">
              <AIAssistantPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/privacy" element={
          <>
            <Navbar />
            <main className="flex-1">
              <PrivacyPolicyPage />
            </main>
            <Footer />
          </>
        } />
        
        <Route path="/terms" element={
          <>
            <Navbar />
            <main className="flex-1">
              <TermsOfServicePage />
            </main>
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
            <ServicesPage />
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

        <Route path="/client-accounting" element={
          <ProtectedRoute requiredRole="client">
            <AccountingManagement />
          </ProtectedRoute>
        } />

        <Route path="/client/services" element={
          <ProtectedRoute requiredRole="client">
            <ClientServices />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;