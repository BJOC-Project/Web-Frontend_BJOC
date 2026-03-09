import { useEffect, useState } from "react";
import { routesService } from "./services/routesService";
import { stopsService } from "./services/stopsService";
import { vehicleService } from "./services/vehicleService";
import SharedMap from "@/features/shared/components/layout/SharedMap";
import StopsTable from "@/features/shared/components/layout/StopsTable";
import { Map, Plus, X, MapPin, MoreVertical, Pencil, Trash2 } from "lucide-react";

type Route = { id: string; route_name: string; start_location?: string; end_location?: string };
type Stop = { id: string; latitude: number; longitude: number; name?: string; is_active?: boolean };

export function AdminRouteStopManagement() {

  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeMenuOpen, setRouteMenuOpen] = useState<string | null>(null);

  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showCreateStop, setShowCreateStop] = useState(false);
  const [showSelectMap, setShowSelectMap] = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<any>(null);

  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const [vehicleLocations, setVehicleLocations] = useState<any[]>([]);

  const [routeForm, setRouteForm] = useState({ route_name: "", start_location: "", end_location: "" });
  const [stopForm, setStopForm] = useState({ stop_name: "", latitude: "", longitude: "" });

  const defaultCenter = { latitude: 14.438853366233266, longitude: 120.9607039176618 };

  const [showActionConfirm, setShowActionConfirm] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);

  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmButton, setConfirmButton] = useState("Confirm");
  const [confirmColor, setConfirmColor] = useState("bg-blue-600");

  async function loadRoutes() {
    const data = await routesService.getRoutes();
    setRoutes(data);
  }

  async function loadStops(routeId: string) {
    const data = await stopsService.getStopsByRoute(routeId);

    const formatted = data.map((s: any) => ({
      id: s.id,
      latitude: s.latitude,
      longitude: s.longitude,
      name: s.stop_name,
      is_active: s.is_active
    }));

    setStops(formatted);
  }

  function openRoute(route: Route) {
    setSelectedRoute(route);
    loadStops(route.id);
  }

  async function loadVehicleLocations() {
    try {
      const locations = await vehicleService.getVehicleLocations();
      setVehicleLocations(locations);
    } catch (error) {
      console.error("Vehicle location load error:", error);
    }
  }

  useEffect(() => {
    loadVehicleLocations();
    const interval = setInterval(loadVehicleLocations, 3000);
    return () => clearInterval(interval);
  }, []);

  async function createRoute() {
    if (editingRouteId) {
      await routesService.updateRoute(editingRouteId, routeForm);
    } else {
      await routesService.createRoute(routeForm);
    }
    setRouteForm({
      route_name: "",
      start_location: "",
      end_location: ""
    });
    setEditingRouteId(null);
    setShowCreateRoute(false);
    loadRoutes();
  }

  async function createStop() {

    if (!selectedRoute) return;

    if (editingStopId) {

      await stopsService.updateStop(editingStopId, {
        stop_name: stopForm.stop_name,
        latitude: Number(stopForm.latitude),
        longitude: Number(stopForm.longitude)
      });

    } else {

      await stopsService.createStop({
        route_id: selectedRoute.id,
        stop_name: stopForm.stop_name,
        latitude: Number(stopForm.latitude),
        longitude: Number(stopForm.longitude)
      });

    }

    setStopForm({ stop_name: "", latitude: "", longitude: "" });
    setEditingStopId(null);
    setShowCreateStop(false);
    loadStops(selectedRoute.id);
  }

  async function reorderStops(newStops: any[]) {

    if (!selectedRoute) return;

    setStops(newStops);

    const updates = newStops.map((stop, index) => ({
      id: stop.id,
      stop_order: index + 1
    }));

    await stopsService.updateStopOrder(selectedRoute.id, updates);

  }

  async function publishRoute() {

    if (!selectedRoute) return;

    setConfirmTitle("Publish Route");
    setConfirmMessage(
      "This will make the latest route changes visible to drivers and passengers."
    );
    setConfirmButton("Publish");
    setConfirmColor("bg-orange-600");

    setConfirmAction(() => async () => {
      setIsPublishing(true);
      await routesService.publishRoute(selectedRoute.id);

      await new Promise(resolve => setTimeout(resolve, 3000));

      await loadStops(selectedRoute.id);
      await loadRoutes();

      setIsPublishing(false);
      setShowPublishSuccess(true);

    });

    setShowActionConfirm(true);
  }

  function deleteStop(id: string) {

    setConfirmTitle("Delete Stop");
    setConfirmMessage("Are you sure you want to delete this stop?");
    setConfirmButton("Delete");
    setConfirmColor("bg-red-600");

    setConfirmAction(() => async () => {
      await stopsService.deleteStop(id);
      if (selectedRoute) loadStops(selectedRoute.id);
    });

    setShowActionConfirm(true);

  }

  function toggleStop(id: string, isActive: boolean) {

    setConfirmTitle(isActive ? "Activate Stop" : "Deactivate Stop");

    setConfirmMessage(
      isActive
        ? "This stop will become visible to passengers and drivers."
        : "This stop will be hidden from passengers and drivers."
    );

    setConfirmButton(isActive ? "Activate" : "Deactivate");
    setConfirmColor(isActive ? "bg-green-600" : "bg-red-600");

    setConfirmAction(() => async () => {
      await stopsService.toggleStopStatus(id, isActive);
      if (selectedRoute) loadStops(selectedRoute.id);
    });

    setShowActionConfirm(true);
  }

  function deleteRoute(id: string) {

    setConfirmTitle("Delete Route");
    setConfirmMessage("Are you sure you want to delete this route? All stops will also be removed.");
    setConfirmButton("Delete");
    setConfirmColor("bg-red-600");

    setConfirmAction(() => async () => {

      await routesService.deleteRoute(id);

      loadRoutes();

      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
        setStops([]);
      }

    });

    setShowActionConfirm(true);

  }

  function editRoute(route: Route) {

    setEditingRouteId(route.id);

    setRouteForm({
      route_name: route.route_name,
      start_location: route.start_location || "",
      end_location: route.end_location || ""
    });

    setShowCreateRoute(true);

  }

  function openEditStop(stop: any) {
    setEditingStopId(stop.id);
    setStopForm({
      stop_name: stop.name,
      latitude: String(stop.latitude),
      longitude: String(stop.longitude)
    });
    setShowCreateStop(true);
  }

  function handleMapRightClick(coords: { latitude: number; longitude: number }) {
    setPendingCoords(coords);
    setShowConfirm(true);
  }

  function confirmCoords() {
    if (!pendingCoords) return;
    setStopForm({ ...stopForm, latitude: String(pendingCoords.latitude), longitude: String(pendingCoords.longitude) });
    setShowConfirm(false);
    setShowSelectMap(false);
  }

  useEffect(() => { loadRoutes() }, []);

  const orderedStops = [...stops];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {

      const target = event.target as HTMLElement;

      if (!target.closest(".route-menu")) {
        setRouteMenuOpen(null);
      }

    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);



  return (
    <div className="p-2">

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Route & Stop Management</h1>
        <button onClick={() => setShowCreateRoute(true)} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"><Plus size={18} /></button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {routes.map(route => (
          <div key={route.id} className={`bg-white border rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer ${selectedRoute?.id === route.id ? "border-orange-500" : ""}`} onClick={() => openRoute(route)}>

            <div className="flex justify-between items-start">

              <div>
                <h2 className="font-semibold">{route.route_name}</h2>
                <div className="text-sm text-gray-500">
                  {route.start_location} → {route.end_location}
                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoute(route);
                    loadStops(route.id);
                    setShowRouteMap(true);
                  }}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <Map size={20} />
                </button>

                <div className="relative route-menu">

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRouteMenuOpen(routeMenuOpen === route.id ? null : route.id);
                    }}
                  >
                    <MoreVertical size={18} />
                  </button>

                  {routeMenuOpen === route.id && (

                    <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-md w-36 z-10">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editRoute(route);
                          setRouteMenuOpen(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRoute(route.id);
                          setRouteMenuOpen(null);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr className="border-t border-gray-300 my-6" />

      {selectedRoute ? (
        <div className="space-y-4">

          <div className="flex justify-between items-center">            
            <button
              onClick={publishRoute}
              disabled={isPublishing}
              className={`px-3 py-1 text-sm rounded text-white ${isPublishing ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
            <h2 className="text-lg font-semibold">
              Stops for: {selectedRoute.route_name}
            </h2>


            <button
              onClick={() => setShowCreateStop(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Plus size={16} />
            </button>
          </div>

          <StopsTable
            stops={stops}
            onDelete={deleteStop}
            onToggle={toggleStop}
            onEdit={openEditStop}
            onReorder={reorderStops}
          />

        </div>

      ) : (
        

        <div className="flex items-center justify-center h-[200px] border rounded-xl bg-gray-50 text-gray-500">
          Select a route to display its stops in this panel.
        </div>

      )}

      {showCreateStop && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[420px] space-y-4">

            <div className="flex justify-between">
              <h2 className="font-semibold text-lg">Create Stop</h2>
              <button onClick={() => setShowCreateStop(false)}><X /></button>
            </div>

            <input placeholder="Stop Name" className="border p-2 rounded w-full" value={stopForm.stop_name} onChange={e => setStopForm({ ...stopForm, stop_name: e.target.value })} />
            <input placeholder="Latitude" className="border p-2 rounded w-full" value={stopForm.latitude} onChange={e => setStopForm({ ...stopForm, latitude: e.target.value })} />
            <input placeholder="Longitude" className="border p-2 rounded w-full" value={stopForm.longitude} onChange={e => setStopForm({ ...stopForm, longitude: e.target.value })} />

            <button onClick={() => setShowSelectMap(true)} className="flex items-center gap-2 border px-3 py-2 rounded hover:bg-gray-100"><MapPin size={16} />Select From Map</button>

            <button
              onClick={() => {

                setConfirmTitle(editingStopId ? "Save Changes" : "Create Stop");

                setConfirmMessage(
                  editingStopId
                    ? "Are you sure you want to update this stop?"
                    : "Are you sure you want to create this stop?"
                );

                setConfirmButton("Confirm");
                setConfirmColor("bg-blue-600");

                setConfirmAction(() => createStop);

                setShowActionConfirm(true);

              }}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Save Stop
            </button>

          </div>
        </div>
      )}

      {showCreateRoute && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[420px] space-y-4" >

            <div className="flex justify-between">
              <h2 className="font-semibold text-lg">Create Route</h2>
              <button onClick={() => setShowCreateRoute(false)}><X /></button>
            </div>

            <input
              placeholder="Route Name"
              className="border p-2 rounded w-full"
              value={routeForm.route_name}
              onChange={e => setRouteForm({ ...routeForm, route_name: e.target.value })}
            />

            <input
              placeholder="Start Terminal"
              className="border p-2 rounded w-full"
              value={routeForm.start_location}
              onChange={e => setRouteForm({ ...routeForm, start_location: e.target.value })}
            />

            <input
              placeholder="End Terminal"
              className="border p-2 rounded w-full"
              value={routeForm.end_location}
              onChange={e => setRouteForm({ ...routeForm, end_location: e.target.value })}
            />

            <button
              onClick={() => {
                setConfirmTitle("Confirm");
                setConfirmMessage("Are you sure you want to save this route?");
                setConfirmButton("Save");
                setConfirmColor("bg-blue-600");
                setConfirmAction(() => createRoute);
                setShowActionConfirm(true);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Save Route
            </button>
          </div>
        </div>
      )}

      {showRouteMap && selectedRoute && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl w-[1100px] space-y-3">

            <div className="flex justify-between">
              <h2 className="font-semibold">{selectedRoute.route_name} Stops</h2>
              <button onClick={() => setShowRouteMap(false)}><X /></button>
            </div>

            <div className="h-[450px]">
              <SharedMap
                stops={selectedRoute ? orderedStops : []}
                initialCenter={defaultCenter}
                bearing={100}
                initialZoom={11.5}
                vehicles={vehicleLocations}
              />
            </div>

          </div>
        </div>
      )}

      {showSelectMap && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl w-[800px] space-y-3">

            <div className="flex justify-between">
              <h2 className="font-semibold">Select Coordinate</h2>
              <button onClick={() => setShowSelectMap(false)}><X /></button>
            </div>

            <div className="h-[400px]">
              <SharedMap stops={[]} initialCenter={defaultCenter} onRightClick={(coords) => handleMapRightClick(coords)} />
            </div>

          </div>
        </div>
      )}

      {showConfirm && pendingCoords && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center" onClick={() => setShowConfirm(false)}>
          <div className="bg-white p-6 rounded-xl w-[360px] space-y-4">

            <h2 className="font-semibold text-lg">Confirm Coordinate</h2>

            <p className="text-sm text-gray-600">Use this coordinate for the stop?</p>

            <div className="text-sm text-gray-500">Lat: {pendingCoords.latitude} | Lng: {pendingCoords.longitude}</div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={confirmCoords} className="px-3 py-2 bg-blue-600 text-white rounded">Confirm</button>
            </div>

          </div>
        </div>
      )}

      {showPublishSuccess && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-xl w-[360px] text-center space-y-4">

            <h2 className="text-lg font-semibold text-green-600">
              Publish Complete
            </h2>

            <p className="text-sm text-gray-600">
              The updated route is now visible to drivers and passengers.
            </p>

            <button
              onClick={() => setShowPublishSuccess(false)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {showActionConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center" onClick={() => setShowActionConfirm(false)}>
          <div className="bg-white p-6 rounded-xl w-[360px] space-y-4">
            <h2 className="font-semibold text-lg">{confirmTitle}</h2>
            <p className="text-sm text-gray-600">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowActionConfirm(false)} className="px-3 py-2 border rounded">
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (confirmAction) await confirmAction();
                  setShowActionConfirm(false);
                }}
                className={`px-3 py-2 text-white rounded ${confirmColor}`}
              >
                {confirmButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}