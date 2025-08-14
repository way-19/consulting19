import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({
  requiredRole,
  children,
}: {
  requiredRole?: "admin" | "consultant" | "client";
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && profile?.role !== requiredRole) return <Navigate to="/" replace />;

  return <>{children}</>;
}
