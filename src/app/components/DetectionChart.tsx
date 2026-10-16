"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDetectionTrend } from "@/hooks/useAggregationEngine";

export default function DetectionChart() {
  const data = useDetectionTrend();

  if (data.length === 0) {
    return (
      <div className="grid h-72 place-items-center rounded-xl border border-dashed border-slate-800 bg-slate-950/45 px-4 text-center text-sm text-slate-400">
        Waiting for telemetry
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 8, left: -18, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 5" stroke="rgba(148,163,184,0.14)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp: number) =>
              new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#334155" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            labelFormatter={(timestamp) =>
              new Date(Number(timestamp)).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            }
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px",
              color: "#e2e8f0",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
            cursor={{ fill: "rgba(34,211,238,0.06)" }}
          />
          <Bar
            dataKey="detectionCount"
            name="Detections"
            fill="#22d3ee"
            radius={[5, 5, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
