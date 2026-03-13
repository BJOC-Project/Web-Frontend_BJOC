import type { FC } from "react";

type Vehicle = {
  id: string;
  plate_number: string;
  driver?: string | null;
  capacity?: number;
  trips_today?: number;
  waiting?: boolean;
  ongoing?: boolean;
};

type Props = {
  vehicle: Vehicle;
  onDispatch: () => void;
};

export const FleetVehicleCard: FC<Props> = ({ vehicle, onDispatch }) => {

  const status = vehicle.ongoing
    ? "ongoing"
    : vehicle.waiting
    ? "waiting"
    : "available";

  const disabled = status !== "available";

  return (

    <div
      onClick={() => {
        if (!disabled) onDispatch();
      }}
      className={`p-3 rounded-lg border transition w-full
      ${
        disabled
          ? "bg-gray-100 opacity-60 cursor-not-allowed"
          : "bg-white hover:shadow hover:border-gray-300 cursor-pointer"
      }`}
    >

      {/* HEADER */}

      <div className="flex justify-between items-center mb-2">

        <h3 className="text-sm font-semibold tracking-wide">
          {vehicle.plate_number}
        </h3>

        <span
          className={`text-[10px] px-2 py-[2px] rounded-full font-medium
          ${
            status === "ongoing"
              ? "bg-red-100 text-red-600"
              : status === "waiting"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {status === "ongoing"
            ? "On Trip"
            : status === "waiting"
            ? "Waiting"
            : "Available"}
        </span>

      </div>

      {/* BODY */}

      <div className="text-[12px] text-gray-600 space-y-[2px]">

        <div className="flex justify-between">
          <span className="text-gray-500">Driver</span>
          <span className="font-medium text-gray-800 truncate max-w-[120px]">
            {vehicle.driver || "Unassigned"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Capacity</span>
          <span className="font-medium">
            {vehicle.capacity ?? "-"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Trips</span>
          <span className="font-medium">
            {vehicle.trips_today ?? 0}
          </span>
        </div>

      </div>

      {disabled && (

        <div className="mt-2 text-[10px] text-gray-400 border-t pt-1 text-center">
          Dispatch unavailable
        </div>

      )}

    </div>

  );

};