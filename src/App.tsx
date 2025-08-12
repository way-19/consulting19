import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CountriesPage from './pages/CountriesPage';
import CountryDetailPage from './pages/CountryDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
import ConsultantDashboard from './pages/ConsultantDashboard';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import ConsultantServices from './pages/ConsultantServices';
import ClientServices from './pages/ClientServices';
import LegacyOrders from './pages/LegacyOrders';
import AccountingManagement from './pages/AccountingManagement';
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
import CustomersManagement from './pages/CustomersManagement';

// Placeholder pages for routes
const GetStartedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Get Started</h1>
      <p className="text-lg text-gray-600 mb-8">Begin your international business journey</p>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md mx-auto">
        <p className="text-gray-600">Coming soon - Application form and consultation booking</p>
      </div>
    </div>
  </div>
);

const BlogPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Global Insights</h1>
      <p className="text-lg text-gray-600 mb-8">Latest updates from our country specialists</p>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md mx-auto">
        <p className="text-gray-600">Coming soon - Country-specific insights and updates</p>
      </div>
    </div>
  </div>
);

const ConsultationPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Free Consultation</h1>
      <p className="text-lg text-gray-600 mb-8">Schedule a call with our experts</p>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md mx-auto">
        <p className="text-gray-600">Coming soon - Consultation scheduling system</p>
      </div>
    </div>
  </div>
);

const AIAssistantPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Assistant</h1>
      <p className="text-lg text-gray-600 mb-8">Intelligent business guidance</p>
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md mx-auto">
        <p className="text-gray-600">Coming soon - AI chat interface integration</p>
      </div>
    </div>
  </div>
);

// Navigation handler component
const NavigationHandler = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const didNavigate = useRef(false);

  useEffect(() => {
    // Reset navigation flag when location changes
    didNavigate.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && user && profile && !didNavigate.current) {
      console.log('🎯 NavigationHandler: User logged in, redirecting based on role:', profile.role);
      
      didNavigate.current = true;
      
      switch (profile.role) {
        case 'admin':
          console.log('🔄 Redirecting admin to admin dashboard');
          navigate('/admin-dashboard', { replace: true });
          break;
        case 'consultant':
          console.log('🔄 Redirecting consultant to consultant dashboard');
          navigate('/consultant-dashboard', { replace: true });
          break;
        case 'client':
          console.log('🔄 Redirecting client to accounting dashboard');
          navigate('/client-accounting', { replace: true });
          break;
        default:
          console.log('🔄 Redirecting to home page');
          navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, navigate, location.pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <NavigationHandler />
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/countries/:slug" element={<CountryDetailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/countries/:countrySlug/services/:serviceSlug" element={<CountryServiceDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/ai-assistant" element={<AIAssistantPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/get-started" 
                element={
                  <ProtectedRoute>
                    <GetStartedPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consultation" 
                element={
                  <ProtectedRoute>
                    <ConsultationPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Role-based Protected Routes */}
              <Route 
                path="/consultant-dashboard" 
                element={
                  <ProtectedRoute requiredRole="consultant">
                    <ConsultantDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consultant-services" 
                element={
                  <ProtectedRoute requiredRole="consultant">
                    <ConsultantServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/legacy-orders" 
                element={
                  <ProtectedRoute requiredRole="consultant">
                    <LegacyOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accounting-management" 
                element={
                  <ProtectedRoute requiredRole="consultant">
                    <AccountingManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customers-management" 
                element={
                  <ProtectedRoute requiredRole="consultant">
                    <CustomersManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-services" 
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientServices />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-accounting" 
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientAccountingDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                        <p className="text-lg text-gray-600">Coming soon - Full admin panel</p>
                      </div>
                    </div>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-accounting" 
                element={
                  <ProtectedRoute requiredRole="client">
                    <ClientAccountingDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;