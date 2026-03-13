import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "@/features/shared/components/layout/Sidebar";
import { getUserInfo } from "@/features/shared/services/secureTokenManager";
import { usePageTitle } from "@/features/shared/hooks";
import { LoadingProvider } from "@/features/shared/context/LoadingContext";
import Navbar from "@/features/shared/components/layout/Navbar";

export default function MainLayout() {

  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserInfo();

  /* ---------------------------
     Dynamic Page Title
  ---------------------------- */

  let title = "BJOC System";

  if (location.pathname.startsWith("/admin")) {
    title = "Admin";
  } else if (location.pathname.startsWith("/operator")) {
    title = "Operator";
  }

  usePageTitle(title);

  /* ---------------------------
     Auth Guard
  ---------------------------- */

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (

    <LoadingProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-100">

        {/* Sidebar */}
        <Sidebar role={user.role} />

        <div className="flex-1 flex flex-col h-full">

          <Navbar />
          {/* Page Content */}
          <main className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            <Outlet />
          </main>

        </div>

      </div>
    </LoadingProvider>

  );
}