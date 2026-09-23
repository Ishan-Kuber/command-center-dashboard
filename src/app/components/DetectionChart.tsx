"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", detections: 180 },
  { day: "Tue", detections: 240 },
  { day: "Wed", detections: 310 },
  { day: "Thu", detections: 220 },
  { day: "Fri", detections: 360 },
  { day: "Sat", detections: 280 },
];

export default function DetectionChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#475569"
          />

          <XAxis
            dataKey="day"
            stroke="#cbd5e1"
          />

          <YAxis
            stroke="#cbd5e1"
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "white",
            }}
          />

          <Bar
            dataKey="detections"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}