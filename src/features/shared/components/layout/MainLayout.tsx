import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "@/features/shared/components/layout/Sidebar";

type Role = "operator" | "admin";

type User = {
  name: string;
  role: Role;
};

export default function MainLayout() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
      
      {/* ===== SIDEBAR ===== */}
      <Sidebar role={user.role} />

      {/* ===== RIGHT SIDE ===== */}
      <div className="flex-1 flex flex-col h-full">

        {/* ===== TOPBAR ===== */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b shadow-sm flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-800 capitalize">
            {user.role} Panel
          </h1>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-500">
              Welcome, {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* ===== CONTENT ===== */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}