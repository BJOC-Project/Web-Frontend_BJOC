import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  OperatorDashboard,
  OperatorManageRoutes2,
  OperatorDriversVehicles,
} from "@/features/pages/Operator";
import {
  AdminDashboard,
  AdminUserManagement,
  AdminActivityLogsPage,
  AdminDriverVehicleOversight,
  AdminRouteStopManagement,
  AdminTrips,
  AdminReportsHistory,
} from "@/features/pages/Admin";
import ProtectedRoute from "@/features/shared/ProtectedRoute";
import MainLayout from "@/features/shared/components/layout/MainLayout";
import { AuthProvider, LoginPage } from "@/features/pages/auth";
import { AlertHistoryPage, NotificationHistoryPage } from "@/features/pages/Notification";
import { GlobalModalProvider } from "@/features/shared/context/GlobalModalContext";
import GlobalModalRenderer from "@/features/shared/components/modal/GlobalModalRenderer";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/operator/*",
    element: <Navigate to="/staff/dashboard" replace />,
  },
  {
    element: <ProtectedRoute allowedRoles={["staff"]} />,
    children: [
      {
        path: "/staff",
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <OperatorDashboard /> },
          { path: "drivers-vehicles", element: <OperatorDriversVehicles /> },
          { path: "routes", element: <OperatorManageRoutes2 /> },
          { path: "reports", element: <div>Reports &amp; Analytics</div> },
          { path: "notifications", element: <NotificationHistoryPage /> },
          { path: "alert", element: <AlertHistoryPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        path: "/admin",
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "routes-stops", element: <AdminRouteStopManagement /> },
          { path: "drivers-vehicles", element: <AdminDriverVehicleOversight /> },
          { path: "trips", element: <AdminTrips /> },
          { path: "reports-history", element: <AdminReportsHistory /> },
          { path: "users", element: <AdminUserManagement /> },
          { path: "logs", element: <AdminActivityLogsPage /> },
          { path: "settings", element: <div>System Settings</div> },
          { path: "notifications", element: <NotificationHistoryPage /> },
          { path: "alert", element: <AlertHistoryPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <GlobalModalProvider>
        <RouterProvider router={router} />
        <GlobalModalRenderer />
      </GlobalModalProvider>
    </AuthProvider>
  );
}
