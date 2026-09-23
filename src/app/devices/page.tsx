"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import MockTelemetryLoader from "../components/MockTelemetryLoader";

export default function Devices() {
  const devices = Object.values(
    useDashboardStore((state) => state.devices)
  );

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    devices[0]?.deviceId ?? null
  );

  const selectedDevice = devices.find(
    (device) => device.deviceId === selectedDeviceId
  );

  return (
    <main className="min-h-screen bg-slate-900 p-6 text-white">
      <MockTelemetryLoader />

      {/* Page Heading */}
      <h1 className="text-3xl font-bold">
        Devices
      </h1>

      <p className="mt-2 text-slate-400">
        Monitor connected devices
      </p>

      {/* Device Table */}
      <div className="mt-6 overflow-hidden rounded-lg bg-slate-800 shadow-lg">
        <table className="w-full">

          <thead className="bg-slate-700">
            <tr>
              <th className="p-4 text-left">
                Device
              </th>

              <th className="p-4 text-left">
                Status
              </th>

              <th className="p-4 text-left">
                FPS
              </th>

              <th className="p-4 text-left">
                Latency
              </th>

            <th className="p-4 text-left">
                Detections
</th>

            </tr>
          </thead>

          <tbody>
            {devices.map((device) => (
              <tr
                key={device.deviceId}
                onClick={() =>
                  setSelectedDeviceId(device.deviceId)
                }
                className={`cursor-pointer border-t border-slate-700 ${
                  selectedDeviceId === device.deviceId
                    ? "bg-blue-700"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >

                {/* Device ID */}
                <td className="p-4 font-medium">
                  {device.deviceId}
                </td>

                {/* Status */}
                <td className="p-4">
                  {device.status === "offline" ? (
  <span className="text-red-400">
    ● Offline
  </span>
) : device.fps < 20 ? (
  <span className="text-yellow-400">
    ● Warning
  </span>
) : (
  <span className="text-green-400">
    ● Online
  </span>
)}
                  
                </td>

                {/* FPS */}
                <td className="p-4">
                  {device.fps}
                </td>

                {/* Latency */}
                <td className="p-4">
                  {device.latencyMs} ms
                </td>

                {/* Detections */}
<td className="p-4">
  {device.detectionCount}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Device Details */}
      {selectedDevice && (
        <div className="mt-6 rounded-lg bg-slate-800 p-6 shadow-lg">

          <h2 className="text-xl font-bold">
            Device Details
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* Device ID */}
            <div className="rounded-lg bg-slate-700 p-4">
              <p className="text-sm text-slate-400">
                Device ID
              </p>

              <p className="mt-2 text-xl font-bold">
                {selectedDevice.deviceId}
              </p>
            </div>

            {/* Status */}
            <div className="rounded-lg bg-slate-700 p-4">
              <p className="text-sm text-slate-400">
                Status
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
  selectedDevice.status === "offline"
    ? "text-red-400"
    : selectedDevice.fps < 20
    ? "text-yellow-400"
    : "text-green-400"
}`}
              >
                {selectedDevice.status === "offline"
  ? "Offline"
  : selectedDevice.fps < 20
  ? "Warning"
  : "Online"}
              </p>
            </div>

            {/* FPS */}
            <div className="rounded-lg bg-slate-700 p-4">
              <p className="text-sm text-slate-400">
                FPS
              </p>

              <p className="mt-2 text-xl font-bold">
                {selectedDevice.fps}
              </p>
            </div>

            {/* Latency */}
<div className="rounded-lg bg-slate-700 p-4">
  <p className="text-sm text-slate-400">
    Latency
  </p>

  <p className="mt-2 text-xl font-bold">
    {selectedDevice.latencyMs} ms
  </p>
</div>


            {/* Detections */}
            <div className="rounded-lg bg-slate-700 p-4">
              <p className="text-sm text-slate-400">
                Detections
              </p>

 

              <p className="mt-2 text-xl font-bold">
                {selectedDevice.detectionCount}
              </p>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
