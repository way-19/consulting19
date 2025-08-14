import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ... sayfa importları (sende olduğu gibi) ...

export default function App() {
  const { loading, user, profile } = useAuth();

  // Profil yoksa (ve kontrol bitmişse) uyarı göster
  if (!loading && user && !profile) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Profile Not Found</h2>
          <p className="mb-4 text-sm text-red-700">
            Your account exists but profile information is missing. Please contact support.
          </p>
          <button onClick={() => window.location.reload()} className="rounded bg-red-600 px-4 py-2 text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // >>> Global "if (loading) return spinner" YOK. Public rotalar her zaman çizilir.
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HomePage />
              <Footer />
            </>
          }
        />
        {/* ... diğer public rotalar ... */}

        {/* Protected */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultant-dashboard"
          element={
            <ProtectedRoute requiredRole="consultant">
              <ConsultantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client-accounting"
          element={
            <ProtectedRoute requiredRole="client">
              <AccountingManagement />
            </ProtectedRoute>
          }
        />

        {/* ... danışman/cliente özel diğer rotalar aynı kalabilir ... */}

        <Route path="/get-started" element={<Navigate to="/signup" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
