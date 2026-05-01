import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./app/routes/AppRouter";
import { AuthProvider } from "./app/auth/AuthProvider";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
