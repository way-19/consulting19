/* __backup__ 2025-08-12 15:30 */
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// 
// export default function ProtectedRoute({ requiredRole, children }: { requiredRole?: 'admin' | 'consultant' | 'client'; children: React.ReactNode }) {
//   const { loading, user, profile } = useAuth();
// 
//   if (loading) return <div className="p-6">Loading...</div>;
//   if (!user) return <Navigate to="/login" />;
// 
//   if (requiredRole && profile?.role !== requiredRole) {
//     switch (profile?.role) {
//       case 'admin':
//         return <Navigate to="/admin-dashboard" />;
//       case 'consultant':
//         return <Navigate to="/consultant-dashboard" />;
//       case 'client':
//         return <Navigate to="/client-accounting" />;
//       default:
//         return <Navigate to="/" />;
//     }
//   }
//   return <>{children}</>;
// }

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Role = 'admin' | 'consultant' | 'client';

export default function ProtectedRoute({ requiredRole, children }: { requiredRole?: Role; children: React.ReactNode }) {
  const { loading, user, profile } = useAuth();

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/login" />;

  if (requiredRole && profile?.role !== requiredRole) {
    switch (profile?.role) {
      case 'admin': return <Navigate to="/admin-dashboard" />;
      case 'consultant': return <Navigate to="/consultant-dashboard" />;
      case 'client': return <Navigate to="/client-accounting" />;
      default: return <Navigate to="/" />;
    }
  }
  return <>{children}</>;
}