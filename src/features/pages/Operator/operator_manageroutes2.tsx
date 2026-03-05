import { useEffect, useState } from "react";
import SharedMap from "@/features/shared/components/layout/SharedMap";
import {
  getStops,
  addStop,
  deleteStop,
  updateStop,
} from "./services/operatorApi";

type Stop = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
};
export default OperatorManageRoutes2;
export function OperatorManageRoutes2() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopName, setStopName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const defaultCenter = {
    latitude: 14.4246,
    longitude: 120.9431,
  };

  useEffect(() => {
    loadStops();
  }, []);

  const loadStops = async () => {
    try {
      setTableLoading(true);
      const data = await getStops();
      setStops(data || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSaveStop = async () => {
    if (!stopName || !latitude || !longitude) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await updateStop(editingId, {
          name: stopName,
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
        setEditingId(null);
      } else {
        await addStop({
          name: stopName,
          latitude: Number(latitude),
          longitude: Number(longitude),
        });
      }

      await loadStops();
      resetForm();
    } catch (err: any) {
      console.error("SAVE ERROR:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stop: Stop) => {
    setEditingId(stop.id);
    setStopName(stop.name);
    setLatitude(String(stop.latitude));
    setLongitude(String(stop.longitude));
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteStop(id);
      await loadStops();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStopName("");
    setLatitude("");
    setLongitude("");
  };

  const handleConfirmCoords = () => {
    if (!pendingCoords) return;

    setLatitude(String(pendingCoords.latitude));
    setLongitude(String(pendingCoords.longitude));
    setPendingCoords(null);
    setIsMapOpen(false);
  };

  return (
    <div className="p-2 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Stop" : "Add Stop"}
          </h2>

          <input
            type="text"
            placeholder="Stop Name"
            value={stopName}
            onChange={(e) => setStopName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="number"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSaveStop}
              disabled={loading}
              className={`flex-1 py-2 rounded text-white ${
                loading ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              {loading
                ? "Processing..."
                : editingId
                ? "Update Stop"
                : "Save Stop"}
            </button>

            <button
              onClick={() => setIsMapOpen(true)}
              className="flex-1 bg-gray-800 text-white py-2 rounded"
            >
              Full View Map
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 h-[400px] bg-white rounded-xl shadow p-4">
          <SharedMap
            stops={stops}
            initialCenter={defaultCenter}
            initialZoom={11}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Stops List</h2>

        {tableLoading && <div>Loading stops...</div>}

        {!tableLoading &&
          stops.map((stop) => (
            <div
              key={stop.id}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                {stop.name} — {stop.latitude}, {stop.longitude}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(stop)}
                  className="bg-yellow-400 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(stop.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {isMapOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-8">
          <div className="bg-white w-full h-full rounded-xl overflow-hidden relative">

            <button
              onClick={() => setIsMapOpen(false)}
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md z-50"
            >
              Close
            </button>

            <SharedMap
              stops={stops}
              initialCenter={defaultCenter}
              initialZoom={11}
              onRightClick={(coords) => setPendingCoords(coords)}
            />
          </div>
        </div>
      )}

      {pendingCoords && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">

            <h2 className="text-lg font-semibold">
              Confirm Coordinates
            </h2>

            <div className="bg-gray-100 p-3 rounded text-sm">
              <p><strong>Latitude:</strong> {pendingCoords.latitude}</p>
              <p><strong>Longitude:</strong> {pendingCoords.longitude}</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingCoords(null)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmCoords}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}