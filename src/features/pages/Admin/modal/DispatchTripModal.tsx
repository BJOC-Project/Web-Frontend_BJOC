import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { phNow } from "@/lib/time";
import {
  calculateRouteFare,
  formatRouteFare,
  resolveRouteEndpoints,
} from "@/features/shared/utils/tripSchedulePreview";
import { stopsService } from "../services/stopsService";
import { tripsService } from "../services/tripsService";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  open: boolean;
  routes: any[];
  vehicle: any;
};

export function DispatchTripModal({
  open,
  vehicle,
  routes,
  onClose,
  onSuccess,
}: Props) {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [departureTime, setDepartureTime] = useState<Date | null>(phNow());
  const [routeStops, setRouteStops] = useState<any[]>([]);
  const [farePreview, setFarePreview] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedRoute("");
    setDepartureTime(phNow());
    setRouteStops([]);
    setFarePreview(null);
    setIsPreviewLoading(false);
  }, [open, vehicle?.id]);

  useEffect(() => {
    if (!open || !selectedRoute) {
      setRouteStops([]);
      setFarePreview(null);
      setIsPreviewLoading(false);
      return;
    }

    let active = true;

    setIsPreviewLoading(true);

    void stopsService
      .getStopsByRoute(selectedRoute)
      .then((stops) => {
        if (!active) {
          return;
        }

        setRouteStops(stops);
        setFarePreview(calculateRouteFare(stops));
      })
      .catch((error) => {
        console.error("Route preview load error:", error);

        if (!active) {
          return;
        }

        setRouteStops([]);
        setFarePreview(null);
      })
      .finally(() => {
        if (active) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, selectedRoute]);

  const selectedRouteRecord = routes.find((route: any) => route.id === selectedRoute) ?? null;
  const routePreview = resolveRouteEndpoints(selectedRouteRecord, routeStops);
  const departurePreview = departureTime
    ? departureTime.toLocaleString("en-PH", {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
      })
    : "Select departure time";
  const fareLabel = selectedRoute
    ? isPreviewLoading
      ? "Calculating..."
      : formatRouteFare(farePreview)
    : "Select route first";

  if (!open || !vehicle) {
    return null;
  }

  async function scheduleTrip() {
    if (vehicle.scheduled || vehicle.ongoing) {
      alert("This vehicle already has a scheduled or active trip.");
      return;
    }
    if (!vehicle.driver) {
      alert("Vehicle has no assigned driver.");
      return;
    }
    if (!selectedRoute) {
      alert("Please select route.");
      return;
    }
    if (!departureTime) {
      alert("Please select departure time.");
      return;
    }
    if (departureTime < phNow()) {
      alert("Departure cannot be earlier than current time.");
      return;
    }

    const scheduledTime = departureTime.toISOString();
    const tripDate = scheduledTime.split("T")[0];

    try {
      await tripsService.scheduleTrip({
        route_id: selectedRoute,
        scheduled_departure_time: scheduledTime,
        trip_date: tripDate,
        vehicle_id: vehicle.id,
      });

      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
        alert(error.response.data.message);
        return;
      }

      alert("Unable to schedule the trip right now.");
    }
  }

  function addMinutes(minutes: number) {
    setDepartureTime(new Date(phNow().getTime() + minutes * 60000));
  }

  function getRouteLabel(route: any) {
    return route.route_name || `${route.start_location || "Unknown"} -> ${route.end_location || "Unknown"}`;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-slate-900">Schedule Trip</h3>
          <p className="mt-1 text-sm text-slate-500">
            {vehicle.plate_number} with {vehicle.driver || "Unassigned"}
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Route</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              onChange={(event) => setSelectedRoute(event.target.value)}
              value={selectedRoute}
            >
              <option value="">Select Route</option>
              {routes.map((route: any) => (
                <option key={route.id} value={route.id}>
                  {getRouteLabel(route)}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PreviewField
              label="Pickup"
              value={selectedRoute ? routePreview.pickup : "Auto based on route"}
            />
            <PreviewField
              label="Drop-off"
              value={selectedRoute ? routePreview.dropOff : "Auto based on route"}
            />
            <PreviewField
              label="Time"
              value={departurePreview}
            />
            <PreviewField
              label="Fare"
              value={fareLabel}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Departure time</span>
            <DatePicker
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
              dateFormat="h:mm aa"
              maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
              minTime={phNow()}
              onChange={(date: Date | null) => setDepartureTime(date)}
              selected={departureTime}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={5}
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-600">Quick set</p>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 10, 20, 30].map((minutes) => (
                <button
                  key={minutes}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                  onClick={() => addMinutes(minutes)}
                  type="button"
                >
                  {minutes === 0 ? "Now" : `+${minutes}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            onClick={() => void scheduleTrip()}
            type="button"
          >
            Schedule Trip
          </button>
        </div>
      </div>
    </div>
  );
}

type PreviewFieldProps = {
  label: string;
  value: string;
};

function PreviewField({ label, value }: PreviewFieldProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
