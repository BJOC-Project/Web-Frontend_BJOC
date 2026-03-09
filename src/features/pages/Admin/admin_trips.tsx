import { useEffect, useState } from "react";
import { vehicleService } from "./services/vehicleService";
import { tripsService } from "./services/tripsService";
import { routesService } from "./services/routesService";
import { phTime, phNow } from "@/lib/time";
import { useLoading } from "@/features/shared/context/LoadingContext";

type Route = {
  id: string;
  route_name: string;
  start_lat?: number;
  start_lng?: number;
};

export function AdminTrips() {

  const { showLoading, hideLoading } = useLoading();

  const [vehicles,setVehicles]=useState<any[]>([]);
  const [activeTrips,setActiveTrips]=useState<any[]>([]);
  const [history,setHistory]=useState<any[]>([]);
  const [routes,setRoutes]=useState<Route[]>([]);

  const [open,setOpen]=useState(false);

  const [selectedVehicle,setSelectedVehicle]=useState<any>(null);
  const [selectedRoute,setSelectedRoute]=useState("");
  const [recommendedRoute,setRecommendedRoute]=useState<Route | null>(null);

  const [departureTime,setDepartureTime]=useState("");

  /* -------------------------
     LOAD DATA
  --------------------------*/

  const load = async () => {
    try {

      const v = await vehicleService.getVehicles();
      const active = await tripsService.getActiveTrips();
      const h = await tripsService.getTripHistory();
      const r = await routesService.getRoutes();

      const routesTyped:Route[]=(r??[]).map((x:any)=>({
        id:x.id,
        route_name:x.route_name,
        start_lat:x.start_lat,
        start_lng:x.start_lng
      }));

      setRoutes(routesTyped);

      const enriched=(v??[]).map((veh:any)=>{
        const activeTrip=active.find((t:any)=>t.vehicle_id===veh.id);
        const tripsToday=h.filter((t:any)=>t.vehicle_id===veh.id).length;
        return {...veh,available:!activeTrip,trips_today:tripsToday};
      });

      setVehicles(enriched);
      setActiveTrips(active??[]);
      setHistory(h??[]);

    } catch (err) {
      console.error("Trips page load error:",err);
    }
  };

  useEffect(()=>{
    load();
    const interval=setInterval(load,10000);
    return ()=>clearInterval(interval);
  },[]);

  /* -------------------------
     OPEN DISPATCH
  --------------------------*/

  const openDispatch = async (vehicle:any) => {

    if(!vehicle.available) return;

    showLoading();

    setSelectedVehicle(vehicle);

    const now=new Date();
    setDepartureTime(now.toISOString().slice(11,16));

    try{

      const pos = await new Promise<GeolocationPosition>((resolve,reject)=>
        navigator.geolocation.getCurrentPosition(resolve,reject)
      );

      const lat=pos.coords.latitude;
      const lng=pos.coords.longitude;

      let nearest:Route|null=null;
      let minDist=Infinity;

      for(const r of routes){

        if(!r.start_lat || !r.start_lng) continue;

        const d=Math.sqrt(
          Math.pow(lat-r.start_lat,2)+
          Math.pow(lng-r.start_lng,2)
        );

        if(d<minDist){
          minDist=d;
          nearest=r;
        }

      }

      setRecommendedRoute(nearest);

      if(nearest) setSelectedRoute(nearest.id);

    }catch{
      console.log("Location unavailable");
    }

    setTimeout(()=>{
      hideLoading();
      setOpen(true);
    },300);

  };

  /* -------------------------
     START TRIP
  --------------------------*/

  const startTrip = async () => {

    if(!selectedVehicle) return;

    if(!selectedVehicle.driver){
      alert("Vehicle has no assigned driver.");
      return;
    }

    if(!selectedRoute){
      alert("Please select a route.");
      return;
    }

    try{

      showLoading();

      let scheduledTime:string|undefined=undefined;

      if(departureTime){

        const now = phNow();

        const [h,m] = departureTime.split(":").map(Number);

        const scheduled = new Date(now);
        scheduled.setHours(h,m,0,0);

        if(scheduled < now){
          alert("Departure time cannot be earlier than current time.");
          hideLoading();
          return;
        }

        scheduledTime = scheduled.toISOString();
      }

      await tripsService.startTrip({
        vehicle_id:selectedVehicle.id,
        route_id:selectedRoute,
        route_direction:"forward",
        scheduled_departure_time:scheduledTime
      });

      setOpen(false);
      setSelectedVehicle(null);
      setSelectedRoute("");
      setRecommendedRoute(null);
      setDepartureTime("");

      await load();

      hideLoading();

    }catch(err){

      hideLoading();
      console.error("Start trip error:",err);
      alert("Failed to start trip.");

    }
  };

  /* -------------------------
     END TRIP
  --------------------------*/

  const endTrip = async (id:string) => {

    try{

      showLoading();

      await tripsService.endTrip(id);

      await load();

      hideLoading();

    }catch(err){

      hideLoading();
      console.error("End trip error:",err);
      alert("Failed to end trip.");

    }

  };

  return (
    <>

    <div className="p-6">

      <h1 className="text-2xl font-bold">Trips / Operations</h1>

      {/* FLEET DISPATCH */}

      <div>

        <h2 className="font-semibold mb-4">Fleet Dispatch</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {vehicles.map(v=>(

            <div
              key={v.id}
              onClick={()=>openDispatch(v)}
              className={`border rounded-lg p-4 transition ${
                v.available
                  ? "bg-white hover:shadow cursor-pointer"
                  : "bg-gray-100 opacity-50 grayscale cursor-not-allowed"
              }`}
            >

              <div className="flex justify-between mb-2">

                <span className="font-semibold text-lg">
                  {v.plate_number}
                </span>

                <span className={v.available?"text-green-600":"text-red-500"}>
                  ● {v.available?"Available":"On Trip"}
                </span>

              </div>

              <div className="text-sm text-gray-600 space-y-1">

                <div>Driver: {v.driver || "Unassigned"}</div>
                <div>Capacity: {v.capacity ?? "-"}</div>
                <div>Trips Today: {v.trips_today}</div>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* ACTIVE TRIPS */}

      <div>

        <h2 className="font-semibold mb-3">Active Trips</h2>

        <div className="border rounded-lg overflow-hidden bg-white">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Driver</th>
                <th className="p-3 text-left">Route</th>
                <th className="p-3 text-left">Start</th>
                <th></th>

              </tr>

            </thead>

            <tbody>

              {activeTrips.map((t:any)=>(

                <tr key={t.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{t.vehicle}</td>
                  <td className="p-3">{t.driver}</td>
                  <td className="p-3">{t.route}</td>

                  <td className="p-3">
                    {t.status==="waiting"
                      ? phTime(t.scheduled_departure_time)
                      : phTime(t.start_time)
                    }
                  </td>

                  <td className="p-3 text-right">

                    <button
                      onClick={()=>endTrip(t.id)}
                      disabled={t.status==="waiting"}
                      className={`px-3 py-1 rounded text-white ${
                        t.status==="waiting"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      End
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* TRIP HISTORY */}

      <div>

        <h2 className="font-semibold mb-3">Trip History</h2>

        <div className="border rounded-lg overflow-hidden bg-white">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 border-b">

              <tr>

                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Driver</th>
                <th className="p-3 text-left">Route</th>
                <th className="p-3 text-left">Start</th>
                <th className="p-3 text-left">End</th>

              </tr>

            </thead>

            <tbody>

              {history.length === 0 && (

                <tr>

                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No trip history yet
                  </td>

                </tr>

              )}

              {history.map((t:any)=>(

                <tr key={t.id} className="border-b hover:bg-gray-50">

                  <td className="p-3">{t.vehicle}</td>
                  <td className="p-3">{t.driver || "Unknown"}</td>
                  <td className="p-3">{t.route}</td>
                  <td className="p-3">{phTime(t.start_time)}</td>
                  <td className="p-3">{phTime(t.end_time)}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* DISPATCH MODAL */}

      {open && selectedVehicle && (

        <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-[9999]">

          <div className="bg-white p-6 rounded-lg w-[360px] space-y-4">

            <h3 className="font-semibold">
              Dispatch Vehicle - {selectedVehicle.plate_number}
            </h3>

            <div className="text-sm">
              Driver: {selectedVehicle.driver || "Unassigned"}
            </div>

            {recommendedRoute && (
              <div className="text-sm text-blue-600">
                Recommended Route: {recommendedRoute.route_name}
              </div>
            )}

            <div>

              <label className="text-sm block mb-1">Route</label>

              <select
                value={selectedRoute}
                onChange={(e)=>setSelectedRoute(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >

                <option value="">Select Route</option>

                {routes.map(r=>(

                  <option key={r.id} value={r.id}>
                    {r.route_name}
                  </option>

                ))}

              </select>

            </div>

            <div>

              <label className="text-sm block mb-1">
                Scheduled Departure Time
              </label>

              <input
                type="time"
                value={departureTime}
                onChange={(e)=>setDepartureTime(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              />

            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={()=>setOpen(false)}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={startTrip}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Start Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}