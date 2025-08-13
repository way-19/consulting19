import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Role = 'admin' | 'consultant' | 'client';

export default function ProtectedRoute({ 
  requiredRole, 
  children 
}: { 
  requiredRole?: Role; 
  children: React.ReactNode 
}) {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  
  // If no profile yet, show loading
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (requiredRole && (!profile || profile.role !== requiredRole)) {
    // Rol uyuşmazsa kendi paneline yönlendir
    switch (profile?.role) {
      case 'admin': return <Navigate to="/admin-dashboard" />;
      case 'consultant': return <Navigate to="/consultant-dashboard" />;
      case 'client': return <Navigate to="/client-accounting" />;
      default: return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
}