"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import MockTelemetryLoader from "../components/MockTelemetryLoader";

export default function Alerts() {
  const alerts = useDashboardStore((state) => state.alerts);

  const [filter, setFilter] = useState("All");

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter((alert) =>
          filter === "Active"
            ? !alert.acknowledged
            : alert.acknowledged
        );

  return (
    <>
      <MockTelemetryLoader />

      <main className="min-h-screen bg-slate-900 p-6 text-white">
        {/* Heading */}
        <h1 className="text-3xl font-bold">
          Alerts
        </h1>

        <p className="mt-2 text-slate-400">
          Monitor system alerts and events
        </p>

        {/* Filter Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setFilter("All")}
            className={`rounded-lg px-4 py-2 ${
              filter === "All"
                ? "bg-blue-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("Active")}
            className={`rounded-lg px-4 py-2 ${
              filter === "Active"
                ? "bg-blue-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setFilter("Resolved")}
            className={`rounded-lg px-4 py-2 ${
              filter === "Resolved"
                ? "bg-blue-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Alerts Table */}
        <div className="mt-6 overflow-hidden rounded-lg bg-slate-800 shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-4 text-left">
                  Alert
                </th>

                <th className="p-4 text-left">
                  Rule
                </th>

                <th className="p-4 text-left">
                  Severity
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Value
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="border-t border-slate-700 hover:bg-slate-700"
                >
                  <td className="p-4">
                    {alert.ruleName}
                  </td>

                  <td className="p-4 text-slate-300">
                    {alert.ruleId}
                  </td>

                  <td className="p-4">
                    {alert.severity === "critical" && (
                      <span className="text-red-400">
                        ● Critical
                      </span>
                    )}

                    {alert.severity === "warning" && (
                      <span className="text-yellow-400">
                        ● Warning
                      </span>
                    )}

                    {alert.severity === "informational" && (
                      <span className="text-blue-400">
                        ● Informational
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {alert.acknowledged ? (
                      <span className="text-green-400">
                        Resolved
                      </span>
                    ) : (
                      <span className="text-orange-400">
                        Active
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-slate-300">
                    {alert.metricValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}