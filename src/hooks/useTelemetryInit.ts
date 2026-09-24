"use client";
import { useEffect } from "react";
import { handleIncomingTelemetry } from "@/store/telemetryAdapter";
import { generateMock5bPayload } from "@/lib/mock5bEmitter";

interface TelemetryConfig {
  useMock?: boolean;
  mockIntervalMs?: number;
}

export function useTelemetryInit({ useMock = true, mockIntervalMs = 1000 }: TelemetryConfig = {}) {
  useEffect(() => {
    if (!useMock) return;

    // Generate sample 5B telemetry at interval
    const timer = setInterval(() => {
      const sampleFrame1 = generateMock5bPayload("cam-edge-01");
      const sampleFrame2 = generateMock5bPayload("cam-edge-02");

      handleIncomingTelemetry(sampleFrame1);
      handleIncomingTelemetry(sampleFrame2);
    }, mockIntervalMs);

    return () => clearInterval(timer);
  }, [useMock, mockIntervalMs]);
}