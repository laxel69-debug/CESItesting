import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { getRoleHome } from "./roleRoutes.jx";

export default function RequireAuth({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Prevent redirect flicker while loading user from localStorage
  if (loading) return <div>Loading...</div>;

  // Not logged in -> go login, remember where they tried to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but role not allowed for this route
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <Outlet />;
}
