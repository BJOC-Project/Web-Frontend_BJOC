import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { OperatorDashboard, OperatorManageRoutes2, OperatorDriversVehicles } from "@/features/pages/Operator";
import { AdminDashboard, AdminPassengerManagement, AdminDriverVehicleOversight, AdminRouteStopManagement, AdminTrips } from "@/features/pages/Admin"
import ProtectedRoute from "@/features/shared/ProtectedRoute";
import MainLayout from "@/features/shared/components/layout/MainLayout";
import { LoginPage } from "@/features/pages/auth/login/LoginPage";
import { AlertHistoryPage, NotificationHistoryPage } from "@/features/pages/Notification";
import { GlobalModalProvider } from "@/features/shared/context/GlobalModalContext";
import GlobalModalRenderer from "@/features/shared/components/modal/GlobalModalRenderer";

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
              { path: "notifications", element: <NotificationHistoryPage /> },
              { path: "alert", element: <AlertHistoryPage /> },
            ],
          },

          // ADMIN ROUTES
          {
            path: "admin",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <AdminDashboard /> },
              { path: "routes-stops", element: <AdminRouteStopManagement /> },
              { path: "drivers-vehicles", element: <AdminDriverVehicleOversight /> },
              { path: "trips", element: <AdminTrips /> },
              { path: "alert-notif", element: <div>Alerts & Noticiation</div> },
              { path: "reports-history", element: <div>Reports & History</div> },
              { path: "users", element: <AdminPassengerManagement /> },
              { path: "logs", element: <div>System Logs</div> },
              { path: "settings", element: <div>System Settings</div> },
              { path: "notifications", element: <NotificationHistoryPage /> },
              { path: "alert", element: <AlertHistoryPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <GlobalModalProvider>
      <RouterProvider router={router} />
      <GlobalModalRenderer />
    </GlobalModalProvider>
  );
}