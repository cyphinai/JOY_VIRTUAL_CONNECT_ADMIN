import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function RoleRoute({ allowedRoles, children }) {
  const { auth } = useAuth();
  const role = auth?.role;
  if (!role) return <Navigate to="/login" replace />;
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

