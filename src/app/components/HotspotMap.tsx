"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Circle as LeafletCircle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import { Flame, Map as MapIcon, MapPin, X } from "lucide-react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { DeviceState } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type MapMode = "street" | "intensity";

function formatTimestamp(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return "Unavailable";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unavailable";
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

function deviceStateClass(device: DeviceState): string {
  if (device.status === "offline") return "cc-neutral";
  if (device.fps < 20) return "cc-warning";
  return "cc-positive";
}

function deviceStateLabel(device: DeviceState): string {
  if (device.status === "offline") return "Offline · provisional";
  if (device.fps < 20) return "Reported online · low FPS";
  return "Online · latest report";
}

function createDeviceIcon(device: DeviceState, selected: boolean): L.DivIcon {
  const markerState = device.status === "offline"
    ? "offline"
    : device.fps < 20
      ? "warning"
      : "online";
  const selectedClass = selected ? " cc-map-marker--selected" : "";
  return L.divIcon({
    className: "cc-map-marker-wrap",
    html: `<span class="cc-map-marker cc-map-marker--${markerState}${selectedClass}" aria-hidden="true"></span>`,
    iconSize: [29, 30],
    iconAnchor: [14, 29],
    tooltipAnchor: [0, -26],
  });
}

function DevicePreview({
  device,
  onMoreDetails,
}: {
  device: DeviceState;
  onMoreDetails: (deviceId: string) => void;
}) {
  return (
    <div className="min-w-48 space-y-2 p-3 text-xs text-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{device.deviceId}</p>
          <p className="mt-1 text-muted-foreground">Camera / sensor</p>
        </div>
        <span className={`shrink-0 text-[11px] font-medium ${deviceStateClass(device)}`}>
          {device.status === "offline" ? "Offline" : device.fps < 20 ? "Low FPS" : "Online"}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t border-border pt-2 text-[11px]">
        <dt className="text-muted-foreground">FPS</dt>
        <dd className="text-right font-medium tabular-nums text-foreground">{device.fps.toFixed(1)}</dd>
        <dt className="text-muted-foreground">Last seen</dt>
        <dd className="text-right tabular-nums text-foreground">{formatTimestamp(device.lastSeen)}</dd>
      </dl>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onMoreDetails(device.deviceId);
        }}
        className="inline-flex min-h-8 w-full items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        More details
      </button>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 border-b border-border py-3 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function DeviceDetailsDrawer({
  device,
  drawerRef,
  onClose,
}: {
  device: DeviceState;
  drawerRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const detections = device.detections ?? [];
  const lastSeenDate = Number.isFinite(device.lastSeen) ? new Date(device.lastSeen) : null;
  const lastSeenIso = lastSeenDate && !Number.isNaN(lastSeenDate.getTime())
    ? lastSeenDate.toISOString()
    : undefined;

  return (
    <aside
      ref={drawerRef}
      role="dialog"
      aria-label={`Details for device ${device.deviceId}`}
      className="cc-device-drawer flex max-h-dvh flex-col overflow-hidden border-border bg-card shadow-2xl"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Selected camera / sensor</p>
          <h3 className="mt-1 break-all text-lg font-semibold tracking-tight text-foreground">{device.deviceId}</h3>
        </div>
        <button
          type="button"
          data-close-details
          onClick={onClose}
          aria-label="Close device details"
          className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <span className="text-xs text-muted-foreground">Latest reported state</span>
          <span className={`text-xs font-semibold ${deviceStateClass(device)}`}>{deviceStateLabel(device)}</span>
        </div>

        <section className="pt-4" aria-labelledby="device-location-heading">
          <h4 id="device-location-heading" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" /> Location
          </h4>
          <p className="mt-2 font-mono text-sm tabular-nums text-foreground">{formatLocation(device)}</p>
        </section>

        <section className="mt-5" aria-labelledby="device-health-heading">
          <h4 id="device-health-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reported health</h4>
          <dl className="mt-1 grid grid-cols-2 gap-x-5">
            <DetailValue label="Frames per second" value={device.fps.toFixed(1)} />
            <DetailValue label="Latency" value={`${device.latencyMs} ms`} />
            <DetailValue label="Detections · latest report" value={device.detectionCount} />
            <DetailValue label="Average confidence" value={device.avgConfidence > 0 ? `${(device.avgConfidence * 100).toFixed(1)}%` : "Unavailable"} />
            <DetailValue
              label="Last seen"
              value={lastSeenIso ? formatTimestamp(device.lastSeen) : "Unavailable"}
            />
          </dl>
          {lastSeenIso && <time className="sr-only" dateTime={lastSeenIso}>{lastSeenIso}</time>}
        </section>

        <section className="mt-5" aria-labelledby="device-detections-heading">
          <div className="flex items-center justify-between gap-3">
            <h4 id="device-detections-heading" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest detection details</h4>
            <span className="text-xs tabular-nums text-muted-foreground">{detections.length}</span>
          </div>
          {detections.length > 0 ? (
            <ul className="mt-2 divide-y divide-border border-y border-border">
              {detections.map((detection, index) => (
                <li key={`${detection.classLabel}-${index}`} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{detection.classLabel}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{(detection.confidence * 100).toFixed(1)}% confidence</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    Box: x {detection.boundingBox.x}, y {detection.boundingBox.y}, w {detection.boundingBox.width}, h {detection.boundingBox.height}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 border-y border-border py-3 text-sm text-muted-foreground">No detection details in the latest report.</p>
          )}
        </section>
      </div>

      <footer className="border-t border-border px-5 py-3 text-[11px] leading-5 text-muted-foreground">
        Values reflect the latest available device report; offline state is provisional.
      </footer>
    </aside>
  );
}

export default function HotspotMap() {
  const devices = useDashboardStore((state) => state.devices);
  const deviceList = useMemo(() => Object.values(devices || {}), [devices]);
  const [mode, setMode] = useState<MapMode>("street");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [hoveredDeviceId, setHoveredDeviceId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

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

  const openDetails = useCallback((deviceId: string) => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setSelectedDeviceId(deviceId);
    setDrawerOpen(true);
  }, []);

  const closeDetails = useCallback(() => {
    setDrawerOpen(false);
    setSelectedDeviceId(null);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const panel = drawerRef.current;
    const closeButton = panel?.querySelector<HTMLButtonElement>("[data-close-details]");
    closeButton?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetails();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [drawerOpen, selectedDeviceId, closeDetails]);

  const defaultCenter: [number, number] = [18.5204, 73.8567];
  const locationEmptyMessage = deviceList.length === 0
    ? "Waiting for telemetry"
    : "Location unavailable for reported devices";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-md border border-border bg-muted p-1" role="group" aria-label="Map display mode">
          <button
            type="button"
            onClick={() => setMode("street")}
            aria-pressed={mode === "street"}
            className={`inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === "street" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MapIcon className="size-4" aria-hidden="true" /> Street
          </button>
          <button
            type="button"
            onClick={() => setMode("intensity")}
            aria-pressed={mode === "intensity"}
            className={`inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mode === "intensity" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Flame className="size-4" aria-hidden="true" /> Intensity
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "street"
            ? "Interactive map · reported device locations"
            : "Relative device positions · intensity follows latest reported detections"}
        </p>
      </div>

      <div className="relative z-0 isolate h-[500px] min-w-0 w-full overflow-hidden rounded-lg border border-border bg-background">
        {mode === "street" ? (
          <>
            <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {locatedDevices.map((device) => {
                const selected = device.deviceId === selectedDeviceId;
                const circleColor = device.detectionCount >= 2 ? "var(--cc-critical)" : "var(--cc-positive)";
                return (
                  <Fragment key={device.deviceId}>
                    <LeafletCircle
                      center={[device.location.lat, device.location.lng]}
                      radius={200}
                      pathOptions={{ fillOpacity: 0.2, weight: 1.5, fillColor: circleColor, color: circleColor }}
                    />
                    <Marker
                    position={[device.location.lat, device.location.lng]}
                    icon={createDeviceIcon(device, selected)}
                    keyboard
                    title={`${device.deviceId}, camera or sensor at ${formatLocation(device)}`}
                    alt={`${device.deviceId}, camera or sensor at ${formatLocation(device)}`}
                    eventHandlers={{ click: () => setSelectedDeviceId(device.deviceId) }}
                  >
                    <LeafletTooltip direction="top" interactive className="cc-map-tooltip">
                      <DevicePreview device={device} onMoreDetails={openDetails} />
                    </LeafletTooltip>
                    <Popup>
                      <DevicePreview device={device} onMoreDetails={openDetails} />
                    </Popup>
                    </Marker>
                  </Fragment>
                );
              })}
            </MapContainer>
            {locatedDevices.length === 0 && (
              <div className="pointer-events-none absolute inset-0 z-[400] grid place-items-center">
                <span className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-lg" role="status">
                  {locationEmptyMessage}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="cc-intensity-map relative h-full w-full overflow-hidden" role="group" aria-label="Telemetry intensity view of device locations">
            {intensityPoints.length > 0 ? (
              <>
                {intensityPoints.map(({ device, x, y, intensity }) => {
                  const isSelected = device.deviceId === selectedDeviceId;
                  const isHovered = device.deviceId === hoveredDeviceId;
                  const tooltipHorizontal = x < 24 ? "left-0" : x > 76 ? "right-0" : "left-1/2 -translate-x-1/2";
                  const tooltipVertical = y < 32 ? "top-full mt-2" : "bottom-full mb-2";
                  const heatStrength = Math.round(12 + intensity * 30);
                  const heatFade = Math.round(8 + intensity * 20);
                  return (
                    <div
                      key={device.deviceId}
                      className="absolute z-10"
                      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
                      onMouseEnter={() => setHoveredDeviceId(device.deviceId)}
                      onMouseLeave={() => setHoveredDeviceId(null)}
                      onFocusCapture={() => setHoveredDeviceId(device.deviceId)}
                      onBlurCapture={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoveredDeviceId(null);
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 block rounded-full"
                        style={{
                          width: `${72 + intensity * 132}px`,
                          height: `${72 + intensity * 132}px`,
                          transform: "translate(-50%, -50%)",
                          background: `radial-gradient(circle, color-mix(in oklch, var(--cc-warning) ${heatStrength}%, transparent) 0%, color-mix(in oklch, var(--cc-critical) ${heatFade}%, transparent) 42%, transparent 74%)`,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDeviceId(device.deviceId);
                          setHoveredDeviceId(device.deviceId);
                        }}
                        aria-label={`Show summary for ${device.deviceId}, camera or sensor at ${formatLocation(device)}`}
                        aria-expanded={isHovered}
                        className={`relative z-10 grid size-8 place-items-center rounded-full border-2 bg-primary text-[10px] font-semibold text-primary-foreground shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isSelected ? "outline outline-2 outline-primary outline-offset-2" : "border-card"}`}
                      >
                        <MapPin className="size-4" aria-hidden="true" />
                      </button>
                      {isHovered && (
                        <div
                          role="group"
                          aria-label={`Preview for ${device.deviceId}`}
                          className={`absolute ${tooltipHorizontal} ${tooltipVertical} z-30 w-56 rounded-lg border border-border bg-card text-foreground shadow-xl`}
                        >
                          <DevicePreview device={device} onMoreDetails={openDetails} />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-border bg-card/95 px-3 py-2 text-[11px] text-muted-foreground shadow-sm">
                  <span>Lower intensity</span>
                  <span className="h-2 w-16 rounded-full" style={{ background: "linear-gradient(90deg, var(--cc-positive), var(--cc-warning), var(--cc-critical))" }} aria-hidden="true" />
                  <span>Higher</span>
                </div>
              </>
            ) : (
              <div className="grid h-full place-items-center px-4 text-center text-sm text-muted-foreground" role="status">
                {locationEmptyMessage}
              </div>
            )}
          </div>
        )}

        {drawerOpen && selectedDevice && (
          <>
            <button
              type="button"
              aria-label="Close device details"
              onClick={closeDetails}
              className="absolute inset-0 z-[690] bg-black/25"
            />
            <DeviceDetailsDrawer device={selectedDevice} drawerRef={drawerRef} onClose={closeDetails} />
          </>
        )}
      </div>
    </div>
  );
}
