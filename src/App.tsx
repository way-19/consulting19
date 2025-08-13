/* __backup__ 2025-08-12 15:30 */
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import ProtectedRoute from './components/ProtectedRoute';
// import HomePage from './pages/HomePage';
// import CountriesPage from './pages/CountriesPage';
// import CountryDetailPage from './pages/CountryDetailPage';
// import ServicesPage from './pages/ServicesPage';
// import ServiceDetailPage from './pages/ServiceDetailPage';
// import CountryServiceDetailPage from './pages/CountryServiceDetailPage';
// import AboutPage from './pages/AboutPage';
// import ContactPage from './pages/ContactPage';
// import LoginPage from './pages/LoginPage';
// import SignupPage from './pages/SignupPage';
// import ConsultantDashboard from './pages/ConsultantDashboard';
// import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
// import CustomersManagement from './pages/CustomersManagement';
// import LegacyOrders from './pages/LegacyOrders';
// import ConsultantServices from './pages/ConsultantServices';
// import ClientServices from './pages/ClientServices';
// import AccountingManagement from './pages/AccountingManagement';
// 
// export default function App() {
//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/countries" element={<CountriesPage />} />
//         <Route path="/country/:code" element={<CountryDetailPage />} />
//         <Route path="/country/:code/service/:slug" element={<CountryServiceDetailPage />} />
//         <Route path="/services" element={<ServicesPage />} />
//         <Route path="/services/:slug" element={<ServiceDetailPage />} />
//         <Route path="/about" element={<AboutPage />} />
//         <Route path="/contact" element={<ContactPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/signup" element={<SignupPage />} />
//         <Route
//           path="/admin-dashboard"
//           element={
//             <ProtectedRoute requiredRole="admin">
//               <CustomersManagement />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/consultant-dashboard"
//           element={
//             <ProtectedRoute requiredRole="consultant">
//               <ConsultantDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/consultant-services"
//           element={
//             <ProtectedRoute requiredRole="consultant">
//               <ConsultantServices />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/legacy-orders"
//           element={
//             <ProtectedRoute requiredRole="consultant">
//               <LegacyOrders />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/accounting-management"
//           element={
//             <ProtectedRoute requiredRole="consultant">
//               <AccountingManagement />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/customers"
//           element={
//             <ProtectedRoute requiredRole="consultant">
//               <CustomersManagement />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/client-accounting"
//           element={
//             <ProtectedRoute requiredRole="client">
//               <ClientAccountingDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/client-services"
//           element={
//             <ProtectedRoute requiredRole="client">
//               <ClientServices />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//       <Footer />
//     </>
//   );
// }

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
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
import ConsultantDashboard from './pages/ConsultantDashboard';
import ClientAccountingDashboard from './pages/ClientAccountingDashboard';
import CustomersManagement from './pages/CustomersManagement';
import LegacyOrders from './pages/LegacyOrders';
import ConsultantServices from './pages/ConsultantServices';
import ClientServices from './pages/ClientServices';
import AccountingManagement from './pages/AccountingManagement';
import AdminDashboard from './pages/AdminDashboard';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

export default function App() {
  console.log('🚀 App component loaded');
  
  return (
    <>
      <Navbar />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminDashboard />
          }
        />
        <Route
          path="/consultant-dashboard"
          element={
            <ConsultantDashboard />
          }
        />
        <Route
          path="/consultant-services"
          element={
            <ConsultantServices />
          }
        />
        <Route
          path="/legacy-orders"
          element={
            <LegacyOrders />
          }
        />
        <Route
          path="/accounting-management"
          element={
            <AccountingManagement />
          }
        />
        <Route
          path="/customers-management"
          element={
            <CustomersManagement />
          }
        />
        <Route
          path="/client-accounting"
          element={
            <ClientAccountingDashboard />
          }
        />
        <Route
          path="/client-services"
          element={
            <ClientServices />
          }
        />
        
        {/* Catch all */}
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:postId" element={<BlogPostPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
}