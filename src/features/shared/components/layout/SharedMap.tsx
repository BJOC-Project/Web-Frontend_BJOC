import Map, {
  Marker,
  NavigationControl,
  type MapLayerMouseEvent,
} from "react-map-gl";
import { useState, useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin } from "lucide-react";
import type { MapRef } from "react-map-gl";

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

  const [viewState, setViewState] = useState({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
    zoom: initialZoom,
    bearing: bearing,
  });

  useEffect(() => {
    setViewState({
      latitude: initialCenter.latitude,
      longitude: initialCenter.longitude,
      zoom: initialZoom,
      bearing: bearing,
    });
  }, [initialCenter, initialZoom, bearing]);

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

  return (
    <div className="relative w-full h-full">

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        onContextMenu={handleRightClick}
      >
        <NavigationControl position="top-left" />

        {/* Stops */}
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
              <MapPin className="text-red-600 w-6 h-6 drop-shadow-lg hover:scale-110 transition" />

              {viewState.zoom >= 15 && stop.name && (
                <span className="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">
                  {stop.name}
                </span>
              )}
            </div>
          </Marker>
        ))}

        {/* Vehicles (Driver Locations) */}
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
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>

              {viewState.zoom >= 14 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">
                  {vehicle.plate_number || "Vehicle"}
                  {vehicle.driver ? ` • ${vehicle.driver}` : ""}
                </span>
              )}
            </div>
          </Marker>
        ))}

      </Map>
    </div>
  );
}