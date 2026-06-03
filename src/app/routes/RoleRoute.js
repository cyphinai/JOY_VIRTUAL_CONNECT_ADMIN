import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { ROLES } from "../auth/auth";

function canAccessRoute(role, allowedRoles) {
  if (!role) return false;
  if (allowedRoles.includes(role)) return true;
  if (role === ROLES.SUPER_ADMIN && allowedRoles.some((r) => r !== ROLES.SUPER_ADMIN)) {
    return true;
  }
  return false;
}

export default function RoleRoute({ allowedRoles, children }) {
  const { auth } = useAuth();
  const role = auth?.role;
  if (!role) return <Navigate to="/login" replace />;
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !canAccessRoute(role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
