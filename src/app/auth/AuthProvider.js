import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getStoredAuth, storeAuth } from "./auth";

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
        };
        storeAuth(next);
        setAuth(next);
      },
      logout: () => {
        clearAuth();
        setAuth(null);
      },
    };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

