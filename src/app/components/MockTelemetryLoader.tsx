"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import { loadMockTelemetry } from "@/lib/mock/telemetry";

export default function MockTelemetryLoader() {
  const processTelemetry = useDashboardStore(
    (state) => state.processTelemetry
  );

  useEffect(() => {
    loadMockTelemetry(processTelemetry);
  }, [processTelemetry]);

  return null;
}
