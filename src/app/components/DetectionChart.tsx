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
    <div className="min-w-48 rounded-xl border border-border bg-muted p-3 text-xs text-foreground shadow-2xl">
      <p className="font-semibold text-foreground">
        {new Date(bucketStart).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        <span className="mx-1 text-muted-foreground">–</span>
        {new Date(bucketEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
      <dl className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Detections</dt>
          <dd className="font-semibold tabular-nums text-primary">{point.detectionCount}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Devices reporting</dt>
          <dd className="font-semibold tabular-nums text-foreground">{deviceCount}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Avg. confidence</dt>
          <dd className="font-semibold tabular-nums text-foreground">
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
      <div className="grid h-72 place-items-center rounded-xl border border-dashed border-border bg-muted px-4 text-center text-sm text-muted-foreground">
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
          <CartesianGrid strokeDasharray="3 5" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp: number) =>
              new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={38}
          />
          <Tooltip
            content={<DetectionTooltip telemetryBuffer={telemetryBuffer} selectedWindow={selectedWindow} />}
            cursor={{ fill: "color-mix(in srgb, var(--primary) 9%, transparent)" }}
          />
          <Bar
            dataKey="detectionCount"
            name="Detections"
            fill="var(--chart-1)"
            radius={[5, 5, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
