import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { phNow } from "@/lib/time";
import { tripsService } from "../services/tripsService";

type Props = {
  open: boolean;
  vehicle: any;
  routes: any[];
  onClose: () => void;
  onSuccess: () => void;
};

export function DispatchTripModal({
  open,
  vehicle,
  routes,
  onClose,
  onSuccess
}: Props) {

  const [selectedRoute, setSelectedRoute] = useState("");
  const [departureTime, setDepartureTime] = useState<Date | null>(phNow());

  if (!open || !vehicle) return null;

  const scheduleTrip = async () => {

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

    await tripsService.scheduleTrip({
      vehicle_id: vehicle.id,
      route_id: selectedRoute,
      trip_date: tripDate,
      scheduled_departure_time: scheduledTime
    });

    onSuccess();
    onClose();

  };

  const addMinutes = (m: number) => {

    const d = new Date(phNow().getTime() + m * 60000);
    setDepartureTime(d);

  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg w-[360px] space-y-4">
        <h3 className="font-semibold">
          Schedule Trip - {vehicle.plate_number}
        </h3>
        <div className="text-sm">
          Driver: {vehicle.driver || "Unassigned"}
        </div>

        <div>
          <label className="text-sm block mb-1">
            Route
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">
              Select Route
            </option>

            {routes.map((r: any) => (
              <option key={r.id} value={r.id}>
                {r.start_location} → {r.end_location}
              </option>
            ))}

          </select>
        </div>
        <div>
          <label className="text-sm block mb-1">
            Departure Time
          </label>
          <DatePicker
            selected={departureTime}
            onChange={(date: Date | null) => setDepartureTime(date)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={5}
            dateFormat="h:mm aa"
            minTime={phNow()}
            maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
            className="border rounded px-3 py-2 w-full"
          />
          <div className="flex flex-wrap gap-1 mt-2 text-xs">
            <button onClick={() => addMinutes(0)} className="border px-2 py-1 rounded">
              Now
            </button>
            <button onClick={() => addMinutes(5)} className="border px-2 py-1 rounded">
              +5
            </button>
            <button onClick={() => addMinutes(10)} className="border px-2 py-1 rounded">
              +10
            </button>
            <button onClick={() => addMinutes(20)} className="border px-2 py-1 rounded">
              +20
            </button>
            <button onClick={() => addMinutes(30)} className="border px-2 py-1 rounded">
              +30
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border px-3 py-1 rounded"
          >
            Cancel
          </button>
          <button
            onClick={scheduleTrip}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Schedule Trip
          </button>
        </div>
      </div>
    </div>
  );
}