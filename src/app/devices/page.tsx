"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import MockTelemetryLoader from "../components/MockTelemetryLoader";
import { hasAnyConnectionConfig } from "../connection-config";
import { Activity, Camera, Clock3, Crosshair, MapPin, Radio, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function Devices() {
  const devices = Object.values(useDashboardStore((state) => state.devices));
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(devices[0]?.deviceId ?? null);
  const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId);

  return (
    <main className="space-y-6">
      {!hasAnyConnectionConfig && <MockTelemetryLoader />}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Operations / Fleet</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Devices</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Inspect reported device health and telemetry details.</p>
        </div>
        <div className="w-fit rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Devices represented</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{devices.length}</p>
          <p className="text-[11px] text-muted-foreground">Current store view</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">Device inventory</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select a row to view the current device details.</p>
          </div>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">Status is based on latest report</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-6">Device</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">FPS</th>
                <th className="px-4 py-3 text-right font-medium">Latency</th>
                <th className="px-4 py-3 text-right font-medium sm:pr-6">Detections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {devices.map((device) => {
                const selected = selectedDeviceId === device.deviceId;
                const status = device.status === "offline" ? "Offline · provisional" : device.fps < 20 ? "Warning" : "Online";
                const statusClass = device.status === "offline"
                  ? "border-border bg-muted text-foreground/90"
                  : device.fps < 20
                    ? "cc-warning-border cc-warning-soft cc-warning"
                    : "cc-positive-border cc-positive-soft cc-positive";

                return (
                  <tr
                    key={device.deviceId}
                    onClick={() => setSelectedDeviceId(device.deviceId)}
                    aria-selected={selected}
                    className={`cursor-pointer transition-colors focus-within:bg-muted ${selected ? "bg-accent" : "hover:bg-muted"}`}
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className={`grid size-9 place-items-center rounded-lg ${selected ? "bg-accent text-primary" : "bg-muted text-muted-foreground"}`}>
                          <Video className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{device.deviceId}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}>{status}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground/90">{device.fps.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground/90">{device.latencyMs} <span className="text-muted-foreground">ms</span></td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground sm:pr-6">{device.detectionCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {devices.length === 0 && (
          <div className="p-4 sm:p-6">
            <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-border bg-muted px-4 text-center">
              <div>
                <Radio className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-foreground/90">Waiting for telemetry</p>
                <p className="mt-1 text-xs text-muted-foreground">Device rows will appear when reports are present in the store.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {selectedDevice && (
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-border pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Selected device</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">{selectedDevice.deviceId}</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {selectedDevice.location.lat.toFixed(4)}, {selectedDevice.location.lng.toFixed(4)}
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <DetailMetric label="Status" value={selectedDevice.status === "offline" ? "Offline · provisional" : selectedDevice.fps < 20 ? "Warning" : "Online"} icon={Activity} />
              <DetailMetric label="FPS" value={selectedDevice.fps.toFixed(1)} icon={Radio} />
              <DetailMetric label="Latency" value={`${selectedDevice.latencyMs} ms`} icon={Clock3} />
              <DetailMetric label="Detections" value={selectedDevice.detectionCount} icon={Crosshair} />
              <DetailMetric label="Avg. confidence" value={`${(selectedDevice.avgConfidence * 100).toFixed(1)}%`} icon={Activity} />
              <DetailMetric label="Last seen" value={new Date(selectedDevice.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} icon={Camera} />
            </div>

            <div className="rounded-xl border border-border bg-muted p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Bounding box preview</p>
                  <p className="mt-1 text-xs text-muted-foreground">Preview area reserved for a frame source.</p>
                </div>
                <Crosshair className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="mt-4 grid aspect-[16/8] min-h-36 place-items-center rounded-lg border border-dashed border-border bg-muted px-4 text-center">
                <div>
                  <Camera className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 text-xs text-muted-foreground">Frame imagery is not included in the current telemetry state.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function DetailMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 break-words text-base font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
