import { create } from "zustand";
import { TelemetryMessage, Alert, AlertRule, DeviceState } from "../types";
import {
  aggregateByTimeWindow,
  TIME_WINDOWS,
  TimeWindowMetrics,
} from "../aggregation/time-window";
import { evaluateAllRules, deduplicateAlerts } from "../alerts/engine";
import {
  acknowledgeAlert as ackAlert,
  silenceRule as silRule,
  countUnacknowledgedAlerts,
} from "../alerts/management";

interface DashboardStore {
  mqttConnected: boolean;
  wsConnected: boolean;
  devices: Record<string, DeviceState>;
  offlineTimeoutMs: number;
  telemetryBuffer: TelemetryMessage[];
  maxBufferSize: number;
  aggregations: Record<number, TimeWindowMetrics>;
  selectedTimeWindow: number;
  alertRules: AlertRule[];
  alerts: Alert[];
  maxAlertHistory: number;

  setMqttConnected: (connected: boolean) => void;
  setWsConnected: (connected: boolean) => void;
  processTelemetry: (message: TelemetryMessage) => void;
  clearTelemetryBuffer: () => void;
  updateDeviceStatus: (deviceId: string, status: DeviceState["status"]) => void;
  markDeviceOffline: (deviceId: string) => void;
  computeAggregations: () => void;
  selectTimeWindow: (windowMs: number) => void;
  getCurrentAggregation: () => TimeWindowMetrics | null;
  addAlertRule: (rule: AlertRule) => void;
  deleteAlertRule: (ruleId: string) => void;
  acknowledgeAlert: (alertId: string, userId: string) => void;
  silenceAlertRule: (ruleId: string, durationMs: number) => void;
  clearAlerts: () => void;
  getUnacknowledgedAlertCount: () => number;
  getAggregationByWindow: (windowMs: number) => TimeWindowMetrics | null;
  getAlertsByRule: (ruleId: string) => Alert[];
  getActivAlerts: () => Alert[];
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  mqttConnected: false,
  wsConnected: false,
  devices: {},
  offlineTimeoutMs: 10000,
  telemetryBuffer: [],
  maxBufferSize: 1000,
  aggregations: {},
  selectedTimeWindow: TIME_WINDOWS.ONE_MINUTE,
  alertRules: [],
  alerts: [],
  maxAlertHistory: 500,

  setMqttConnected: (connected) => set({ mqttConnected: connected }),
  setWsConnected: (connected) => set({ wsConnected: connected }),

  processTelemetry: (message) =>
    set((state) => {
      const detectionCount = message.detections.length;
      const avgConfidence =
        detectionCount > 0
          ? message.detections.reduce((sum, d) => sum + d.confidence, 0) /
            detectionCount
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

      const newBuffer = [...state.telemetryBuffer, message].slice(
        -state.maxBufferSize,
      );

      const newAggregations: Record<number, TimeWindowMetrics> = {};
      const windowsToCompute = Object.values(TIME_WINDOWS);
      for (const windowMs of windowsToCompute) {
        newAggregations[windowMs] = aggregateByTimeWindow(
          newBuffer,
          windowMs,
          message.timestamp,
        );
      }

      const currentMetrics = newAggregations[state.selectedTimeWindow];
      const newAlerts = currentMetrics
        ? evaluateAllRules(state.alertRules, currentMetrics, message.timestamp)
        : [];

      const deduplicatedNewAlerts = deduplicateAlerts(newAlerts);
      const mergedAlerts = [...state.alerts, ...deduplicatedNewAlerts].slice(
        -state.maxAlertHistory,
      );

      return {
        devices: {
          ...state.devices,
          [message.deviceId]: device,
        },
        telemetryBuffer: newBuffer,
        aggregations: newAggregations,
        alerts: mergedAlerts,
      };
    }),

  clearTelemetryBuffer: () => set({ telemetryBuffer: [], aggregations: {} }),

  updateDeviceStatus: (deviceId, status) =>
    set((state) => {
      const device = state.devices[deviceId];
      if (!device) return state;
      return {
        devices: {
          ...state.devices,
          [deviceId]: { ...device, status },
        },
      };
    }),

  markDeviceOffline: (deviceId) =>
    set((state) => {
      const device = state.devices[deviceId];
      if (!device) return state;
      return {
        devices: {
          ...state.devices,
          [deviceId]: { ...device, status: "offline" },
        },
      };
    }),

  computeAggregations: () =>
    set((state) => {
      const windowsToCompute = Object.values(TIME_WINDOWS);
      const newAggregations: Record<number, TimeWindowMetrics> = {};
      for (const windowMs of windowsToCompute) {
        newAggregations[windowMs] = aggregateByTimeWindow(
          state.telemetryBuffer,
          windowMs,
        );
      }
      return { aggregations: newAggregations };
    }),

  selectTimeWindow: (windowMs) => set({ selectedTimeWindow: windowMs }),

  getCurrentAggregation: () => {
    const state = get();
    return state.aggregations[state.selectedTimeWindow] || null;
  },

  getAggregationByWindow: (windowMs) => {
    const state = get();
    return state.aggregations[windowMs] || null;
  },

  addAlertRule: (rule) =>
    set((state) => ({
      alertRules: [...state.alertRules, rule],
    })),

  deleteAlertRule: (ruleId) =>
    set((state) => ({
      alertRules: state.alertRules.filter((r) => r.id !== ruleId),
      alerts: state.alerts.filter((a) => a.ruleId !== ruleId),
    })),

  acknowledgeAlert: (alertId, userId) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === alertId ? ackAlert(alert, userId) : alert,
      ),
    })),

  silenceAlertRule: (ruleId, durationMs) =>
    set((state) => ({
      alertRules: state.alertRules.map((rule) =>
        rule.id === ruleId ? silRule(rule, durationMs) : rule,
      ),
    })),

  clearAlerts: () => set({ alerts: [] }),

  getUnacknowledgedAlertCount: () => {
    const state = get();
    return countUnacknowledgedAlerts(state.alerts);
  },

  getAlertsByRule: (ruleId) => {
    const state = get();
    return state.alerts.filter((a) => a.ruleId === ruleId);
  },

  getActivAlerts: () => {
    const state = get();
    return state.alerts.filter(
      (a) => !a.acknowledged && a.timestamp > Date.now() - 24 * 60 * 60 * 1000,
    );
  },
}));
