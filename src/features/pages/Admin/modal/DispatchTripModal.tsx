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

  const [selectedRoute,setSelectedRoute] = useState("");
  const [departureTime,setDepartureTime] = useState<Date | null>(phNow());

  if(!open || !vehicle) return null;

  const startTrip = async()=>{

    /* -------------------------
       PREVENT DISPATCH IF BUSY
    --------------------------*/

    if(vehicle.waiting || vehicle.ongoing){
      alert("This vehicle already has an active trip.");
      return;
    }

    if(!vehicle.driver){
      alert("Vehicle has no assigned driver.");
      return;
    }

    if(!selectedRoute){
      alert("Please select route.");
      return;
    }

    let scheduledTime;

    if(departureTime){

      if(departureTime < phNow()){
        alert("Departure cannot be earlier than current time.");
        return;
      }

      scheduledTime = departureTime.toISOString();

    }

    await tripsService.startTrip({
      vehicle_id: vehicle.id,
      route_id: selectedRoute,
      scheduled_departure_time: scheduledTime
    });

    onSuccess();
    onClose();

  };

  const addMinutes = (m:number)=>{

    const d = new Date(phNow().getTime() + m*60000);
    setDepartureTime(d);

  };

  return(

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">

      <div className="bg-white p-6 rounded-lg w-[360px] space-y-4">

        <h3 className="font-semibold">
          Dispatch Vehicle - {vehicle.plate_number}
        </h3>

        <div className="text-sm">
          Driver: {vehicle.driver || "Unassigned"}
        </div>

        {/* ROUTE */}

        <div>

          <label className="text-sm block mb-1">
            Route
          </label>

          <select
            value={selectedRoute}
            onChange={(e)=>setSelectedRoute(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >

            <option value="">
              Select Route
            </option>

            {routes.map((r:any)=>(
              <option key={r.id} value={r.id}>
                {r.route_name}
              </option>
            ))}

          </select>

        </div>

        {/* TIME */}

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
            maxTime={new Date(new Date().setHours(23,59,59,999))}
            className="border rounded px-3 py-2 w-full"
          />

          <div className="flex flex-wrap gap-1 mt-2 text-xs">

            <button onClick={()=>setDepartureTime(phNow())} className="border px-2 py-1 rounded">Now</button>
            <button onClick={()=>addMinutes(5)} className="border px-2 py-1 rounded">+5</button>
            <button onClick={()=>addMinutes(10)} className="border px-2 py-1 rounded">+10</button>
            <button onClick={()=>addMinutes(20)} className="border px-2 py-1 rounded">+20</button>
            <button onClick={()=>addMinutes(30)} className="border px-2 py-1 rounded">+30</button>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="border px-3 py-1 rounded"
          >
            Cancel
          </button>

          <button
            onClick={startTrip}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Start Trip
          </button>

        </div>

      </div>

    </div>

  );

}