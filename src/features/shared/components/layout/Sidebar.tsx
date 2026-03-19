import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Map,
  Bell,
  BarChart3,
  Settings,
  Route,
  Truck,
  Navigation,
  FileText,
  Car,
  LogOut
} from "lucide-react";

import { clearAuth } from "@/features/shared/services/secureTokenManager";

type Role = "admin" | "operator";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {

  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  const linkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm
     ${isActive
      ? "bg-white text-black font-semibold"
      : "text-white hover:bg-green-900"
    }`;

  const operatorNav = [
    { label: "Dashboard", path: "/operator/dashboard", icon: <LayoutDashboard size={18} /> },
    { label: "Manage Drivers & Vehicles", path: "/operator/drivers-vehicles", icon: <Car size={18} /> },
    { label: "Manage Routes", path: "/operator/routes", icon: <Map size={18} /> },
    { label: "Reports & Analytics", path: "/operator/reports", icon: <BarChart3 size={18} /> },
    { label: "Notifications Management", path: "/operator/notifications", icon: <Bell size={18} /> },
  ];

  const adminNav = [
    { label: "Dashboard Overview", path: "/admin/dashboard", icon: <LayoutDashboard size={16} /> },
    { label: "Route & Stop Management", path: "/admin/routes-stops", icon: <Route size={16} /> },
    { label: "Driver & Vehicle Oversight", path: "/admin/drivers-vehicles", icon: <Truck size={16} /> },
    { label: "Trips / Operation", path: "/admin/trips", icon: <Navigation size={16} /> },
    { label: "Reports & History", path: "/admin/reports-history", icon: <BarChart3 size={16} /> },
    { label: "User Management", path: "/admin/users", icon: <Users size={16} /> },
    { label: "System Logs", path: "/admin/logs", icon: <FileText size={16} /> },
    { label: "System Settings", path: "/admin/settings", icon: <Settings size={16} /> },
  ];

  const navItems = role === "admin" ? adminNav : operatorNav;
  const title = role === "admin" ? "BJOC Admin" : "BJOC Operator";

  return (
    <aside
      style={{
        width: "270px",
        backgroundColor: "#104027",
        color: "white",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        textAlign: "center",
        paddingTop: "20px",
        paddingBottom: "20px"
      }}
    >
      <h2 style={{ marginBottom: "20px", fontSize: "18px" }}>
        {title}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkStyle}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-4 border-t border-green-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-orange-300 hover:bg-orange-500/20 hover:text-orange-200 transition text-sm"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>

    </aside>
  );
}