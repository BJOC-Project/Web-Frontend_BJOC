import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserInfo } from "@/features/shared/services/secureTokenManager";

type Role = "operator" | "admin";


export default function ProtectedRoute() {
  const location = useLocation();
  const user = getUserInfo();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const roleAccess: Record<Role, string[]> = {
    operator: ["/operator"],
    admin: ["/admin"],
  };

  const allowedPaths = roleAccess[user.role];

  // EXTRA SAFETY (prevents crash forever)
  if (!allowedPaths) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = allowedPaths.some((allowedPath) =>
    location.pathname.startsWith(allowedPath)
  );

  if (!hasAccess) {
    return <Navigate to={`${allowedPaths[0]}/dashboard`} replace />;
  }

  return <Outlet />;
}