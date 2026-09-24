"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle as LeafletCircle,
} from "react-leaflet";

import { useDashboardStore } from "@/lib/store/dashboardStore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon URLs
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function HotspotMap() {
  const devices = useDashboardStore((state) => state.devices);
  const deviceList = Object.values(devices || {});

  // Default initial map center (Pune coordinates)
  const defaultCenter: [number, number] = [18.5204, 73.8567];

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg">
      <MapContainer
        center={defaultCenter} // FIXED: Added required center prop
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Filter out devices with missing location data */}
        {deviceList
          .filter(
            (device) =>
              device?.location?.lat != null && device?.location?.lng != null
          )
          .map((device) => (
            <div key={`group-${device.deviceId}`}>
              {/* Radius Circle */}
              <LeafletCircle
                key={`circle-${device.deviceId}`}
                center={[device.location.lat, device.location.lng]}
                radius={200} // FIXED: Added required radius in meters
                pathOptions={{
                  fillOpacity: 0.35,
                  weight: 2,
                  fillColor:
                    (device.detectionCount ?? 0) >= 2 ? "red" : "green",
                  color:
                    (device.detectionCount ?? 0) >= 2 ? "red" : "green",
                }}
              />

              {/* Marker with Popup */}
              <Marker
                key={`marker-${device.deviceId}`}
                position={[
                  device.location.lat,
                  device.location.lng,
                ]}
              >
                <Popup>
                  <strong>{device.deviceId}</strong>
                  <br />
                  Status: {device.status || "online"}
                  <br />
                  FPS: {device.fps ?? "N/A"}
                  <br />
                  Detections: {device.detectionCount ?? 0}
                  <br />
                  Confidence:{" "}
                  {device.avgConfidence
                    ? `${(device.avgConfidence * 100).toFixed(1)}%`
                    : "N/A"}
                </Popup>
              </Marker>
            </div>
          ))}
      </MapContainer>
    </div>
  );
}