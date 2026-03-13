import { phTime } from "@/lib/time";

type Props = {
  trip: any;
};

export function TripHistoryCard({ trip }: Props) {

  return (

    <div className="border rounded-lg p-3 bg-white shadow-sm flex justify-between items-center">

      <div>

        <div className="font-semibold text-sm">
          {trip.vehicle}
        </div>

        <div className="text-xs text-gray-600">
          Driver: {trip.driver || "Unknown"}
        </div>

        <div className="text-xs text-gray-600">
          Route: {trip.route}
        </div>

      </div>

      <div className="text-right text-xs">

        <div>
          Start: {phTime(trip.start_time)}
        </div>

        <div className="text-gray-500">
          End: {phTime(trip.end_time)}
        </div>

      </div>

    </div>

  );
}