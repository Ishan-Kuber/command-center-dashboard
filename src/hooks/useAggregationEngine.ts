import { useMemo } from "react";
import { useDashboardStore } from "../lib/store/dashboardStore";
import { TIME_WINDOWS } from "../lib/aggregation/time-window";
import {
  countAlertsBySeverity,
  partitionAlerts,
  getLatestAlertPerRule,
} from "../lib/alerts/management";

export function useCurrentAggregation() {
  const aggregations = useDashboardStore((s) => s.aggregations);
  const selectedWindow = useDashboardStore((s) => s.selectedTimeWindow);
  return useMemo(
    () => aggregations[selectedWindow] || null,
    [aggregations, selectedWindow],
  );
}

export function useAggregationByWindow(windowMs: number) {
  const aggregations = useDashboardStore((s) => s.aggregations);
  return useMemo(
    () => aggregations[windowMs] || null,
    [aggregations, windowMs],
  );
}

export function useAllAggregations() {
  const aggregations = useDashboardStore((s) => s.aggregations);
  return useMemo(() => {
    const windows = Object.values(TIME_WINDOWS);
    return windows.map((w) => ({
      windowMs: w,
      label: getWindowLabel(w),
      metrics: aggregations[w],
    }));
  }, [aggregations]);
}

export function useAlertStats() {
  const alerts = useDashboardStore((s) => s.alerts);
  const unacknowledgedCount = useDashboardStore((s) =>
    s.getUnacknowledgedAlertCount(),
  );
  return useMemo(() => {
    const bySeverity = countAlertsBySeverity(alerts);
    const { acknowledged, unacknowledged } = partitionAlerts(alerts);
    return {
      total: alerts.length,
      unacknowledged: unacknowledgedCount,
      acknowledged: acknowledged.length,
      critical: bySeverity.critical,
      warning: bySeverity.warning,
      informational: bySeverity.informational,
    };
  }, [alerts, unacknowledgedCount]);
}

export function useActiveAlerts() {
  const alerts = useDashboardStore((s) => s.alerts);
  return useMemo(
    () =>
      alerts
        .filter((a) => !a.acknowledged)
        .sort((a, b) => b.timestamp - a.timestamp),
    [alerts],
  );
}

export function useAlertsBySeverity() {
  const alerts = useDashboardStore((s) => s.alerts);
  return useMemo(
    () => ({
      critical: alerts.filter((a) => a.severity === "critical"),
      warning: alerts.filter((a) => a.severity === "warning"),
      informational: alerts.filter((a) => a.severity === "informational"),
    }),
    [alerts],
  );
}

export function useLatestAlertsPerRule() {
  const alerts = useDashboardStore((s) => s.alerts);
  return useMemo(() => getLatestAlertPerRule(alerts), [alerts]);
}

export function useDetectionMetrics() {
  const currentAgg = useCurrentAggregation();
  return useMemo(() => {
    if (!currentAgg) return null;
    return {
      count: currentAgg.detectionCount,
      rate: currentAgg.detectionRate.toFixed(2),
      avgConfidence: currentAgg.avgConfidence.toFixed(2),
      minConfidence: currentAgg.confidenceMin.toFixed(2),
      maxConfidence: currentAgg.confidenceMax.toFixed(2),
    };
  }, [currentAgg]);
}

export function useConfidenceDistribution() {
  const currentAgg = useCurrentAggregation();
  return useMemo(() => {
    if (!currentAgg) return [];
    const labels = Array.from({ length: 10 }, (_, i) => {
      const start = (i / 10).toFixed(1);
      const end = ((i + 1) / 10).toFixed(1);
      return `${start}-${end}`;
    });
    return { labels, data: currentAgg.confidenceDistribution };
  }, [currentAgg]);
}

export function useDetectionTrend() {
  const buffer = useDashboardStore((s) => s.telemetryBuffer);
  const selectedWindow = useDashboardStore((s) => s.selectedTimeWindow);

  return useMemo(() => {
    if (!buffer.length) return [];
    const windowStart = Date.now() - selectedWindow;
    const filtered = buffer.filter((m) => m.timestamp >= windowStart);
    if (!filtered.length) return [];

    const bucketCount = 12;
    const bucketSize = selectedWindow / bucketCount;
    const buckets: Array<{ timestamp: number; detectionCount: number }> = [];

    for (let i = 0; i < bucketCount; i++) {
      buckets.push({
        timestamp: windowStart + i * bucketSize + bucketSize / 2,
        detectionCount: 0,
      });
    }

    for (const msg of filtered) {
      const bucketIdx = Math.min(
        Math.floor((msg.timestamp - windowStart) / bucketSize),
        bucketCount - 1,
      );
      buckets[bucketIdx].detectionCount += msg.detections.length;
    }

    return buckets;
  }, [buffer, selectedWindow]);
}

export function useDeviceStatus() {
  const devices = useDashboardStore((s) => s.devices);
  const offlineTimeout = useDashboardStore((s) => s.offlineTimeoutMs);

  return useMemo(() => {
    const now = Date.now();
    const online = Object.values(devices).filter((d) => {
      if (d.status === "offline") return false;
      if (now - d.lastSeen > offlineTimeout) return false;
      return true;
    });
    return {
      online: online.length,
      offline: Object.keys(devices).length - online.length,
      total: Object.keys(devices).length,
    };
  }, [devices, offlineTimeout]);
}

export function getWindowLabel(windowMs: number): string {
  const labels: Record<number, string> = {
    [TIME_WINDOWS.ONE_MINUTE]: "1m",
    [TIME_WINDOWS.FIVE_MINUTES]: "5m",
    [TIME_WINDOWS.FIFTEEN_MINUTES]: "15m",
    [TIME_WINDOWS.ONE_HOUR]: "1h",
    [TIME_WINDOWS.TWENTY_FOUR_HOURS]: "24h",
  };
  return labels[windowMs] || `${windowMs}ms`;
}

export function useDashboardActions() {
  return useDashboardStore((s) => ({
    processTelemetry: s.processTelemetry,
    selectTimeWindow: s.selectTimeWindow,
    computeAggregations: s.computeAggregations,
    addAlertRule: s.addAlertRule,
    deleteAlertRule: s.deleteAlertRule,
    acknowledgeAlert: s.acknowledgeAlert,
    silenceAlertRule: s.silenceAlertRule,
    getUnacknowledgedCount: s.getUnacknowledgedAlertCount,
  }));
}
