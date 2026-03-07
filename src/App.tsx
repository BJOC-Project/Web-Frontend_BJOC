import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { OperatorDashboard, OperatorManageRoutes2, OperatorDriversVehicles } from "@/features/pages/Operator";
import { AdminDashboard, AdminDriverManagement, AdminPassengerManagement, AdminDriverVehicleOversight } from "@/features/pages/Admin"
import ProtectedRoute from "@/features/shared/ProtectedRoute";
import MainLayout from "@/features/shared/components/layout/MainLayout";
import { LoginPage } from "@/features/pages/auth/login/LoginPage";

const router = createBrowserRouter([
  
  // LOGIN
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Redirect root to login
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // PROTECTED ROUTES
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [

          // OPERATOR ROUTES
          {
            path: "operator",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <OperatorDashboard /> },
              { path: "drivers-vehicles", element: <OperatorDriversVehicles /> },
              { path: "routes", element: <OperatorManageRoutes2 /> },
              { path: "reports", element: <div>Reports & Analytics</div> },
              { path: "notifications", element: <div>Notifications Management</div> },
            ],
          },

          // ADMIN ROUTES
          {
            path: "admin",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <AdminDashboard/> },
              { path: "users", element: <AdminPassengerManagement/> },
              // { path: "operators", element: <AdminDriverManagement/> },
              { path: "drivers-vehicles", element: <AdminDriverVehicleOversight/> },
              { path: "routes", element: <div>Route & Stop Management</div> },
              { path: "reports", element: <div>System Reports</div> },
              { path: "analytics", element: <div>System Analytics</div> },
              { path: "notifications", element: <div>Notification Control Center</div> },
              { path: "settings", element: <div>System Settings</div> },
              { path: "logs", element: <div>Audit Logs</div> },
            ],
          },

        ],
      },
    ],
  },

]);

export default function App() {
  return <RouterProvider router={router} />;
}