import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import OperatorDashboard from "@/features/pages/Operator/operator_dashboard";
import StopMap from "./features/pages/Operator/operator_manageroutes";
import ProtectedRoute from "@/features/shared/ProtectedRoute";
import MainLayout from "@/features/shared/components/layout/MainLayout";
import LandingPage from "@/features/pages/Landing/LandingPage";
import Jeeps from "./features/pages/Operator/Jeeps";

const router = createBrowserRouter([
  {
    path: "/",
    element:<LandingPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "operator",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <OperatorDashboard/> },
              { path: "drivers-vehicles", element: <Jeeps/> },
              { path: "routes", element: <StopMap/> },
              { path: "reports", element: <div>Reports & Analytics</div> },
              { path: "notifications", element: <div>Notifications Management</div> },
            ],
          },
          {
            path: "admin",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <div>Admin Dashboard</div> },
              { path: "users", element: <div>User Management</div> },
              { path: "operators", element: <div>Operator Management</div> },
              { path: "drivers-vehicles", element: <div>Driver & Vehicle Oversight</div> },
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