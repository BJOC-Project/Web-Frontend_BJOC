import { Navigate, Outlet, useLocation } from "react-router-dom";

type Role = "operator" | "admin";

type User = {
  id: number;
  name: string;
  role: Role;
};

export default function ProtectedRoute() {
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

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