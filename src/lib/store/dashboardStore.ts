import { create } from "zustand";

import {
  Alert,
  AlertRule,
  DeviceState,
  TelemetryMessage,
  TimeWindowAggregation,
} from "../types";

interface DashboardStore {
  mqttConnected: boolean;
  wsConnected: boolean;
  devices: Record<string, DeviceState>;
  telemetryBuffer: TelemetryMessage[];
  aggregations: TimeWindowAggregation[];
  alertRules: AlertRule[];
  alerts: Alert[];
  offlineTimeoutMs: number;

  setMqttConnected: (connected: boolean) => void;
  setWsConnected: (connected: boolean) => void;
  processTelemetry: (message: TelemetryMessage) => void;
  updateDeviceStatus: (
    deviceId: string,
    status: DeviceState["status"]
  ) => void;
  addAlertRule: (rule: AlertRule) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string, user: string) => void;
  silenceRule: (ruleId: string, durationMs: number) => void;
  deleteRule: (ruleId: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  mqttConnected: false,
  wsConnected: false,

  devices: {},

  telemetryBuffer: [],

  aggregations: [],

  alertRules: [],

  alerts: [
    {
      id: "alert-1",
      ruleId: "rule-1",
      ruleName: "Hotspot detected",
      timestamp: Date.now(),
      severity: "critical",
      metricValue: 86,
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null,
    },

    {
      id: "alert-3",
      ruleId: "rule-3",
      ruleName: "Device disconnected",
      timestamp: Date.now(),
      severity: "critical",
      metricValue: 0,
      acknowledged: true,
      acknowledgedAt: Date.now(),
      acknowledgedBy: "system",
    },

    {
      id: "alert-4",
      ruleId: "rule-4",
      ruleName: "High latency detected",
      timestamp: Date.now(),
      severity: "warning",
      metricValue: 110,
      acknowledged: false,
      acknowledgedAt: null,
      acknowledgedBy: null,
    },
  ],

  offlineTimeoutMs: 10000,

  setMqttConnected: (connected) =>
    set({
      mqttConnected: connected,
    }),

  setWsConnected: (connected) =>
    set({
      wsConnected: connected,
    }),

  processTelemetry: (message) =>
    set((state) => {
      const detectionCount = message.detections.length;

      const avgConfidence =
        detectionCount > 0
          ? message.detections.reduce(
              (sum, detection) => sum + detection.confidence,
              0
            ) / detectionCount
          : 0;

      const device: DeviceState = {
        deviceId: message.deviceId,
        status: message.metrics.status,
        lastSeen: message.timestamp,
        fps: message.metrics.fps,
        latencyMs: message.metrics.latencyMs,
        location: message.location,
        detections: message.detections,
        detectionCount,
        avgConfidence,
      };

      const newAlerts = [...state.alerts];

      // Generate a low-FPS warning.
      if (
        message.metrics.fps < 20 &&
        !state.alerts.some(
          (alert) =>
            alert.ruleId === "low-fps" &&
            alert.metricValue === message.metrics.fps &&
            !alert.acknowledged
        )
      ) {
        newAlerts.push({
          id: `low-fps-${message.deviceId}-${message.timestamp}`,
          ruleId: "low-fps",
          ruleName: "Low FPS detected",
          timestamp: message.timestamp,
          severity: "warning",
          metricValue: message.metrics.fps,
          acknowledged: false,
          acknowledgedAt: null,
          acknowledgedBy: null,
        });
      }

      return {
        devices: {
          ...state.devices,
          [message.deviceId]: device,
        },

        telemetryBuffer: [
          ...state.telemetryBuffer,
          message,
        ].slice(-500),

        alerts: newAlerts,
      };
    }),

  updateDeviceStatus: (deviceId, status) =>
    set((state) => {
      const device = state.devices[deviceId];

      if (!device) {
        return state;
      }

      return {
        devices: {
          ...state.devices,
          [deviceId]: {
            ...device,
            status,
          },
        },
      };
    }),

  addAlertRule: (rule) =>
    set((state) => ({
      alertRules: [...state.alertRules, rule],
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [...state.alerts, alert],
    })),

  acknowledgeAlert: (alertId, user) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedAt: Date.now(),
              acknowledgedBy: user,
            }
          : alert
      ),
    })),

  silenceRule: (ruleId, durationMs) =>
    set((state) => ({
      alertRules: state.alertRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              silencedUntil: Date.now() + durationMs,
            }
          : rule
      ),
    })),

  deleteRule: (ruleId) =>
    set((state) => ({
      alertRules: state.alertRules.filter(
        (rule) => rule.id !== ruleId
      ),
    })),
}));