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

// Protected Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CountryManagement from './pages/admin/CountryManagement';
import ServiceManagement from './pages/admin/ServiceManagement';
import ContentManagement from './pages/admin/ContentManagement';
import SystemSettings from './pages/admin/SystemSettings';
import FinancialReports from './pages/admin/FinancialReports';

// Protected Pages - Consultant
import ConsultantDashboard from './pages/ConsultantDashboard';
import CustomersManagement from './pages/CustomersManagement';
import TaskManagement from './pages/consultant/TaskManagement';
import ProjectManagement from './pages/consultant/ProjectManagement';
import ConsultantServices from './pages/ConsultantServices';
import ConsultantPayments from './pages/consultant/ConsultantPayments';
import AccountingManagement from './pages/AccountingManagement';
import LegacyOrders from './pages/LegacyOrders';

// Protected Pages - Client
import ClientDashboard from './pages/client/ClientDashboard';
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
import ClientServices from './pages/ClientServices';
import ClientProjects from './pages/client/ClientProjects';

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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          
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
            path="/consultant/customers"
            element={
              <ProtectedRoute requiredRole="consultant">
                <CustomersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/tasks"
            element={
              <ProtectedRoute requiredRole="consultant">
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/projects"
            element={
              <ProtectedRoute requiredRole="consultant">
                <ProjectManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/services"
            element={
              <ProtectedRoute requiredRole="consultant">
                <ConsultantServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/payments"
            element={
              <ProtectedRoute requiredRole="consultant">
                <ConsultantPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/accounting"
            element={
              <ProtectedRoute requiredRole="consultant">
                <AccountingManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/legacy-orders"
            element={
              <ProtectedRoute requiredRole="consultant">
                <LegacyOrders />
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/accounting"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientAccountingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/services"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/projects"
            element={
              <ProtectedRoute requiredRole="client">
                <ClientProjects />
              </ProtectedRoute>
            }
          />

          {/* Legacy Routes for Backward Compatibility */}
          <Route path="/client-accounting" element={<Navigate to="/client/accounting" replace />} />
          <Route path="/consultant-services" element={<Navigate to="/consultant/services" replace />} />
          <Route path="/customers-management" element={<Navigate to="/consultant/customers" replace />} />
          <Route path="/accounting-management" element={<Navigate to="/consultant/accounting" replace />} />
          <Route path="/legacy-orders" element={<Navigate to="/consultant/legacy-orders" replace />} />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}