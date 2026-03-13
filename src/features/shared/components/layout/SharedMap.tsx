import Map, {
  Marker,
  NavigationControl,
  Source,
  Layer,
  type MapLayerMouseEvent,
} from "react-map-gl";
import { useRef, useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { LoaderPinwheelIcon } from "lucide-react";
import type { MapRef } from "react-map-gl";
import type { Feature, LineString } from "geojson";
import { RotateCcw } from "lucide-react";

type Stop = {
  id?: string;
  latitude: number;
  longitude: number;
  name?: string;
};

type Vehicle = {
  vehicle_id: string;
  latitude: number;
  longitude: number;
  plate_number?: string;
  driver?: string;
};

type SharedMapProps = {
  stops?: Stop[];
  vehicles?: Vehicle[];
  initialCenter: {
    latitude: number;
    longitude: number;
  };
  initialZoom?: number;
  bearing?: number;
  onRightClick?: (coords: { latitude: number; longitude: number }) => void;
};

export default function SharedMap({
  stops = [],
  vehicles = [],
  initialCenter,
  initialZoom = 12,
  bearing = 0,
  onRightClick,
}: SharedMapProps) {

  const mapRef = useRef<MapRef>(null);
  const [zoom, setZoom] = useState(initialZoom);

  const [routeGeoJSON, setRouteGeoJSON] = useState<Feature<LineString> | null>(null);

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  const handleRightClick = (event: MapLayerMouseEvent) => {
    event.preventDefault();

    onRightClick?.({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  };

  const flyToLocation = (lat: number, lng: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 15,
      duration: 800,
    });
  };

  const resetCamera = () => {
    mapRef.current?.flyTo({
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: initialZoom,
      bearing: bearing,
      duration: 800,
    });
  };

  /* --------------------------------
     FETCH ROUTE FROM MAPBOX API
  -------------------------------- */

  useEffect(() => {

    const fetchRoute = async () => {

      if (stops.length < 2) {
        setRouteGeoJSON(null);
        return;
      }

      try {

        const coordinates = stops
          .map((s) => `${s.longitude},${s.latitude}`)
          .join(";");

        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) return;

        const route = data.routes[0].geometry;

        setRouteGeoJSON({
          type: "Feature",
          properties: {},
          geometry: route,
        });

      } catch (error) {
        console.error("Route fetch error:", error);
      }

    };

    fetchRoute();

  }, [stops]);

  return (
    <div className="relative w-full h-full">

      <Map
        ref={mapRef}
        initialViewState={{
          latitude: initialCenter.latitude,
          longitude: initialCenter.longitude,
          zoom: initialZoom,
          bearing: bearing,
        }}
        onMove={(e) => setZoom(e.viewState.zoom)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        onContextMenu={handleRightClick}
      >

        <NavigationControl position="top-left" />

        {routeGeoJSON && (
          <Source id="route-line" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line-layer"
              type="line"
              paint={{
                "line-color": "#020ebb",
                "line-width": 2,
                "line-opacity": 0.9,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
        )}

        {stops.map((stop, index) => (
          <Marker
            key={stop.id || index}
            latitude={stop.latitude}
            longitude={stop.longitude}
            anchor="bottom"
          >
            <div
              onClick={() => flyToLocation(stop.latitude, stop.longitude)}
              className="flex flex-col items-center cursor-pointer"
            >

              {zoom >= 15 && stop.name && (
                <span className="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">
                  {stop.name}
                </span>
              )}

              <LoaderPinwheelIcon className="text-red-600 w-3 h-3 drop-shadow-lg hover:scale-110 transition" strokeWidth={2} />

            </div>
          </Marker>
        ))}

        {/* Vehicles */}
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.vehicle_id}
            latitude={vehicle.latitude}
            longitude={vehicle.longitude}
            anchor="bottom"
          >
            <div
              onClick={() => flyToLocation(vehicle.latitude, vehicle.longitude)}
              className="flex flex-col items-center cursor-pointer"
            >

              {zoom >= 15 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded shadow mb-1 whitespace-nowrap">
                  {vehicle.plate_number || "Vehicle"}
                  {vehicle.driver ? ` • ${vehicle.driver}` : ""}
                </span>
              )}

              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>

            </div>
          </Marker>
        ))}

      </Map>

      <button
        onClick={resetCamera}
        title="Reset Map View"
        className="absolute top-3 right-3 z-20 bg-white border border-gray-200 shadow-md rounded-lg p-2 hover:bg-gray-100 transition flex items-center justify-center"
      >
        <RotateCcw size={18} className="text-gray-700" />
      </button>

    </div>
  );
}