/* __backup__ 2025-08-12 15:02 */
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// 
// interface ProtectedRouteProps {
//   requiredRole?: 'admin' | 'consultant' | 'client';
//   children: React.ReactNode;
// }
// 
// export default function ProtectedRoute({ requiredRole, children }: ProtectedRouteProps) {
//   const { loading, user, profile } = useAuth();
// 
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//       </div>
//     );
//   }
// 
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
// 
//   if (requiredRole && profile?.role !== requiredRole) {
//     // Redirect to their own dashboard based on role
//     if (profile?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
//     if (profile?.role === 'consultant') return <Navigate to="/consultant-dashboard" replace />;
//     return <Navigate to="/client-accounting" replace />;
//   }
// 
//   return <>{children}</>;
// }
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ requiredRole, children }: { requiredRole?: 'admin' | 'consultant' | 'client'; children: React.ReactNode }) {
  const { loading, user, profile } = useAuth();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (requiredRole && profile?.role !== requiredRole) {
    switch (profile?.role) {
      case 'admin':
        return <Navigate to="/admin-dashboard" />;
      case 'consultant':
        return <Navigate to="/consultant-dashboard" />;
      case 'client':
        return <Navigate to="/client-accounting" />;
      default:
        return <Navigate to="/" />;
    }
  }
  return <>{children}</>;
}
