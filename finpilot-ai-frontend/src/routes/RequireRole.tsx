import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { homeRouteForRole } from "../utils/roles";
import type { Role } from "../types/auth";

export function RequireRole({ role }: { role: Role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
}
