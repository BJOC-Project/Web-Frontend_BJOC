import { phTime } from "@/lib/time";

type Props = {
  trips: any[];
  onCancel: (trip: any) => void;
  onEnd: (trip: any) => void;
  onReschedule: (trip: any) => void;
};

export function ActiveTripsTable({
  trips,
  onCancel,
  onEnd,
  onReschedule
}: Props) {

  return (
    <div className="flex flex-col overflow-hidden">
      <h2 className="font-medium mb-2">Active Trips</h2>
      <div className="border rounded-lg bg-white overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-2 text-left">Vehicle</th>
              <th className="p-2 text-left">Driver</th>
              <th className="p-2 text-left">Route</th>
              <th className="p-2 text-left">Start</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {trips.map((t) => (

              <tr key={t.id} className="border-b hover:bg-gray-50">

                <td className="p-2">{t.vehicle}</td>

                <td className="p-2">{t.driver}</td>

                <td className="p-2">{t.route}</td>

                <td className="p-2">

                  {t.status === "waiting"
                    ? phTime(t.scheduled_departure_time)
                    : phTime(t.start_time)}

                </td>

                <td className="p-2 text-right space-x-1">

                  {t.status === "waiting" && (
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

                  {t.status === "ongoing" && (

                    <button
                      onClick={() => onEnd(t)}
                      className="px-2 py-1 text-xs bg-red-600 text-white rounded"
                    >
                      End
                    </button>

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