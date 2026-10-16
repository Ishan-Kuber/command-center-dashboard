"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import MockTelemetryLoader from "../components/MockTelemetryLoader";
import { Activity, Camera, Clock3, Crosshair, MapPin, Radio, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function Devices() {
  const devices = Object.values(useDashboardStore((state) => state.devices));
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(devices[0]?.deviceId ?? null);
  const selectedDevice = devices.find((device) => device.deviceId === selectedDeviceId);

  return (
    <main className="space-y-6">
      <MockTelemetryLoader />
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Operations / Fleet</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Devices</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">Inspect reported device health and telemetry details.</p>
        </div>
        <div className="w-fit rounded-xl border border-slate-800 bg-slate-900/75 px-4 py-3">
          <p className="text-xs text-slate-500">Devices represented</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-white">{devices.length}</p>
          <p className="text-[11px] text-slate-500">Current store view</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/75">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-white">Device inventory</h2>
            <p className="mt-1 text-sm text-slate-400">Select a row to view the current device details.</p>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-400">Status is based on latest report</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-6">Device</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">FPS</th>
                <th className="px-4 py-3 text-right font-medium">Latency</th>
                <th className="px-4 py-3 text-right font-medium sm:pr-6">Detections</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {devices.map((device) => {
                const selected = selectedDeviceId === device.deviceId;
                const status = device.status === "offline" ? "Offline · provisional" : device.fps < 20 ? "Warning" : "Online";
                const statusClass = device.status === "offline"
                  ? "border-slate-600 bg-slate-800/60 text-slate-300"
                  : device.fps < 20
                    ? "border-amber-300/20 bg-amber-300/5 text-amber-100/90"
                    : "border-emerald-300/20 bg-emerald-300/5 text-emerald-100/90";

                return (
                  <tr
                    key={device.deviceId}
                    onClick={() => setSelectedDeviceId(device.deviceId)}
                    aria-selected={selected}
                    className={`cursor-pointer transition-colors focus-within:bg-slate-800/70 ${selected ? "bg-cyan-400/[0.06]" : "hover:bg-slate-800/45"}`}
                  >
                    <td className="px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className={`grid size-9 place-items-center rounded-lg ${selected ? "bg-cyan-300/10 text-cyan-200" : "bg-slate-800 text-slate-400"}`}>
                          <Video className="size-4" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-medium text-slate-100">{device.deviceId}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}>{status}</span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-slate-300">{device.fps.toFixed(1)}</td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-slate-300">{device.latencyMs} <span className="text-slate-500">ms</span></td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums text-slate-200 sm:pr-6">{device.detectionCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {devices.length === 0 && (
          <div className="p-4 sm:p-6">
            <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 text-center">
              <div>
                <Radio className="mx-auto size-5 text-slate-500" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-slate-300">Waiting for telemetry</p>
                <p className="mt-1 text-xs text-slate-500">Device rows will appear when reports are present in the store.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {selectedDevice && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-4 sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Selected device</p>
              <h2 className="mt-1 text-xl font-semibold text-white">{selectedDevice.deviceId}</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400">
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

            <div className="rounded-xl border border-slate-800 bg-slate-950/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">Bounding box preview</p>
                  <p className="mt-1 text-xs text-slate-500">Preview area reserved for a frame source.</p>
                </div>
                <Crosshair className="size-4 text-slate-500" aria-hidden="true" />
              </div>
              <div className="mt-4 grid aspect-[16/8] min-h-36 place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 px-4 text-center">
                <div>
                  <Camera className="mx-auto size-5 text-slate-600" aria-hidden="true" />
                  <p className="mt-2 text-xs text-slate-500">Frame imagery is not included in the current telemetry state.</p>
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
    <div className="rounded-xl border border-slate-800 bg-slate-950/55 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 break-words text-base font-semibold tabular-nums text-slate-100">{value}</p>
    </div>
  );
}
