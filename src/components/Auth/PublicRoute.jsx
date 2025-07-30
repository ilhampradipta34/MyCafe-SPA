import { Navigate } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { useAuth } from "../context/useAuth";
import { Outlet } from "react-router";

export default function PublicOnlyRoute() {
  const { session, role, loading } = useAuth();

  if (loading || (session && !role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (session) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === "kasir") {
      return <Navigate to="/kasir/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
