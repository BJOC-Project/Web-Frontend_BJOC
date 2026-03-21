import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/features/shared/components/layout/Sidebar";
import { usePageTitle } from "@/features/shared/hooks";
import { LoadingProvider } from "@/features/shared/context/LoadingContext";
import Navbar from "@/features/shared/components/layout/Navbar";
import { useAuthSession } from "@/features/pages/auth";
import { AuthSkeleton } from "@/features/pages/auth/pages";

export default function MainLayout() {
  const location = useLocation();
  const { user, isBootstrapping } = useAuthSession();

  let title = "BJOC System";

  if (location.pathname.startsWith("/admin")) {
    title = "Admin";
  } else if (location.pathname.startsWith("/staff")) {
    title = "Staff";
  }

  usePageTitle(title);

  if (isBootstrapping) {
    return <AuthSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <LoadingProvider>
      <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
        <Sidebar role={user.role} />

        <div className="flex-1 flex flex-col h-full">
          <Navbar />
          <main className="flex-1 bg-gray-50 p-4 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </LoadingProvider>
  );
}
