import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "client" | "consultant" | "admin";
type Props = { requiredRole?: Role; children: React.ReactElement };

export default function ProtectedRoute({ requiredRole, children }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-purple-600" />
        <span className="ml-3 text-gray-600">Loading…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}