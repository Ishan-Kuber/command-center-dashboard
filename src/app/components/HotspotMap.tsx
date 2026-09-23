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

  const deviceList = Object.values(devices);

  console.log("Devices in map:", deviceList);

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-lg">
      <MapContainer
  zoom={12}
  scrollWheelZoom={true}
  style={{ height: "100%", width: "100%" }}
>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {deviceList.map((device) => (
          <Marker
            key={device.deviceId}
            position={[
              device.location.lat,
              device.location.lng,
            ] as [number, number]}
          >
            <Popup>
              <strong>{device.deviceId}</strong>
              <br />
              Status: {device.status}
              <br />
              FPS: {device.fps}
              <br />
              Detections: {device.detectionCount}
              <br />
              Confidence:{" "}
              {(device.avgConfidence * 100).toFixed(1)}%
            </Popup>
          </Marker>
        ))}

                {deviceList.map((device) => (
          <LeafletCircle
  key={`circle-${device.deviceId}`}
  center={[
    device.location.lat,
    device.location.lng,
  ]}
  pathOptions={{
  fillOpacity: 0.35,
  weight: 2,
  fillColor:
    device.detectionCount >= 2
      ? "red"
      : "green",
}}
          />
        ))}
      </MapContainer>
    </div>
  );
}
