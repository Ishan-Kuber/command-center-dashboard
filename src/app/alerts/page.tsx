"use client";

import { useState } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import MockTelemetryLoader from "../components/MockTelemetryLoader";
import { hasAnyConnectionConfig } from "../connection-config";
import { AlertTriangle, Bell, CircleCheck, Plus } from "lucide-react";

const filters = ["All", "Active", "Resolved"] as const;
type AlertFilter = (typeof filters)[number];

export default function Alerts() {
  const alerts = useDashboardStore((state) => state.alerts);
  const [filter, setFilter] = useState<AlertFilter>("All");

  const filteredAlerts =
    filter === "All"
      ? alerts
      : alerts.filter((alert) =>
          filter === "Active" ? !alert.acknowledged : alert.acknowledged,
        );
  const activeCount = alerts.filter((alert) => !alert.acknowledged).length;

  return (
    <>
      {!hasAnyConnectionConfig && <MockTelemetryLoader />}
      <main className="space-y-6">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Operations / Events</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Alerts</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Review rule events and acknowledgement status.</p>
          </div>
          <div className="w-fit rounded-xl border cc-warning-border cc-warning-soft px-4 py-3">
            <p className="text-xs cc-warning">Active alerts</p>
            <p className="mt-1 text-xl font-semibold tabular-nums cc-warning">{activeCount}</p>
            <p className="text-[11px] cc-warning">Provisional count</p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Alert history</h2>
                <p className="mt-1 text-sm text-muted-foreground">Counts are provisional and reflect the current store contents.</p>
              </div>
              <div className="inline-flex w-fit rounded-xl border border-border bg-muted p-1" role="group" aria-label="Filter alerts">
                {filters.map((filterOption) => (
                  <button
                    key={filterOption}
                    type="button"
                    onClick={() => setFilter(filterOption)}
                    aria-pressed={filter === filterOption}
                    className={`min-h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      filter === filterOption
                        ? "bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Alert</th>
                      <th className="px-4 py-3 font-medium">Rule</th>
                      <th className="px-4 py-3 font-medium">Severity</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAlerts.map((alert) => (
                      <tr key={alert.id} className="transition-colors hover:bg-muted">
                        <td className="px-4 py-3.5 font-medium text-foreground">{alert.ruleName}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{alert.ruleId}</td>
                        <td className="px-4 py-3.5">
                          <SeverityBadge severity={alert.severity} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-xs ${alert.acknowledged ? "text-muted-foreground" : "cc-warning"}`}>
                            {alert.acknowledged ? <CircleCheck className="size-3.5" aria-hidden="true" /> : <span className="size-1.5 rounded-full cc-warning-fill" aria-hidden="true" />}
                            {alert.acknowledged ? "Resolved" : "Active · provisional"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-foreground/90">{alert.metricValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredAlerts.length === 0 && (
                <div className="p-4">
                  <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-border bg-muted px-4 text-center">
                    <div>
                      <Bell className="mx-auto size-5 text-muted-foreground" aria-hidden="true" />
                      <p className="mt-3 text-sm font-medium text-foreground/90">{alerts.length === 0 ? "Waiting for telemetry" : `No ${filter.toLowerCase()} alerts`}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Alerts will appear here when present in the store.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Rules</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Create a rule</h2>
              </div>
              <span className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground"><Plus className="size-4" aria-hidden="true" /></span>
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground/90">
                <AlertTriangle className="size-4 text-muted-foreground" aria-hidden="true" />
                Rule editor area
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Space reserved for rule creation controls. No new rule behavior has been added.</p>
              <button type="button" disabled className="mt-4 inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm font-medium text-muted-foreground" aria-label="Create alert rule (not enabled)">
                <Plus className="size-4" aria-hidden="true" />
                Create alert rule
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Current alert filters and records remain connected to the existing dashboard store.</p>
          </aside>
        </section>
      </main>
    </>
  );
}

function SeverityBadge({ severity }: { severity: "critical" | "warning" | "informational" }) {
  const styles = {
    critical: "cc-critical-border cc-critical-soft cc-critical",
    warning: "cc-warning-border cc-warning-soft cc-warning",
    informational: "cc-info-border cc-info-soft cc-info",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[severity]}`}>{severity}</span>;
}
