import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import AdminLayout from "../../layout/AdminLayout/AdminLayout";
import LoginPage from "../../pages/Login/LoginPage";
import Dashboard from "../../pages/Dashboard/Dashboard";
import NotFound from "../../pages/NotFound/NotFound";
import { ROLES } from "../auth/auth";

import UsersManagement from "../../userTypes/superAdmin/UsersManagement/UsersManagement";
import CreateUser from "../../userTypes/superAdmin/CreateUser/CreateUser";
import UpdateUser from "../../userTypes/superAdmin/UpdateUser/UpdateUser";
import UserDetail from "../../userTypes/superAdmin/UserDetail/UserDetail";
import RoadsideAssistanceRequests from "../../userTypes/roadsideAssistanceAgent/AssistanceRequests/AssistanceRequests";
import RoadsideProfile from "../../userTypes/roadsideAssistanceAgent/Profile/Profile";
import RoadsideServices from "../../userTypes/roadsideAssistanceAgent/Services/Services";
import InsuranceProfile from "../../userTypes/insuranceAgent/Profile/Profile";
import QuotesRequests from "../../userTypes/insuranceAgent/QuotesRequests/QuotesRequests";
import ComposeQuote from "../../userTypes/insuranceAgent/ComposeQuote/ComposeQuote";
import SentQuotesHistory from "../../userTypes/insuranceAgent/SentQuotesHistory/SentQuotesHistory";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route
          path="super-admin/users/new"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <CreateUser />
            </RoleRoute>
          }
        />
        <Route
          path="super-admin/users/:userId/edit"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <UpdateUser />
            </RoleRoute>
          }
        />
        <Route
          path="super-admin/users/:userId"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <UserDetail />
            </RoleRoute>
          }
        />
        <Route
          path="super-admin/users"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <UsersManagement />
            </RoleRoute>
          }
        />

        <Route
          path="roadside/requests"
          element={
            <RoleRoute allowedRoles={[ROLES.ROAD_ASSIST_AGENT]}>
              <RoadsideAssistanceRequests />
            </RoleRoute>
          }
        />
        <Route
          path="roadside/profile"
          element={
            <RoleRoute allowedRoles={[ROLES.ROAD_ASSIST_AGENT]}>
              <RoadsideProfile />
            </RoleRoute>
          }
        />
        <Route
          path="roadside/services"
          element={
            <RoleRoute allowedRoles={[ROLES.ROAD_ASSIST_AGENT]}>
              <RoadsideServices />
            </RoleRoute>
          }
        />

        <Route
          path="insurance/profile"
          element={
            <RoleRoute allowedRoles={[ROLES.INSURANCE_AGENT]}>
              <InsuranceProfile />
            </RoleRoute>
          }
        />
        <Route
          path="insurance/quotes/compose"
          element={
            <RoleRoute allowedRoles={[ROLES.INSURANCE_AGENT]}>
              <ComposeQuote />
            </RoleRoute>
          }
        />
        <Route
          path="insurance/quotes/sent"
          element={
            <RoleRoute allowedRoles={[ROLES.INSURANCE_AGENT]}>
              <SentQuotesHistory />
            </RoleRoute>
          }
        />
        <Route
          path="insurance/quotes"
          element={
            <RoleRoute allowedRoles={[ROLES.INSURANCE_AGENT]}>
              <QuotesRequests />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

