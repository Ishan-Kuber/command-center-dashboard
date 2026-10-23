"use client";

import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { DeviceState } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  Camera,
  Clock3,
  MapPin,
  Radio,
  Signal,
  Wifi,
} from "lucide-react";
import DetectionChart from "./components/DetectionChart";
import MockTelemetryLoader from "./components/MockTelemetryLoader";
import dynamic from "next/dynamic";
import { useTelemetryInit } from "@/hooks/useTelemetryInit";
import { TIME_WINDOWS } from "@/lib/aggregation/time-window";
import { hasAnyConnectionConfig, hasMqttConfig, hasWebSocketConfig } from "./connection-config";

const HotspotMap = dynamic(() => import("./components/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[500px] w-full place-items-center rounded-xl bg-card text-sm text-muted-foreground">
      Loading hotspot map…
    </div>
  ),
});

const timeWindowOptions = [
  { label: "1m", value: TIME_WINDOWS.ONE_MINUTE },
  { label: "5m", value: TIME_WINDOWS.FIVE_MINUTES },
  { label: "15m", value: TIME_WINDOWS.FIFTEEN_MINUTES },
  { label: "1h", value: TIME_WINDOWS.ONE_HOUR },
  { label: "24h", value: TIME_WINDOWS.TWENTY_FOUR_HOURS },
];

function EmptyState({ message = "Waiting for telemetry" }: { message?: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-border bg-muted px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Home() {
  useTelemetryInit({ useMock: !hasAnyConnectionConfig, mockIntervalMs: 1000 });

  const devices = useDashboardStore((state) => state.devices);
  const mqttConnected = useDashboardStore((state) => state.mqttConnected);
  const wsConnected = useDashboardStore((state) => state.wsConnected);
  const alerts = useDashboardStore((state) => state.alerts);
  const selectedTimeWindow = useDashboardStore((state) => state.selectedTimeWindow);
  const selectTimeWindow = useDashboardStore((state) => state.selectTimeWindow);

  const deviceList = Object.values(devices);
  const totalDevices = deviceList.length;
  const onlineDevices = deviceList.filter((device) => device.status === "online").length;
  const offlineDevices = deviceList.filter((device) => device.status === "offline").length;
  const warningDevices = deviceList.filter((device) => device.fps < 20).length;
  const averageFps = totalDevices
    ? deviceList.reduce((total, device) => total + device.fps, 0) / totalDevices
    : 0;
  const totalDetections = deviceList.reduce((total, device) => total + device.detectionCount, 0);
  const hotspotDevices = deviceList.filter(
    (device) => device.detectionCount > 0 && device.location?.lat != null && device.location?.lng != null,
  );
  const highestActivityDevice = deviceList.reduce<DeviceState | null>(
    (highest, device) => (!highest || device.detectionCount > highest.detectionCount ? device : highest),
    null,
  );
  const activeAlertCount = alerts.filter((alert) => !alert.acknowledged).length;
  const recentAlerts = [...alerts].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);

  const stats = [
    {
      title: "Registered devices",
      value: totalDevices,
      detail: "Devices reporting to the dashboard",
      icon: Camera,
      iconClass: "bg-accent text-primary",
    },
    {
      title: "Online devices",
      value: onlineDevices,
      detail: "Latest reported device status",
      icon: Signal,
      iconClass: "cc-positive-soft cc-positive",
    },
    {
      title: "Low-FPS warnings",
      value: warningDevices,
      detail: "Devices below the existing FPS threshold",
      icon: AlertTriangle,
      iconClass: "cc-warning-soft cc-warning",
    },
    {
      title: "Reported detections",
      value: totalDetections,
      detail: "Current device totals · provisional",
      icon: Activity,
      iconClass: "bg-accent text-primary",
    },
  ];

  return (
    <>
      {!hasAnyConnectionConfig && <MockTelemetryLoader />}

      <main className="space-y-6">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Operations / Overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              A live view of device health, telemetry, alerts, and mapped activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ConnectionCard label="MQTT" connected={mqttConnected} configured={hasMqttConfig} icon={Radio} />
            <ConnectionCard label="WebSocket" connected={wsConnected} configured={hasWebSocketConfig} icon={Wifi} />
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-sm font-medium text-foreground">Time window</p>
            <p className="mt-1 text-xs text-muted-foreground">Choose the interval used by the existing telemetry aggregation.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-border bg-muted p-1" role="group" aria-label="Time window options">
            {timeWindowOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => selectTimeWindow(option.value)}
                aria-pressed={selectedTimeWindow === option.value}
                className={`min-w-10 rounded-lg px-2.5 py-1.5 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedTimeWindow === option.value
                    ? "border border-primary/25 bg-accent text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Dashboard metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.title} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{stat.value}</p>
                  </div>
                  <span className={`grid size-10 place-items-center rounded-xl ${stat.iconClass}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{stat.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <article className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Telemetry</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Detection activity</h2>
                <p className="mt-1 text-sm text-muted-foreground">Counts from the selected store aggregation window.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {timeWindowOptions.find((option) => option.value === selectedTimeWindow)?.label ?? "Current window"}
              </span>
            </div>
            <DetectionChart />
          </article>

          <article className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Fleet health</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Device status</h2>
              <p className="mt-1 text-sm text-muted-foreground">Summary of latest device reports.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MetricTile label="Online" value={onlineDevices} tone="cc-positive" />
              <MetricTile label="Offline" value={offlineDevices} tone="text-foreground/90" note="Provisional" />
              <MetricTile label="Average FPS" value={averageFps.toFixed(1)} tone="text-foreground" />
              <MetricTile label="Active alerts" value={activeAlertCount} tone="cc-warning" note="Provisional" />
            </div>
            <div className="mt-4 rounded-xl border border-border bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                <Activity className="size-4 text-primary" aria-hidden="true" />
                Current fleet
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {totalDevices > 0
                  ? `${totalDevices} device${totalDevices === 1 ? "" : "s"} currently represented in telemetry.`
                  : "Waiting for telemetry"}
              </p>
            </div>
          </article>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Location intelligence</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Hotspot monitoring</h2>
              <p className="mt-1 text-sm text-muted-foreground">Activity is derived from devices with reported locations and detections.</p>
            </div>
            <span className="w-fit rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              {hotspotDevices.length} sources · provisional
            </span>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)]">
            <div className="min-w-0 overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Device</th>
                      <th className="px-4 py-3 font-medium">Location</th>
                      <th className="px-4 py-3 text-right font-medium">Detections</th>
                      <th className="px-4 py-3 text-right font-medium">Last seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {hotspotDevices.map((device) => (
                      <tr key={device.deviceId} className="transition-colors hover:bg-muted">
                        <td className="px-4 py-3 font-medium text-foreground">{device.deviceId}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-muted-foreground" aria-hidden="true" />{device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">{device.detectionCount}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatTimestamp(device.lastSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hotspotDevices.length === 0 && (
                <div className="p-4">
                  <EmptyState message={totalDevices === 0 ? "Waiting for telemetry" : "No detection hotspots currently reported."} />
                </div>
              )}
            </div>

            <aside className="rounded-xl border border-border bg-muted p-5" aria-label="Hotspot details">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                Hotspot details
              </div>
              {highestActivityDevice ? (
                <>
                  <p className="mt-5 text-xl font-semibold text-foreground">{highestActivityDevice.deviceId}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Highest reported detection count</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">Detections</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{highestActivityDevice.detectionCount}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-3">
                      <p className="text-xs text-muted-foreground">FPS</p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{highestActivityDevice.fps.toFixed(1)}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    Location: {highestActivityDevice.location.lat.toFixed(4)}, {highestActivityDevice.location.lng.toFixed(4)}
                  </p>
                </>
              ) : (
                <div className="mt-4"><EmptyState /></div>
              )}
            </aside>
          </div>

          <div className="relative z-0 isolate mt-5 overflow-hidden rounded-xl border border-border bg-muted">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Device map</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Select markers to inspect the existing device popups.</p>
              </div>
              <span className="text-xs text-muted-foreground">{totalDevices} devices · provisional</span>
            </div>
            <div className="relative z-0 isolate p-3">
              <HotspotMap />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Event stream</p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Recent alerts</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest alert records from the existing store.</p>
            </div>
            <span className="rounded-full border cc-warning-border cc-warning-soft px-3 py-1.5 text-xs cc-warning">Counts provisional</span>
          </div>
          {recentAlerts.length > 0 ? (
            <div className="divide-y divide-border">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={`mt-0.5 size-2 shrink-0 rounded-full ${alert.severity === "critical" ? "cc-critical-soft" : alert.severity === "warning" ? "cc-warning-soft" : "cc-info-soft"}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{alert.ruleName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Rule {alert.ruleId} · {alert.acknowledged ? "Acknowledged" : "Active"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 pl-5 text-xs text-muted-foreground sm:pl-0">
                    <span className="tabular-nums">Value {alert.metricValue.toFixed(2)}</span>
                    <time dateTime={new Date(alert.timestamp).toISOString()}>{formatTimestamp(alert.timestamp)}</time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message={totalDevices === 0 ? "Waiting for telemetry" : "No alerts currently reported."} />
          )}
        </section>
      </main>
    </>
  );
}

function ConnectionCard({
  label,
  connected,
  configured,
  icon: Icon,
}: {
  label: string;
  connected: boolean;
  configured: boolean;
  icon: typeof Radio;
}) {
  const statusLabel = connected ? "Connected" : configured ? "Not connected" : "Not configured";
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className={`grid size-9 place-items-center rounded-lg ${connected ? "cc-positive-soft cc-positive" : configured ? "cc-warning-soft cc-warning" : "bg-muted text-muted-foreground"}`}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`mt-0.5 text-sm font-medium ${connected ? "cc-positive" : configured ? "cc-warning" : "text-muted-foreground"}`}>
          {statusLabel}
        </p>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone,
  note,
}: {
  label: string;
  value: string | number;
  tone: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
      {note && <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}
