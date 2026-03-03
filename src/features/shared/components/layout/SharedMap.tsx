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

type SharedMapProps = {
  stops?: Stop[];
  initialCenter: {
    latitude: number;
    longitude: number;
  };
  initialZoom?: number;
  onRightClick?: (coords: { latitude: number; longitude: number }) => void;
};

export default function SharedMap({
  stops = [],
  initialCenter,
  initialZoom = 12,
  onRightClick,
}: SharedMapProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    latitude: initialCenter.latitude,
    longitude: initialCenter.longitude,
    zoom: initialZoom,
  });

  useEffect(() => {
    setViewState({
      latitude: initialCenter.latitude,
      longitude: initialCenter.longitude,
      zoom: initialZoom,
    });
  }, [initialCenter, initialZoom]);

  const handleRightClick = (event: MapLayerMouseEvent) => {
    event.preventDefault();

    onRightClick?.({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  };

  // ✅ Smooth zoom using flyTo
  const handleMarkerClick = (stop: Stop) => {
    mapRef.current?.flyTo({
      center: [stop.longitude, stop.latitude],
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

        {stops.map((stop, index) => (
          <Marker
            key={stop.id || index}
            latitude={stop.latitude}
            longitude={stop.longitude}
            anchor="bottom"
          >
            <div
              onClick={() => handleMarkerClick(stop)}
              className="flex flex-col items-center cursor-pointer"
            >
              <MapPin className="text-red-600 w-6 h-6 drop-shadow-lg hover:scale-110 transition" />

              {/* Show label only when zoom >= 15 */}
              {viewState.zoom >= 15 && stop.name && (
                <span className="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">
                  {stop.name}
                </span>
              )}
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}