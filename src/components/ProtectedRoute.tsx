import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'consultant' | 'client';
  children: React.ReactNode;
}

export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-900 mb-2">Profile Loading Error</h3>
            <p className="text-red-700 mb-4">
              Unable to load your profile. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole && profile.legacy_role !== requiredRole) {
    console.log(`🚫 Access denied. Required: ${requiredRole}, User: ${profile.legacy_role}`);
    
    // Redirect to appropriate dashboard based on user's role
    const roleRedirects = {
      admin: '/admin-dashboard',
      consultant: '/consultant-dashboard',
      client: '/client-dashboard'
    };

    return <Navigate to={roleRedirects[profile.legacy_role]} replace />;
  }

  return <>{children}</>;
}