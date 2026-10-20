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
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { TelemetryMessage } from "@/lib/types";

type TrendPoint = { timestamp: number; detectionCount: number };
type TooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: TrendPoint }>;
  telemetryBuffer: TelemetryMessage[];
  selectedWindow: number;
};

function DetectionTooltip({
  active,
  payload,
  telemetryBuffer,
  selectedWindow,
}: TooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const bucketSize = selectedWindow / 12;
  const bucketStart = point.timestamp - bucketSize / 2;
  const bucketEnd = bucketStart + bucketSize;
  const messages = telemetryBuffer.filter(
    (message) => message.timestamp >= bucketStart && message.timestamp < bucketEnd,
  );
  const deviceCount = new Set(messages.map((message) => message.deviceId)).size;
  const confidenceValues = messages.flatMap((message) =>
    message.detections.map((detection) => detection.confidence),
  );
  const averageConfidence = confidenceValues.length
    ? confidenceValues.reduce((sum, confidence) => sum + confidence, 0) / confidenceValues.length
    : null;

  return (
    <div className="min-w-48 rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs text-slate-200 shadow-2xl">
      <p className="font-semibold text-white">
        {new Date(bucketStart).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        <span className="mx-1 text-slate-500">–</span>
        {new Date(bucketEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-400">Detections</dt>
          <dd className="font-semibold tabular-nums text-cyan-200">{point.detectionCount}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-400">Devices reporting</dt>
          <dd className="font-semibold tabular-nums text-slate-100">{deviceCount}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-400">Avg. confidence</dt>
          <dd className="font-semibold tabular-nums text-slate-100">
            {averageConfidence === null ? "—" : `${(averageConfidence * 100).toFixed(1)}%`}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function DetectionChart() {
  const data = useDetectionTrend();
  const telemetryBuffer = useDashboardStore((state) => state.telemetryBuffer);
  const selectedWindow = useDashboardStore((state) => state.selectedTimeWindow);

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
            content={<DetectionTooltip telemetryBuffer={telemetryBuffer} selectedWindow={selectedWindow} />}
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
