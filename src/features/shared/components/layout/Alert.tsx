import { AlertTriangle } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/features/shared/services/notificationService";
import { getUserInfo } from "@/features/shared/services/secureTokenManager";

export default function Alert({ disabled = false }: { disabled?: boolean }) {

    const user = getUserInfo();
    const navigate = useNavigate();

    const [alerts, setAlerts] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    const alertRef = useRef<HTMLDivElement>(null);

    const alertCount = alerts.filter(a => !a.is_read).length;

    /* -----------------------
       LOAD ALERTS
    ------------------------ */

    useEffect(() => {

        async function loadAlerts() {

            try {

                const data = await notificationService.getNotifications(user?.role ?? "admin");

                const filtered = data.filter(
                    (n: any) => n.severity === "warning" || n.severity === "critical"
                );

                setAlerts(filtered);

            } catch (err) {
                console.error(err);
            }

        }

        loadAlerts();

    }, []);

    /* -----------------------
       CLOSE ON OUTSIDE CLICK
    ------------------------ */

    useEffect(() => {

        function handleClickOutside(event: MouseEvent) {

            if (
                alertRef.current &&
                !alertRef.current.contains(event.target as Node)
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
       TOGGLE ALERT
    ------------------------ */

    function toggleAlert() {

        if (disabled) return;

        setOpen(!open);

    }

    return (

        <div
            ref={alertRef}
            className={`relative ${disabled ? "opacity-40 pointer-events-none" : ""}`}
        >

            <button onClick={toggleAlert}>

                <AlertTriangle className="size-5 text-red-500" />

                {alertCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded">
                        {alertCount}
                    </span>
                )}

            </button>

            {open && (

                <div className="absolute right-0 mt-3 w-80 bg-white shadow-lg rounded-lg border z-50 transition-opacity duration-150">
                    <div className="p-3 border-b font-semibold text-red-600">
                        Alerts
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {alerts.length === 0 && (
                            <div className="p-4 text-sm text-gray-500">
                                No alerts
                            </div>
                        )}
                        {alerts.map(a => (
                            <div
                                key={a.id}
                                className="p-3 border-b hover:bg-gray-50"
                            >
                                <p className="text-sm font-medium text-red-600">
                                    {a.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {a.message}
                                </p>
                            </div>
                        ))}

                    </div>

                    <div className="p-3 border-t text-center">
                        <button
                            onClick={() => {
                                setOpen(false);
                                navigate(`/${user?.role}/alert`);
                            }}
                            className="text-sm text-red-600 hover:underline"
                        >
                            View Alerts
                        </button>

                    </div>

                </div>

            )}

        </div>

    );

}