"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import DetectionChart from "./components/DetectionChart";
import MockTelemetryLoader from "./components/MockTelemetryLoader";
import dynamic from "next/dynamic";
import { useTelemetryInit } from "@/hooks/useTelemetryInit";

const HotspotMap = dynamic(() => import("./components/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-slate-900 animate-pulse rounded-lg flex items-center justify-center text-slate-400">
      Loading Hotspot Map...
    </div>
  ),
});

export default function Home() {

  useTelemetryInit({ useMock: true, mockIntervalMs: 1000 });
  

    const devices = useDashboardStore((state) => state.devices);

    const mqttConnected = useDashboardStore(
  (state) => state.mqttConnected
);

const wsConnected = useDashboardStore(
  (state) => state.wsConnected
);

      const deviceList = Object.values(devices);

  const totalDevices = deviceList.length;

  const onlineDevices = deviceList.filter(
    (device) => device.status === "online"
  ).length;

  const warningDevices = deviceList.filter(
  (device) => device.fps < 20
).length;

  const offlineDevices = deviceList.filter(
  (device) => device.status === "offline"
).length;

  const averageFps =
  deviceList.length > 0
    ? deviceList.reduce((total, device) => total + device.fps, 0) /
      deviceList.length
    : 0;

  const totalDetections = deviceList.reduce(
    (total, device) => total + device.detectionCount,
    0
  );



const highestActivityDevice = deviceList.reduce(
  (highest, device) =>
    device.detectionCount > highest.detectionCount
      ? device
      : highest,
  deviceList[0]
);

  const stats = [
  {
    title: "Total Devices",
    value: totalDevices,
    description: "Registered devices",
  },

    {
      title: "Online Devices",
      value: onlineDevices,
      description: "Currently connected",
    },
    {
  title: "Warning Devices",
  value: warningDevices,
  description: "Need attention",
},
    {
      title: "Total Detections",
      value: totalDetections,
      description: "Today's detections",
    },
  ];

  const hotspots = [
    {
      zone: "Zone A",
      detections: 86,
      severity: "High",
    },
    {
      zone: "Zone B",
      detections: 54,
      severity: "Medium",
    },
    {
      zone: "Zone C",
      detections: 31,
      severity: "Low",
    },
    {
      zone: "Zone D",
      detections: 72,
      severity: "High",
    },
  ];

  const highSeverityCount = hotspots.filter(
  (hotspot) => hotspot.severity === "High"
).length;

  const [selectedZone, setSelectedZone] = useState(hotspots[0]);

  return (
  <>
    <MockTelemetryLoader />

    <main className="min-h-screen bg-slate-900 p-6 text-white">

      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold">
          Command Center
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor devices, detections and system activity
        </p>
      </section>

      {/* Connection Status */}
<section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

  <div className="rounded-lg bg-slate-800 p-5 shadow-lg">
    <p className="text-sm text-slate-400">
      MQTT Connection
    </p>

    <p
      className={`mt-2 text-xl font-bold ${
        mqttConnected
          ? "text-green-400"
          : "text-red-400"
      }`}
    >
      {mqttConnected ? "● Connected" : "● Disconnected"}
    </p>
  </div>

  <div className="rounded-lg bg-slate-800 p-5 shadow-lg">
    <p className="text-sm text-slate-400">
      WebSocket Connection
    </p>

    <p
      className={`mt-2 text-xl font-bold ${
        wsConnected
          ? "text-green-400"
          : "text-red-400"
      }`}
    >
      {wsConnected ? "● Connected" : "● Disconnected"}
    </p>
  </div>

</section>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-lg bg-slate-800 p-5 shadow-lg"
          >
            <p className="text-sm text-slate-400">
              {stat.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {stat.value}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {stat.description}
            </p>
          </div>
        ))}
      </section>

      {/* Detection Chart */}
      <section className="mt-6 rounded-lg bg-slate-800 p-6 shadow-lg">
        <h2 className="text-xl font-bold">
          Detection Overview
        </h2>

        <p className="mt-2 text-slate-400">
          Detection statistics will appear here.
        </p>

        <div className="mt-6 rounded-lg bg-slate-700 p-4">
          <DetectionChart />
        </div>
      </section>

      {/* Device Status */}
      <section className="mt-6 rounded-lg bg-slate-800 p-6 shadow-lg">
        <h2 className="text-xl font-bold">
          Device Status
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-lg bg-slate-700 p-5">
            <p className="text-sm text-slate-400">
              Online
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {onlineDevices}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Devices connected
            </p>
          </div>

          <div className="rounded-lg bg-slate-700 p-5">
            <p className="text-sm text-slate-400">
              Offline
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {hotspots.length}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Devices disconnected
            </p>
          </div>

          <div className="rounded-lg bg-slate-700 p-5">
            <p className="text-sm text-slate-400">
              Average FPS
            </p>

            <p className="mt-2 text-3xl font-bold">
              {averageFps.toFixed(1)}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Across online devices
            </p>
          </div>

        </div>
      </section>

      {/* Hotspot Monitoring */}
      <section className="mt-6 rounded-lg bg-slate-800 p-6 shadow-lg">

        <h2 className="text-xl font-bold">
          Hotspot Monitoring
        </h2>

        <p className="mt-2 text-slate-400">
          Monitor areas with high detection activity
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-lg bg-slate-700 p-5">
            <p className="text-sm text-slate-400">
              Active Hotspots
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {totalDevices}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Currently detected
            </p>
          </div>

          <div className="rounded-lg bg-slate-700 p-5">
            <p className="text-sm text-slate-400">
              Highest Activity
            </p>

            <p className="mt-2 text-xl font-bold">
              {highestActivityDevice?.deviceId}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {highestActivityDevice?.detectionCount} detections
            </p>
          </div>

          <div className="rounded-lg bg-slate-700 p-5">
            <p className="text-sm text-slate-400">
              High Severity
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-400">
              {highSeverityCount}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Require attention
            </p>
          </div>

        </div>

        {/* Hotspot Table */}
        <div className="mt-4 overflow-hidden rounded-lg">
          <table className="w-full">

            <thead className="bg-slate-700">
              <tr>
                <th className="p-3 text-left">
                  Zone
                </th>

                <th className="p-3 text-left">
                  Detections
                </th>

                <th className="p-3 text-left">
                  Severity
                </th>
              </tr>
            </thead>

            <tbody>
              {hotspots.map((hotspot) => (
                <tr
                  key={hotspot.zone}
                  className="border-t border-slate-600"
                >
                  <td className="p-3">
                    {hotspot.zone}
                  </td>

                  <td className="p-3">
                    {hotspot.detections}
                  </td>

                  <td
                    className={`p-3 ${
                      hotspot.severity === "High"
                        ? "text-red-400"
                        : hotspot.severity === "Medium"
                        ? "text-orange-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {hotspot.severity}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </section>

      {/* Hotspot Map */}
<section className="mt-6 rounded-lg bg-slate-800 p-6 shadow-lg">

  <h2 className="text-xl font-bold">
    Hotspot Map
  </h2>

  <p className="mt-2 text-slate-400">
    Click a hotspot to view its details
  </p>

  <div className="relative mt-6 h-80 overflow-hidden rounded-lg">
    <HotspotMap />
  </div>

  {/* Selected Zone Information */}
  <div className="mt-4 rounded-lg bg-slate-700 p-5">

    <h3 className="text-lg font-bold">
      {selectedZone.zone}
    </h3>

    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">

      <div>
        <p className="text-sm text-slate-400">
          Detections
        </p>

        <p className="mt-1 text-2xl font-bold">
          {selectedZone.detections}
        </p>
      </div>

      <div>
        <p className="text-sm text-slate-400">
          Severity
        </p>

        <p
          className={`mt-1 text-2xl font-bold ${
            selectedZone.severity === "High"
              ? "text-red-400"
              : selectedZone.severity === "Medium"
              ? "text-orange-400"
              : "text-yellow-400"
          }`}
        >
          {selectedZone.severity}
        </p>
      </div>

    </div>
  </div>

</section>



      {/* Recent Alerts */}
      <section className="mt-6 rounded-lg bg-slate-800 p-6 shadow-lg">

        <h2 className="text-xl font-bold">
          Recent Alerts
        </h2>

        <div className="mt-4 space-y-3">

          <div className="rounded-lg bg-slate-700 p-4">
            <p className="font-medium">
              🔴 Hotspot detected
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Device DEV-001
            </p>
          </div>

          <div className="rounded-lg bg-slate-700 p-4">
            <p className="font-medium">
              🟡 Low FPS detected
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Device DEV-002
            </p>
          </div>

          <div className="rounded-lg bg-slate-700 p-4">
            <p className="font-medium">
              🔴 Device disconnected
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Device DEV-003
            </p>
          </div>

        </div>
      </section>

     </main>
  </>
  );
}
