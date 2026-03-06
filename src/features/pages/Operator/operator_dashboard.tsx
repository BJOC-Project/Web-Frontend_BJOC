import { useEffect, useState } from "react";
import { operatorService } from "./services/operatorService";
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
import SharedMap from "@/features/shared/components/layout/SharedMap";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];

export function OperatorDashboard() {

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);
  const [fleetSummary, setFleetSummary] = useState<any>({});
  const [stopStats, setStopStats] = useState<any[]>([]);
  const [loadSummary, setLoadSummary] = useState<any[]>([]);
  const [activeStops, setActiveStops] = useState<any[]>([]);
  const [overall, setOverall] = useState<any>({});

  const defaultCenter = {
    latitude: 14.438853366233266,
    longitude: 120.9607039176618,
  };

  useEffect(() => {
    loadData();

    // Refresh vehicle locations every 3 seconds
    const interval = setInterval(loadVehicleLocations, 3000);

    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {

      const fleet = await operatorService.getFleetSummary();
      setFleetSummary(fleet);

      const jeeps = await operatorService.getJeepneys();
      setVehicles(jeeps);

      const stops = await operatorService.getStopPopularity();
      setStopStats(stops);

      const loads = await operatorService.getLoadSummary();
      setLoadSummary(loads);

      const active = await operatorService.getActiveStops();
      setActiveStops(active);

      const overall = await operatorService.getOverallSummary();
      setOverall(overall);

      await loadVehicleLocations();

    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  }

  async function loadVehicleLocations() {
    try {
      const locations = await operatorService.getVehicleLocations();
      setVehicleLocations(locations);
    } catch (error) {
      console.error("Vehicle location load error:", error);
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Overall Summary */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard title="Trips Today" value={overall.trips_today} />
        <SummaryCard title="Passengers Today" value={overall.passengers_today} />
        <SummaryCard title="Average Load" value={`${overall.avg_load}%`} />
        <SummaryCard title="Top Route" value={overall.top_route} />
      </div>

      {/* Fleet Overview Map */}
      <div className="bg-white shadow rounded-xl p-4 h-[400px]">
        <h2 className="text-lg font-semibold mb-3">Fleet Overview</h2>

        <div className="w-full h-[330px] rounded overflow-hidden">
          <SharedMap
            initialCenter={defaultCenter}
            bearing={100}
            initialZoom={11.5}
            vehicles={vehicleLocations}
          />
        </div>
      </div>

      {/* Active Vehicle Summary */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard title="Total Vehicles" value={fleetSummary.total} />
        <SummaryCard title="Active Vehicles" value={fleetSummary.active} />
        <SummaryCard title="Standby Vehicles" value={fleetSummary.standby} />
        <SummaryCard title="Offline Vehicles" value={fleetSummary.offline} />
      </div>

      {/* Jeepneys Table */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Jeepneys</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th>Status</th>
              <th>Plate</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Load</th>
              <th>ETA</th>
              <th>State</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v, i) => (
              <tr key={i} className="border-b">
                <td>
                  <span
                    className={`h-3 w-3 rounded-full inline-block ${
                      v.is_online ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </td>
                <td>{v.plate}</td>
                <td>{v.driver}</td>
                <td>{v.route}</td>
                <td>{v.load}%</td>
                <td>{v.eta ?? "-"}</td>
                <td>{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Passenger Selected Stops */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">
            Passenger Selected Stops
          </h2>

          <div style={{ width: 220, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stopStats}
                  dataKey="percentage"
                  nameKey="stop"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {stopStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Load Summary */}
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">
            Load Summary (Daily / Monthly)
          </h2>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={loadSummary}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="load" barSize={20} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Active Stops */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-4">Active Stops</h2>

        <div className="grid grid-cols-3 gap-4">
          {activeStops.map((stop, i) => (
            <div
              key={i}
              className="p-3 bg-gray-100 rounded-lg flex justify-between"
            >
              <span>{stop.stop}</span>
              <span className="font-semibold">{stop.waiting}</span>
            </div>
          ))}
        </div>
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