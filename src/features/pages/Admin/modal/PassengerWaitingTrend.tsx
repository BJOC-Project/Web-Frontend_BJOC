import { useEffect, useState } from "react";
import { Bus } from "lucide-react";
import { adminService } from "../services/adminService";

type Route = {
  id: string;
  start_location: string;
  end_location: string;
};

type TrendResponse = {
  stops: string[];
  hours: string[];
  matrix: Record<string, Record<string, number>>;
};

export function PassengerWaitingTrend() {

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const [stops, setStops] = useState<string[]>([]);
  const [hours, setHours] = useState<string[]>([]);
  const [matrix, setMatrix] =
    useState<Record<string, Record<string, number>>>({});

  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);



  /* LOAD ROUTES */

  useEffect(() => {
    loadRoutes();
  }, []);



  /* LOAD TREND */

  useEffect(() => {

    if (!selectedRoute) return;

    loadTrend(selectedRoute);

  }, [selectedRoute]);



  async function loadRoutes() {

    try {

      setRouteLoading(true);

      const data = await adminService.getRoutes();

      if (!data || data.length === 0) {
        setRoutes([]);
        return;
      }

      setRoutes(data);
      setSelectedRoute(data[0].id);

    } catch (err) {

      console.error("Route load error:", err);

    } finally {

      setRouteLoading(false);

    }

  }



  async function loadTrend(routeId: string) {

    try {

      setLoading(true);

      const data: TrendResponse =
        await adminService.getWaitingStops(routeId, "today");

      setStops(data?.stops ?? []);
      setHours(data?.hours ?? []);
      setMatrix(data?.matrix ?? {});

    } catch (err) {

      console.error("Passenger trend load error:", err);

      setStops([]);
      setHours([]);
      setMatrix({});

    } finally {

      setLoading(false);

    }

  }



  /* COLOR SCALE */

  function getColor(value: number) {

    if (value === 0) return "bg-gray-200 text-gray-600";
    if (value < 3) return "bg-blue-400";
    if (value < 6) return "bg-blue-600";
    return "bg-blue-800";

  }



  return (

    <div className="bg-white border rounded-xl p-4">

      <div className="flex justify-between items-center mb-3">

        <h2 className="text-sm font-semibold">
          Passenger Waiting Trend
        </h2>

        {routeLoading ? (

          <span className="text-xs text-gray-400">
            Loading routes...
          </span>

        ) : (

          <select
            className="border rounded px-2 py-1 text-xs"
            value={selectedRoute}
            onChange={(e) =>
              setSelectedRoute(e.target.value)
            }
          >
            {routes.map((r: any) => (
              <option key={r.id} value={r.id}>
                {`${r.start_location || "Unknown"} → ${r.end_location || "Unknown"}`}
              </option>
            ))}

          </select>

        )}

      </div>

      {loading && (

        <div className="text-xs text-gray-400 text-center py-6">
          Loading passenger waiting data...
        </div>

      )}


      {!loading && stops.length === 0 && (

        <div className="text-xs text-gray-400 text-center py-6">
          No passenger waiting data
        </div>

      )}



      {/* TREND TABLE */}

      {!loading && stops.length > 0 && (

        <div className="overflow-x-auto">

          <table className="w-full text-xs">

            <thead className="border-b text-gray-500">

              <tr>

                <th className="p-2 text-left">
                  Time
                </th>

                {stops.map((stop) => (

                  <th key={stop} className="p-2 text-center relative">
                    <div className="group relative flex justify-center">

                      <Bus
                        size={16}
                        className="text-blue-600 cursor-pointer"
                      />

                      {/* TOOLTIP */}
                      <div className="
                          absolute top-full mt-1
                          hidden group-hover:block
                          bg-gray-900 text-white
                          text-[10px]
                          px-2 py-1 rounded
                          whitespace-nowrap
                          z-50 shadow
                        ">
                        {stop}
                      </div>

                    </div>
                  </th>

                ))}

              </tr>

            </thead>



            <tbody>

              {hours.map((hour) => (

                <tr key={hour} className="border-b">

                  <td className="p-2 font-medium text-gray-500">
                    {hour}
                  </td>

                  {stops.map((stop) => {

                    const value =
                      matrix?.[hour]?.[stop] ?? 0;

                    return (

                      <td key={stop} className="p-2 text-center">

                        <span
                          className={`inline-block min-w-[24px] px-2 py-[2px] rounded text-[10px] text-white ${getColor(value)}`}
                        >
                          {value}
                        </span>

                      </td>

                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}