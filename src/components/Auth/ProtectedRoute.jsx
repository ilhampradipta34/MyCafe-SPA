import { Outlet, Navigate } from "react-router-dom";

import { Spinner } from "flowbite-react";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ allowedRoles }) {
  const { session, role, loading } = useAuth();

  if (loading || (session && !role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
