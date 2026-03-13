import { useEffect, useState } from "react";
import { notificationService } from "@/features/shared/services/notificationService";
import { groupNotifications } from "@/lib/groupNotifications";

export function NotificationHistoryPage() {

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {

    async function load() {
      const data = await notificationService.getNotifications("admin");
      setNotifications(data);
    }

    load();

  }, []);

  const grouped = groupNotifications(notifications);

  return (

    <div className="max-w-4xl mx-auto">

      <h1 className="text-xl font-semibold mb-4">
        Notification History
      </h1>

      {Object.entries(grouped).map(([label, items]) => (

        <div key={label} className="mb-6">

          <div className="text-sm font-semibold text-gray-500 mb-2">
            {label}
          </div>

          <div className="bg-white rounded-lg border">

            {items.map((n: any) => (

              <div
                key={n.id}
                className="p-4 border-b last:border-none"
              >

                <p className="font-medium">
                  {n.title}
                </p>

                <p className="text-sm text-gray-500">
                  {n.message}
                </p>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>

  );

}