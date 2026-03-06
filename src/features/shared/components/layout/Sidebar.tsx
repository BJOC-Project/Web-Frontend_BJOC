import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Map,
  Bell,
  BarChart3,
  Settings,
  ClipboardList,
  Car,
  UserCog
} from "lucide-react";

type Role = "admin" | "operator";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {

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
    { label: "User Management", path: "/admin/users", icon: <Users size={16} /> },
    { label: "Operator Management", path: "/admin/operators", icon: <UserCog size={16} /> },
    { label: "Driver & Vehicle Oversight", path: "/admin/drivers-vehicles", icon: <Car size={16} /> },
    { label: "Route & Stop Management", path: "/admin/routes", icon: <Map size={16} /> },
    { label: "System Reports", path: "/admin/reports", icon: <ClipboardList size={16} /> },
    { label: "System Analytics", path: "/admin/analytics", icon: <BarChart3 size={16} /> },
    { label: "Notification Control Center", path: "/admin/notifications", icon: <Bell size={16} /> },
    { label: "System Settings", path: "/admin/settings", icon: <Settings size={16} /> },
    { label: "Audit Logs", path: "/admin/logs", icon: <ClipboardList size={16 } /> },
  ];

  const navItems = role === "admin" ? adminNav : operatorNav;
  const title = role === "admin" ? "BJOC Admin" : "BJOC Operator";

  return (
    <aside
      style={{
        width: "260px",
        backgroundColor: "#104027",
        color: "white",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <h2 style={{ marginBottom: "20px", fontSize: "18px" }}>{title}</h2>

      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} className={linkStyle}>
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}