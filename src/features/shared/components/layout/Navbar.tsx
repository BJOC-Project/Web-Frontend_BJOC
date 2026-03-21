import { MessageSquare } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthSession } from "@/features/pages/auth";
import NotificationBell from "./NotificationBell";
import Alert from "./Alert";

export default function Navbar() {
  const { user } = useAuthSession();
  const location = useLocation();

  const [openMessages, setOpenMessages] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const isNotificationPage = location.pathname.endsWith("/notifications");
  const isAlertPage = location.pathname.endsWith("/alert");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setOpenMessages(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="h-16 flex items-center justify-between px-8 bg-gray-50 border-b shadow-sm">
      <div />

      <div className="flex items-center gap-6">
        <div className="relative" ref={messageRef}>
          <button onClick={() => setOpenMessages((current) => !current)}>
            <MessageSquare className="size-5 text-gray-700" />
          </button>

          {openMessages && (
            <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border z-50">
              <div className="p-3 border-b font-semibold">Messages</div>
              <div className="p-4 text-sm text-gray-500">No messages yet</div>
            </div>
          )}
        </div>

        <Alert disabled={isAlertPage} />
        <NotificationBell disabled={isNotificationPage} />

        <span className="text-sm text-gray-600">Welcome, {user?.fullName ?? "User"}</span>
      </div>
    </nav>
  );
}
