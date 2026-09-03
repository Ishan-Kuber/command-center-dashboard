// Telemetry message from edge devices
export interface TelemetryMessage {
  deviceId: string;
  timestamp: number; // Unix ms
  location: { lat: number; lng: number };
  detections: Detection[];
  metrics: DeviceMetrics;
}

export interface Detection {
  classLabel: string;
  confidence: number; // 0-1
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DeviceMetrics {
  fps: number;
  latencyMs: number;
  status: 'online' | 'offline';
}

// Dashboard state
export interface DeviceState {
  deviceId: string;
  status: 'online' | 'offline';
  lastSeen: number;
  fps: number;
  latencyMs: number;
  location: { lat: number; lng: number };
  detections: Detection[];
  detectionCount: number;
  avgConfidence: number;
}

// Alert system
export interface AlertRule {
  id: string;
  name: string;
  metricType: 'detection_count' | 'confidence' | 'detection_rate';
  operator: 'gt' | 'lt' | 'gte' | 'lte';
  threshold: number;
  timeWindowMs: number;
  severity: 'critical' | 'warning' | 'informational';
  silencedUntil: number | null;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: number;
  severity: 'critical' | 'warning' | 'informational';
  metricValue: number;
  acknowledged: boolean;
  acknowledgedAt: number | null;
  acknowledgedBy: string | null;
}

// Aggregation
export interface TimeWindowAggregation {
  windowMs: number;
  detectionCount: number;
  detectionRate: number; // per second
  confidenceDistribution: number[]; // histogram buckets
  avgConfidence: number;
}

// Hotspot clustering
export interface HotspotCluster {
  centroid: { lat: number; lng: number };
  detectionCount: number;
  topConfidences: number[];
  deviceIds: string[];
  radius: number;
}
