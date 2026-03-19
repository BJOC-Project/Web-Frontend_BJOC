import { useEffect, useState } from "react";
import { activityLogsService } from "./services/activityLogsService";

import {
  ShieldCheck,
  Trash2,
  UserPlus,
  UserX
} from "lucide-react";

type ActivityLog = {
  id: string;
  action: string;
  description: string;
  created_at: string;
};

export function AdminActivityLogsPage() {

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {

      const data = await activityLogsService.getLogs();
      setLogs(data);

    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getActionStyle = (action: string) => {

    switch (action) {

      case "CREATE_USER":
        return {
          color: "bg-green-100 text-green-700",
          icon: <UserPlus size={16}/>
        };

      case "DELETE_USER":
        return {
          color: "bg-red-100 text-red-700",
          icon: <Trash2 size={16}/>
        };

      case "SUSPEND_USER":
        return {
          color: "bg-yellow-100 text-yellow-700",
          icon: <UserX size={16}/>
        };

      default:
        return {
          color: "bg-gray-100 text-gray-700",
          icon: <ShieldCheck size={16}/>
        };

    }

  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Loading activity logs...
        </p>
      </div>
    );
  }

  return (

    <div className="p-6 space-y-4">

      <div>
        <h1 className="text-xl font-semibold">
          System Activity Logs
        </h1>
        <p className="text-sm text-gray-500">
          Track administrative actions performed in the system.
        </p>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 border-b">

            <tr className="text-left">

              <th className="p-3">Action</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date</th>

            </tr>

          </thead>

          <tbody>

            {logs.map((log) => {

              const style = getActionStyle(log.action);

              return (

                <tr
                  key={log.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-3">

                    <span
                      className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium ${style.color}`}
                    >
                      {style.icon}
                      {log.action}
                    </span>

                  </td>

                  <td className="p-3 text-gray-700">
                    {log.description}
                  </td>

                  <td className="p-3 text-gray-500">

                    {new Date(log.created_at).toLocaleString()}

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>

      </div>

    </div>

  );

}