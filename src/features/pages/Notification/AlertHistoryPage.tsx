import { useEffect, useState } from "react";
import { notificationService } from "@/features/shared/services/notificationService";

export function AlertHistoryPage() {

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {

    async function load() {

      const data = await notificationService.getNotifications("admin");

      const filtered = data.filter(
        (n: any) => n.severity === "warning" || n.severity === "critical"
      );

      setAlerts(filtered);

    }

    load();

  }, []);

  return (

    <div className="max-w-4xl mx-auto">

      <h1 className="text-xl font-semibold mb-4">
        Alert History
      </h1>

      <div className="bg-white border rounded-lg">

        {alerts.map(a => (

          <div
            key={a.id}
            className="p-4 border-b last:border-none"
          >

            <p className="font-medium text-red-600">
              {a.title}
            </p>

            <p className="text-sm text-gray-500">
              {a.message}
            </p>

          </div>

        ))}

      </div>

    </div>

  );

}