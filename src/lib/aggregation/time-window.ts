const BASE_DELAY_MS = 1000;

export interface TimeWindowMetrics {
  windowMs: number;
  detectionCount: number;
  detectionRate: number;
  confidenceDistribution: number[];
  avgConfidence: number;
  confidenceMin: number;
  confidenceMax: number;
  topConfidences: number[];
  timestamp: number;
}

export function aggregateByTimeWindow(
  messages: any[],
  windowMs: number,
  currentTime: number = Date.now(),
): TimeWindowMetrics {
  const windowStart = currentTime - windowMs;
  const inWindow = messages.filter((m) => m.timestamp >= windowStart);
  const allDetections = inWindow.flatMap((m) => m.detections);

  const detectionCount = allDetections.length;
  const windowSeconds = windowMs / 1000;
  const detectionRate = detectionCount / windowSeconds;

  const confidences = allDetections.map((d) => d.confidence);
  const avgConfidence =
    confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

  const confidenceMin = confidences.length > 0 ? Math.min(...confidences) : 0;
  const confidenceMax = confidences.length > 0 ? Math.max(...confidences) : 0;
  const topConfidences = confidences.sort((a, b) => b - a).slice(0, 5);
  const histogram = computeHistogram(confidences, 10);

  return {
    windowMs,
    detectionCount,
    detectionRate,
    confidenceDistribution: histogram,
    avgConfidence,
    confidenceMin,
    confidenceMax,
    topConfidences,
    timestamp: currentTime,
  };
}

export function computeHistogram(
  values: number[],
  bucketCount: number = 10,
): number[] {
  const buckets = new Array(bucketCount).fill(0);
  for (const value of values) {
    const clamped = Math.max(0, Math.min(1, value));
    const bucketIndex = Math.min(
      Math.floor(clamped * bucketCount),
      bucketCount - 1,
    );
    buckets[bucketIndex]++;
  }
  return buckets;
}

export const TIME_WINDOWS = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  TWENTY_FOUR_HOURS: 24 * 60 * 60 * 1000,
} as const;

export function aggregateAllTimeWindows(
  messages: any[],
  currentTime: number = Date.now(),
): Record<number, TimeWindowMetrics> {
  const windows = Object.values(TIME_WINDOWS);
  const result: Record<number, TimeWindowMetrics> = {};
  for (const windowMs of windows) {
    result[windowMs] = aggregateByTimeWindow(messages, windowMs, currentTime);
  }
  return result;
}

export function aggregateByDeviceAndWindow(
  deviceId: string,
  messages: any[],
  windowMs: number,
  currentTime: number = Date.now(),
): TimeWindowMetrics {
  const deviceMessages = messages.filter((m) => m.deviceId === deviceId);
  return aggregateByTimeWindow(deviceMessages, windowMs, currentTime);
}

export function computeDetectionTrend(
  messages: any[],
  bucketCount: number = 60,
  windowMs: number = TIME_WINDOWS.ONE_HOUR,
  currentTime: number = Date.now(),
): Array<{ timestamp: number; detectionCount: number; avgConfidence: number }> {
  const windowStart = currentTime - windowMs;
  const bucketSizeMs = windowMs / bucketCount;
  const buckets: Array<{ timestamp: number; detections: any[] }> = [];

  for (let i = 0; i < bucketCount; i++) {
    buckets.push({
      timestamp: windowStart + i * bucketSizeMs + bucketSizeMs / 2,
      detections: [],
    });
  }

  for (const message of messages) {
    if (message.timestamp >= windowStart && message.timestamp <= currentTime) {
      const bucketIndex = Math.min(
        Math.floor((message.timestamp - windowStart) / bucketSizeMs),
        bucketCount - 1,
      );
      buckets[bucketIndex].detections.push(...message.detections);
    }
  }

  return buckets.map((bucket) => ({
    timestamp: bucket.timestamp,
    detectionCount: bucket.detections.length,
    avgConfidence:
      bucket.detections.length > 0
        ? bucket.detections.reduce((sum, d) => sum + d.confidence, 0) /
          bucket.detections.length
        : 0,
  }));
}
