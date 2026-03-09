import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "@/features/shared/components/layout/Sidebar";
import { getUserInfo } from "@/features/shared/services/secureTokenManager";
import { usePageTitle } from "@/features/shared/hooks";
import { LoadingProvider } from "@/features/shared/context/LoadingContext";

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

          {/* Header */}
          <header className="h-16 flex items-center justify-between px-8 bg-white border-b shadow-sm flex-shrink-0">

            <h1 className="text-lg font-semibold text-gray-800 capitalize">
              {user.role} Panel
            </h1>

            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500">
                Welcome, {user.fullName}
              </span>
            </div>

          </header>

          {/* Page Content */}
          <main className="flex-1 bg-gray-50 p-4 overflow-visible">
            <Outlet />
          </main>

        </div>

      </div>

    </LoadingProvider>

  );
}