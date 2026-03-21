import { useEffect, useState } from "react";
import { notificationService } from "@/features/shared/services/notificationService";
import { groupNotifications } from "@/lib/groupNotifications";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function load() {
      const data = await notificationService.getNotifications("admin");
      setNotifications(Array.isArray(data) ? data : []);
    }

    void load();
  }, []);

  const grouped = groupNotifications(notifications) as Record<string, NotificationItem[]>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Notification History</h1>

      {Object.entries(grouped).map(([label, items]) => (
        <div key={label} className="mb-6">
          <div className="text-sm font-semibold text-gray-500 mb-2">{label}</div>

          <div className="bg-white rounded-lg border">
            {items.map((notification) => (
              <div key={notification.id} className="p-4 border-b last:border-none">
                <p className="font-medium">{notification.title}</p>
                <p className="text-sm text-gray-500">{notification.message}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
