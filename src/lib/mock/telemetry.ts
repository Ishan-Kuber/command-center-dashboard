import { TelemetryMessage } from "../types";

export const mockTelemetry: TelemetryMessage[] = [
  {
    deviceId: "CAM-001",
    timestamp: Date.now(),
    location: {
      lat: 18.5204,
      lng: 73.8567,
    },
    detections: [
      {
        classLabel: "Person",
        confidence: 0.94,
        boundingBox: {
          x: 120,
          y: 80,
          width: 100,
          height: 180,
        },
      },
      {
        classLabel: "Vehicle",
        confidence: 0.89,
        boundingBox: {
          x: 300,
          y: 150,
          width: 180,
          height: 120,
        },
      },
    ],
    metrics: {
      fps: 28,
      latencyMs: 45,
      status: "online",
    },
  },

  {
    deviceId: "CAM-002",
    timestamp: Date.now(),
    location: {
      lat: 18.5314,
      lng: 73.8446,
    },
    detections: [
      {
        classLabel: "Person",
        confidence: 0.91,
        boundingBox: {
          x: 200,
          y: 100,
          width: 90,
          height: 170,
        },
      },
    ],
    metrics: {
      fps: 25,
      latencyMs: 52,
      status: "online",
    },
  },

  {
    deviceId: "CAM-003",
    timestamp: Date.now(),
    location: {
      lat: 18.5074,
      lng: 73.8077,
    },
    detections: [
      {
        classLabel: "Vehicle",
        confidence: 0.87,
        boundingBox: {
          x: 150,
          y: 120,
          width: 200,
          height: 130,
        },
      },
      {
        classLabel: "Person",
        confidence: 0.96,
        boundingBox: {
          x: 400,
          y: 90,
          width: 85,
          height: 175,
        },
      },
    ],
    metrics: {
      fps: 30,
      latencyMs: 38,
      status: "online",
    },
  },

  {
    deviceId: "CAM-004",
    timestamp: Date.now(),
    location: {
      lat: 18.5642,
      lng: 73.7769,
    },
    detections: [
      {
        classLabel: "Person",
        confidence: 0.78,
        boundingBox: {
          x: 250,
          y: 100,
          width: 95,
          height: 180,
        },
      },
    ],
    metrics: {
      fps: 18,
      latencyMs: 110,
      status: "online",
    },
  },
];

export function loadMockTelemetry(
  processTelemetry: (message: TelemetryMessage) => void
) {
  mockTelemetry.forEach((message) => {
    processTelemetry(message);
  });
}