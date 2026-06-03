import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getStoredAuth, ROLES, storeAuth, typeToPanelRole } from "./auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());

  const value = useMemo(() => {
    return {
      auth,
      isAuthed: Boolean(auth?.role),
      login: (session) => {
        const next = {
          role: session.role,
          name: session.name || "User",
          email: session.email || "",
          userId: session.userId || "",
          type: session.type || session.role,
        };
        storeAuth(next);
        setAuth(next);
      },
      logout: () => {
        clearAuth();
        setAuth(null);
      },
      impersonateAdmin: (targetUser) => {
        if (!auth || auth.role !== ROLES.SUPER_ADMIN || auth.impersonatingFrom) return;
        const role = typeToPanelRole(targetUser.type);
        if (!role || role === ROLES.SUPER_ADMIN) return;
        const next = {
          role,
          name: targetUser.name,
          email: targetUser.email || "",
          userId: targetUser.id,
          type: targetUser.type,
          impersonatingFrom: {
            role: auth.role,
            name: auth.name,
            email: auth.email,
            userId: auth.userId,
            type: auth.type || auth.role,
          },
        };
        storeAuth(next);
        setAuth(next);
      },
      stopImpersonating: () => {
        if (!auth?.impersonatingFrom) return;
        storeAuth(auth.impersonatingFrom);
        setAuth(auth.impersonatingFrom);
      },
      isImpersonating: Boolean(auth?.impersonatingFrom),
    };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

