import { useEffect, useState } from "react";

import {
  Route,
  Users,
  MapPin,
  Truck
} from "lucide-react";

import { useLoading } from "@/features/shared/context/LoadingContext";
import { adminService } from "./services/adminService";
import SharedMap from "@/features/shared/components/layout/SharedMap";
import { PassengerWaitingTrend } from "./modal/PassengerWaitingTrend";

export function AdminDashboard() {

  const { showLoading, hideLoading } = useLoading();

  const [summary, setSummary] = useState<any>({});
  const [vehicleStatus, setVehicleStatus] = useState<any[]>([]);
  const [driverPerformance, setDriverPerformance] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [appRating, setAppRating] = useState<any>({});
  const [filter, setFilter] = useState("today");

  const [mapVehicles, setMapVehicles] = useState<any[]>([]);



  useEffect(() => {

    loadInitialData();

    const interval = setInterval(() => {
      refreshLiveData();
    }, 5000);

    return () => clearInterval(interval);

  }, [filter]);



  async function loadInitialData() {

    showLoading();

    try {

      await refreshLiveData();

    } catch (err) {

      console.error("Dashboard load error", err);

    } finally {

      hideLoading();

    }

  }



  async function refreshLiveData() {

    try {

      const summaryData = await adminService.getDashboardSummary(filter);
      const vehicleData = await adminService.getVehicleStatus();
      const driverData = await adminService.getDriverPerformance(filter);
      const suggestionData = await adminService.getSuggestions(filter);
      const ratingData = await adminService.getAppRatings(filter);

      setSummary(summaryData ?? {});
      setVehicleStatus(vehicleData ?? []);
      setDriverPerformance(driverData ?? []);
      setSuggestions(suggestionData ?? []);
      setAppRating(ratingData ?? {});

      const activeVehicles = (vehicleData ?? []).filter(
        (v: any) => v.status === "on_trip" || v.status === "pending"
      );

      setMapVehicles(
        activeVehicles.map((v: any) => ({
          vehicle_id: v.vehicle_id ?? "",
          latitude: v.latitude ?? 14.440677,
          longitude: v.longitude ?? 120.960164,
          plate_number: v.plate_number ?? "Unknown",
          driver_name: v.driver_name ?? "No Driver",
          status: v.status
        }))
      );

    } catch (err) {

      console.error("Live refresh error", err);

    }

  }



  return (

    <div className="p-3 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Fleet Operations Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Real-time jeepney monitoring system
          </p>
        </div>

        <select
          className="border rounded px-2 py-1 text-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
        </select>

      </div>
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard title="Trips" value={summary?.trips} icon={<Route size={18} className="text-green-600"/>} />
        <SummaryCard title="Passengers" value={summary?.passengers} icon={<Users size={18} className="text-green-600"/>} />
        <SummaryCard title="Waiting Stops" value={summary?.waitingStops} icon={<MapPin size={18} className="text-green-600"/>} />
        <SummaryCard title="Active Vehicles" value={summary?.activeVehicles} icon={<Truck size={18} className="text-green-600"/>} />
      </div>

      <div>

        <h2 className="text-sm font-semibold mb-2">
          Active Vehicles
        </h2>

        <div className="grid grid-cols-5 gap-3">
          {(vehicleStatus ?? []).map((v: any, i: number) => (
            <VehicleCard key={i} vehicle={v} />
          ))}
        </div>
      </div>

      {/* LIVE MAP */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">
            Live Vehicle Location
          </h2>
          <span className="text-xs text-gray-500">
            {mapVehicles.length} active vehicle{mapVehicles.length !== 1 ? "s" : ""}
          </span>

        </div>

        <div className="h-[420px] rounded-lg overflow-hidden">

          <SharedMap
            stops={[]}
            vehicles={mapVehicles}
            initialCenter={{
              latitude: mapVehicles[0]?.latitude ?? 14.440677,
              longitude: mapVehicles[0]?.longitude ?? 120.960164
            }}
            bearing={100}
            initialZoom={11.5}
          />
        </div>
        {mapVehicles.length === 0 && (

          <p className="text-center text-xs text-gray-400 mt-2">
            No active vehicles right now
          </p>

        )}

      </div>

      <PassengerWaitingTrend />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-2">
            Driver Performance
          </h2>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">

            {driverPerformance.length > 0 ? (
              driverPerformance.map((d: any, i: number) => (
                <DriverRating key={i} driver={d} />
              ))
            ) : (
              <p className="text-xs text-gray-400">
                No driver performance data
              </p>
            )}

          </div>

        </div>



        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3">
            Passenger Feedback
          </h2>

          <p className="text-xs text-gray-500">
            App Rating
          </p>
          <div className="text-yellow-500 text-lg mb-2">

            {"★".repeat(Math.round(appRating?.average || 0))}
            {"☆".repeat(5 - Math.round(appRating?.average || 0))}
          </div>

          <p className="text-xs text-gray-400 mb-3">

            {appRating?.average?.toFixed(1) ?? 0}/5
            ({appRating?.total ?? 0} reviews)

          </p>
          <div className="space-y-2 max-h-[150px] overflow-y-auto">

            {(suggestions ?? []).map((s: any, i: number) => (

              <div
                key={i}
                className="border rounded-lg p-3 text-xs hover:bg-gray-50"
              >
                {s.message}
              </div>

            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


function SummaryCard({ title, value, icon }: any) {

  return (

    <div className="bg-white border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition">

      <div>

        <p className="text-xs text-gray-500">
          {title}
        </p>

        <h2 className="text-2xl font-semibold">
          {value ?? 0}
        </h2>

      </div>

      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
        {icon}
      </div>
    </div>
  )
}


function VehicleCard({ vehicle }: any) {

  const color =
    vehicle.status === "on_trip"
      ? "bg-green-100 text-green-700"
      : vehicle.status === "standby"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-200 text-gray-600";

  return (

    <div className="bg-white border rounded-lg p-3 space-y-1">

      <p className="text-xs font-medium">
        {vehicle?.plate_number ?? "Vehicle"}
      </p>

      <p className="text-[11px] text-gray-500">
        Driver: {vehicle?.driver_name ?? "No Driver"}
      </p>

      <span className={`text-[10px] px-2 py-1 rounded-full ${color}`}>
        {vehicle?.status}
      </span>

    </div>
  )
}


function DriverRating({ driver }: any) {

  const stars = Math.round(driver?.rating ?? 0);

  return (

    <div className="flex justify-between items-center text-xs border-b pb-2">

      <div>

        <p className="font-medium">
          {driver?.driver || driver?.driver_id || "Unknown Driver"}
        </p>

        <p className="text-gray-400 text-[11px]">
          {driver?.trips ?? 0} trips
        </p>

      </div>

      <div className="text-yellow-500">

        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}

        <span className="text-gray-400 ml-1">
          {driver?.rating?.toFixed(1) ?? "0.0"}
        </span>

      </div>

    </div>

  )

}