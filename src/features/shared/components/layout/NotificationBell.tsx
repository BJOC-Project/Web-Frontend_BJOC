import { Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/features/shared/services";
import { groupNotifications } from "@/lib/groupNotifications";
import { getUserInfo } from "@/features/shared/services/secureTokenManager";

export default function NotificationBell({ disabled = false }: { disabled?: boolean }) {

    const user = getUserInfo();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    const bellRef = useRef<HTMLDivElement>(null);

    const grouped = groupNotifications(notifications);

    const unread = notifications.filter(n => !n.is_read).length;

    /* -----------------------
       LOAD NOTIFICATIONS
    ------------------------ */

    useEffect(() => {

        async function loadNotifications() {

            try {
                const data = await notificationService.getNotifications(user?.role ?? "admin");
                setNotifications(data ?? []);
            } catch (err) {
                console.error(err);
            }

        }
        loadNotifications();
    }, []);

    /* -----------------------
       CLOSE ON OUTSIDE CLICK
    ------------------------ */

    useEffect(() => {

        function handleClickOutside(event: MouseEvent) {
            if (
                bellRef.current &&
                !bellRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /* -----------------------
       TOGGLE BELL
    ------------------------ */

    function toggleBell() {
        if (disabled) return;
        setOpen(!open);
    }

    return (

        <div
            ref={bellRef}
            className={`relative ${disabled ? "opacity-40 pointer-events-none" : ""}`}
        >

            <button onClick={toggleBell}>

                <Bell className="size-5 text-gray-700" />

                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                        {unread}
                    </span>
                )}

            </button>

            {open && (

                <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border z-50 transition-opacity duration-150">

                    <div className="p-3 border-b font-semibold">
                        Notifications
                    </div>

                    <div className="max-h-96 overflow-y-auto">

                        {notifications.length === 0 && (
                            <div className="p-4 text-sm text-gray-500">
                                No notifications
                            </div>
                        )}

                        {Object.entries(grouped).map(([label, items]: any) => (

                            <div key={label}>

                                <div className="px-3 py-1 text-xs font-semibold text-gray-400">
                                    {label}
                                </div>

                                {items.map((n: any) => (

                                    <div
                                        key={n.id}
                                        className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                                    >

                                        <p className="text-sm font-medium">
                                            {n.title}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {n.message}
                                        </p>

                                    </div>

                                ))}

                            </div>

                        ))}

                    </div>

                    <div className="p-3 border-t text-center">

                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate(`/${user?.role}/notifications`);
                            }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            View All
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}