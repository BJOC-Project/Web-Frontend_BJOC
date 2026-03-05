import { useEffect, useState } from "react";
import { operatorService } from "./services/operatorService";

type Vehicle = {
  id: string;
  plate_number: string;
  driver_name?: string;
  route?: string;
  status: "Driving" | "Standby" | "Offline";
  load: number;
  updated_at: string;
};
export default OperatorDriversVehicles;
export function OperatorDriversVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [routeFilter, setRouteFilter] = useState("All");

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    const data = await operatorService.getVehicles();
    setVehicles(data);
  }

  const filteredVehicles = vehicles.filter((v) => {
    return (
      (statusFilter === "All" || v.status === statusFilter) &&
      (routeFilter === "All" || v.route === routeFilter) &&
      (v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
        v.driver_name?.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <h1 className="text-xl font-semibold">Vehicles & Drivers</h1>

      {/* Filters */}
      <div className="flex gap-4 items-center">

        <input
          placeholder="Search Vehicle ID / Plate / Driver"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-80"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option>All</option>
          <option>Driving</option>
          <option>Standby</option>
          <option>Offline</option>
        </select>

        <select
          value={routeFilter}
          onChange={(e) => setRouteFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option>All</option>
          <option>Route 1</option>
          <option>Route 2</option>
        </select>

      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Vehicle
        </button>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Vehicle ID</th>
              <th className="p-3">Plate Number</th>
              <th className="p-3">Driver Name</th>
              <th className="p-3">Route</th>
              <th className="p-3">Status</th>
              <th className="p-3">Current Load</th>
              <th className="p-3">Last Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredVehicles.map((v) => (
              <tr key={v.id} className="border-t">

                <td className="p-3">{v.id}</td>
                <td className="p-3">{v.plate_number}</td>
                <td className="p-3">{v.driver_name ?? "-"}</td>
                <td className="p-3">{v.route ?? "-"}</td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs
                      ${
                        v.status === "Driving"
                          ? "bg-green-600"
                          : v.status === "Standby"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                  >
                    {v.status}
                  </span>
                </td>

                <td className="p-3">{v.load}%</td>

                <td className="p-3">
                  {new Date(v.updated_at).toLocaleString()}
                </td>

                <td className="p-3 flex gap-2">

                  <button className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                    Edit
                  </button>

                  <button className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    Assign
                  </button>

                  <button className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                    Delete
                  </button>

                </td>

              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}