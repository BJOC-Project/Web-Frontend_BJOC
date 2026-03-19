import { phTime } from "@/lib/time";
import { useLoading } from "@/features/shared/context/LoadingContext";

type Props = {
  trips: any[];
  onCancel: (trip: any) => void;
  onReschedule: (trip: any) => void;
};

export function ActiveTripsTable({
  trips,
  onCancel,
  onReschedule
}: Props) {

  const { loading } = useLoading();

  return (

    <div className="flex flex-col overflow-hidden">

      <h2 className="font-medium mb-2">
        Active Trips
      </h2>

      <div className="border rounded-lg bg-white overflow-y-auto">

        <table className="w-full text-xs">

          <thead className="bg-green-900 border-b text-white">

            <tr>
              <th className="p-2 text-left">Vehicle</th>
              <th className="p-2 text-left">Driver</th>
              <th className="p-2 text-left">Route</th>
              <th className="p-2 text-left">Time</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  Loading trips...
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && trips.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-400">
                  No active trips
                </td>
              </tr>
            )}

            {/* TRIPS */}
            {!loading && trips.map((t) => (

              <tr key={t.id} className="border-b hover:bg-gray-50">

                <td className="p-2">
                  {t.vehicle}
                </td>

                <td className="p-2">
                  {t.driver}
                </td>

                <td className="p-2">
                  {t.route}
                </td>

                <td className="p-2">

                  {t.status === "scheduled"
                    ? phTime(t.scheduled_departure_time)
                    : phTime(t.start_time)}

                </td>

                <td className="p-2 text-right space-x-1">

                  {t.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => onReschedule(t)}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => onCancel(t)}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                </td>

              </tr>

            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}