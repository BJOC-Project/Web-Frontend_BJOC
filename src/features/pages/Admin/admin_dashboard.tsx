import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { adminService } from "./services/adminService";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];
export default AdminDashboard;
export function AdminDashboard() {

  const [summary, setSummary] = useState<any>({});
  const [operatorStats, setOperatorStats] = useState<any[]>([]);
  const [vehicleStats, setVehicleStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const system = await adminService.getSystemSummary();
    setSummary(system);

    const operators = await adminService.getOperatorStats();
    setOperatorStats(operators);

    const vehicles = await adminService.getVehicleStats();
    setVehicleStats(vehicles);

    const activity = await adminService.getRecentActivity();
    setRecentActivity(activity);
  }

  return (
    <div className="p-6">

      {/* SYSTEM SUMMARY */}
      <div className="grid grid-cols-4 gap-4">

        <SummaryCard title="Total Operators" value={summary.operators} />
        <SummaryCard title="Total Drivers" value={summary.drivers} />
        <SummaryCard title="Total Vehicles" value={summary.vehicles} />
        <SummaryCard title="Total Routes" value={summary.routes} />

      </div>


      <div className="grid grid-cols-2 gap-6">

        {/* OPERATORS PIE CHART */}
        <div className="bg-white shadow rounded-xl p-4">

          <h2 className="text-lg font-semibold mb-4">
            Operator Distribution
          </h2>

          <div style={{ width: 220, height: 220 }}>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={operatorStats}
                  dataKey="count"
                  nameKey="operator"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {operatorStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />

              </PieChart>
            </ResponsiveContainer>

          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-4">

          <h2 className="text-lg font-semibold mb-4">
            Vehicle Status
          </h2>

          <ResponsiveContainer width="100%" height={250}>

            <BarChart data={vehicleStats}>
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" barSize={20} fill="#2563eb" />
            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* RECENT SYSTEM ACTIVITY */}
      <div className="bg-white shadow rounded-xl p-4">

        <h2 className="text-lg font-semibold mb-4">
          Recent System Activity
        </h2>

        <table className="w-full text-sm">

          <thead>
            <tr className="border-b text-left">
              <th className="p-2">User</th>
              <th className="p-2">Action</th>
              <th className="p-2">Details</th>
              <th className="p-2">Time</th>
            </tr>
          </thead>

          <tbody>

            {recentActivity.map((log, i) => (
              <tr key={i} className="border-b">

                <td className="p-2">{log.user}</td>
                <td className="p-2">{log.action}</td>
                <td className="p-2">{log.details}</td>
                <td className="p-2">
                  {new Date(log.created_at).toLocaleString()}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}


function SummaryCard({ title, value }: any) {
  return (
    <div className="bg-white shadow rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-semibold">{value ?? "-"}</h2>
    </div>
  );
}