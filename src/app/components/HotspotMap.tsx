"use client";

import { useMemo, useState } from "react";
import {
  Circle as LeafletCircle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import { Activity, Clock3, Flame, Map as MapIcon, MapPin, Radio, X } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { DeviceState } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon URLs.
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type MapMode = "street" | "intensity";

function formatTimestamp(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "—";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatLocation(device: DeviceState): string {
  return `${device.location.lat.toFixed(5)}, ${device.location.lng.toFixed(5)}`;
}

function toIsoTimestamp(timestamp: number): string | undefined {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function DeviceDetailCard({
  device,
  onClear,
}: {
  device: DeviceState | undefined;
  onClear: () => void;
}) {
  const lastSeenIso = device ? toIsoTimestamp(device.lastSeen) : undefined;

  return (
    <aside
      className="min-h-[220px] rounded-xl border border-slate-800 bg-slate-950/70 p-5 xl:min-h-[500px]"
      aria-label="Selected device details"
      aria-live="polite"
    >
      {device ? (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">Selected camera / sensor</p>
              <h3 className="mt-2 break-all text-lg font-semibold text-white">{device.deviceId}</h3>
            </div>
            <button
              type="button"
              onClick={onClear}
              aria-label="Close device details"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/75 px-3 py-3">
            <span className="text-xs text-slate-400">Latest reported status</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${device.status === "online" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-slate-700 bg-slate-800 text-slate-300"}`}>
              {device.status}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <MapPin className="size-3.5 text-cyan-300" aria-hidden="true" />
              Camera / sensor location
            </p>
            <p className="mt-2 font-mono text-sm tabular-nums text-slate-100">{formatLocation(device)}</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <DetailMetric label="Detections · latest report" value={device.detectionCount} icon={Activity} />
            <DetailMetric label="FPS" value={device.fps.toFixed(1)} icon={Radio} />
            <DetailMetric label="Latency" value={`${device.latencyMs} ms`} icon={Clock3} />
            <DetailMetric
              label="Avg. confidence"
              value={device.avgConfidence > 0 ? `${(device.avgConfidence * 100).toFixed(1)}%` : "—"}
              icon={Activity}
            />
          </div>

          <p className="mt-5 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Last seen{" "}
            {lastSeenIso ? <time dateTime={lastSeenIso}>{formatTimestamp(device.lastSeen)}</time> : "—"}
          </p>
        </>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center text-center xl:min-h-[450px]">
          <span className="grid size-12 place-items-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 text-sm font-semibold text-slate-200">Device details</h3>
          <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
            Select a camera or sensor on the map to inspect its latest reported status and telemetry.
          </p>
        </div>
      )}
    </aside>
  );
}

function DetailMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
      <p className="flex min-h-8 items-start gap-1.5 text-[11px] leading-4 text-slate-500">
        <Icon className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold tabular-nums text-slate-100">{value}</p>
    </div>
  );
}

export default function HotspotMap() {
  const devices = useDashboardStore((state) => state.devices);
  const deviceList = useMemo(() => Object.values(devices || {}), [devices]);
  const [mode, setMode] = useState<MapMode>("street");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);

  const locatedDevices = useMemo(
    () => deviceList.filter((device) => device?.location?.lat != null && device?.location?.lng != null),
    [deviceList],
  );
  const selectedDevice = deviceList.find((device) => device.deviceId === selectedDeviceId);

  const intensityPoints = useMemo(() => {
    if (locatedDevices.length === 0) return [];

    const latitudes = locatedDevices.map((device) => device.location.lat);
    const longitudes = locatedDevices.map((device) => device.location.lng);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;
    const maxDetections = Math.max(...locatedDevices.map((device) => device.detectionCount), 0);

    return locatedDevices.map((device) => ({
      device,
      x: lngSpan === 0 ? 50 : 8 + ((device.location.lng - minLng) / lngSpan) * 84,
      y: latSpan === 0 ? 50 : 92 - ((device.location.lat - minLat) / latSpan) * 84,
      intensity: maxDetections > 0 ? device.detectionCount / maxDetections : 0,
    }));
  }, [locatedDevices]);

  // Default initial map center (Pune coordinates), unchanged from the Leaflet view.
  const defaultCenter: [number, number] = [18.5204, 73.8567];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/70 p-1" role="group" aria-label="Map display mode">
          <button
            type="button"
            onClick={() => setMode("street")}
            aria-pressed={mode === "street"}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
              mode === "street" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <MapIcon className="size-4" aria-hidden="true" />
            Street
          </button>
          <button
            type="button"
            onClick={() => setMode("intensity")}
            aria-pressed={mode === "intensity"}
            className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
              mode === "intensity" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <Flame className="size-4" aria-hidden="true" />
            Intensity
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {mode === "street"
            ? "Interactive Leaflet map · live device locations"
            : "Relative device positions · intensity follows latest reported detections"}
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(290px,0.8fr)]">
        <div className="relative z-0 isolate h-[500px] min-w-0 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          {mode === "street" ? (
            <>
            <MapContainer
              center={defaultCenter}
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {locatedDevices.map((device) => (
                <div key={`group-${device.deviceId}`}>
                  <LeafletCircle
                    key={`circle-${device.deviceId}`}
                    center={[device.location.lat, device.location.lng]}
                    radius={200}
                    pathOptions={{
                      fillOpacity: 0.35,
                      weight: 2,
                      fillColor: (device.detectionCount ?? 0) >= 2 ? "red" : "green",
                      color: (device.detectionCount ?? 0) >= 2 ? "red" : "green",
                    }}
                  />
                  <Marker
                    key={`marker-${device.deviceId}`}
                    position={[device.location.lat, device.location.lng]}
                    keyboard={true}
                    title={`${device.deviceId}, camera or sensor at ${formatLocation(device)}`}
                    alt={`${device.deviceId}, camera or sensor at ${formatLocation(device)}`}
                    eventHandlers={{ click: () => setSelectedDeviceId(device.deviceId) }}
                  >
                    <LeafletTooltip className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-slate-100 shadow-xl">
                      <span className="font-medium">{device.deviceId}</span>
                      <br />
                      <span>{formatLocation(device)}</span>
                    </LeafletTooltip>
                    <Popup>
                      <strong>{device.deviceId}</strong>
                      <br />
                      Status: {device.status || "online"}
                      <br />
                      Location: {formatLocation(device)}
                      <br />
                      FPS: {device.fps ?? "N/A"}
                      <br />
                      Detections (latest report): {device.detectionCount ?? 0}
                      <br />
                      Confidence:{" "}
                      {device.avgConfidence > 0
                        ? `${(device.avgConfidence * 100).toFixed(1)}%`
                        : "N/A"}
                    </Popup>
                  </Marker>
                </div>
              ))}
            </MapContainer>
            {locatedDevices.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[400] grid place-items-center">
                <span className="rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 text-sm text-slate-300 shadow-lg" role="status">
                  Waiting for telemetry
                </span>
              </div>
            )}
            </>
          ) : (
            <div
              className="relative h-full w-full overflow-hidden"
              role="group"
              aria-label="Telemetry intensity view of device locations"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px), radial-gradient(ellipse at 50% 45%, rgba(15,23,42,0.25), rgba(2,6,23,0.96) 75%)",
                backgroundSize: "44px 44px, 44px 44px, 100% 100%",
              }}
            >
              {intensityPoints.length > 0 ? (
                <>
                  {intensityPoints.map(({ device, x, y, intensity }) => {
                    const diameter = 76 + intensity * 150;
                    const alpha = 0.12 + intensity * 0.28;
                    const isSelected = device.deviceId === selectedDeviceId;
                    const isHovered = device.deviceId === hoveredDeviceId;
                    const tooltipId = `intensity-location-${encodeURIComponent(device.deviceId)}`;
                    const tooltipPosition = x < 22
                      ? "left-0"
                      : x > 78
                        ? "right-0"
                        : "left-1/2 -translate-x-1/2";
                    const tooltipVerticalPosition = y < 30 ? "top-full mt-2" : "bottom-full mb-2";
                    return (
                      <div key={device.deviceId}>
                        <div
                          className="pointer-events-none absolute rounded-full"
                          aria-hidden="true"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${diameter}px`,
                            height: `${diameter}px`,
                            transform: "translate(-50%, -50%)",
                            background: `radial-gradient(circle, rgba(251,146,60,${alpha}) 0%, rgba(239,68,68,${alpha * 0.55}) 38%, rgba(239,68,68,0) 72%)`,
                            filter: "blur(1px)",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedDeviceId(device.deviceId)}
                          onMouseEnter={() => setHoveredDeviceId(device.deviceId)}
                          onMouseLeave={() => setHoveredDeviceId(null)}
                          onFocus={() => setHoveredDeviceId(device.deviceId)}
                          onBlur={() => setHoveredDeviceId(null)}
                          aria-label={`Select ${device.deviceId}; camera or sensor location ${formatLocation(device)}`}
                          aria-describedby={isHovered ? tooltipId : undefined}
                          className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg px-1.5 py-1 text-left transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${isSelected ? "ring-2 ring-cyan-300" : ""}`}
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <span className="mx-auto block size-3 rounded-full border border-white/80 bg-orange-300 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                          <span className="mt-1 block max-w-32 truncate whitespace-nowrap rounded-md border border-slate-700/80 bg-slate-950/90 px-2 py-1 text-[10px] text-slate-200 shadow-lg">
                            {device.deviceId} · {device.detectionCount}
                          </span>
                          {isHovered && (
                            <span
                              id={tooltipId}
                              role="tooltip"
                              className={`absolute ${tooltipPosition} ${tooltipVerticalPosition} z-30 w-52 rounded-lg border border-slate-700 bg-slate-950/95 p-3 text-left text-xs text-slate-200 shadow-xl`}
                            >
                              <span className="block font-semibold text-white">{device.deviceId}</span>
                              <span className="mt-1 block text-slate-400">Camera / sensor location</span>
                              <span className="mt-1 block font-mono tabular-nums text-cyan-200">{formatLocation(device)}</span>
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                  <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-950/85 px-3 py-2 text-[11px] text-slate-400">
                    <span>Lower intensity</span>
                    <span className="h-2 w-20 rounded-full bg-gradient-to-r from-orange-300/20 via-orange-400/60 to-rose-400" aria-hidden="true" />
                    <span>Higher</span>
                  </div>
                </>
              ) : (
                <div className="grid h-full place-items-center px-4 text-center text-sm text-slate-400">
                  Waiting for telemetry
                </div>
              )}
            </div>
          )}
        </div>

        <DeviceDetailCard
          device={selectedDevice}
          onClear={() => setSelectedDeviceId(null)}
        />
      </div>
    </div>
  );
}
