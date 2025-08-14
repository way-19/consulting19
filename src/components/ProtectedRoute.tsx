import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "admin" | "consultant" | "client";
interface Props {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

const FullScreenLoader: React.FC<{ message?: string }> = ({ message = "Initializing Consulting19 Platform..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="h-12 w-12 border-b-2 border-purple-600 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-2">Profile not found</h2>
          <p className="text-sm text-gray-600">Your account is active but profile is missing. Please contact support or create one in Supabase Studio.</p>
        </div>
      </div>
    );
  }

  return <>{children ?? <Outlet />}</>;
}