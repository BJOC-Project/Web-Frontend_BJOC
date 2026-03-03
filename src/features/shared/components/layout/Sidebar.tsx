import { NavLink } from "react-router-dom";

type Role = "admin" | "operator";

interface SidebarProps {
  role: Role;
}

export default function Sidebar({ role }: SidebarProps) {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    padding: "12px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "white",
    backgroundColor: isActive ? "#2563eb" : "transparent",
  });

  const operatorNav = [
    { label: "Dashboard", path: "/operator/dashboard" },
    { label: "Manage Drivers & Vehicles", path: "/operator/drivers-vehicles" },
    { label: "Manage Routes", path: "/operator/routes" },
    { label: "Reports & Analytics", path: "/operator/reports" },
    { label: "Notifications Management", path: "/operator/notifications" },
  ];

  const adminNav = [
    { label: "Dashboard Overview", path: "/admin/dashboard" },
    { label: "User Management", path: "/admin/users" },
    { label: "Operator Management", path: "/admin/operators" },
    { label: "Driver & Vehicle Oversight", path: "/admin/drivers-vehicles" },
    { label: "Route & Stop Management", path: "/admin/routes" },
    { label: "System Reports", path: "/admin/reports" },
    { label: "System Analytics", path: "/admin/analytics" },
    { label: "Notification Control Center", path: "/admin/notifications" },
    { label: "System Settings", path: "/admin/settings" },
    { label: "Audit Logs", path: "/admin/logs" },
  ];

  const navItems = role === "admin" ? adminNav : operatorNav;
  const title = role === "admin" ? "BJOC Admin" : "BJOC Operator";

  return (
    <aside
      style={{
        width: "260px",
        backgroundColor: "#111827",
        color: "white",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>{title}</h2>

      {navItems.map((item) => (
        <NavLink key={item.path} to={item.path} style={linkStyle}>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}