import { EdgeInferencePayload } from "@/types/telemetry";

export function generateMock5bPayload(deviceId: string): EdgeInferencePayload {
  const labels = ["person", "vehicle", "crowd_group"];
  
  return {
    deviceId,
    timestamp: Date.now(),
    location: {
      // Small randomized movement around standard coordinates
      lat: 18.5204 + (Math.random() - 0.5) * 0.005,
      lng: 73.8567 + (Math.random() - 0.5) * 0.005,
    },
    detections: [
      {
        x: Number(Math.random().toFixed(2)),
        y: Number(Math.random().toFixed(2)),
        width: 0.15,
        height: 0.25,
        label: labels[Math.floor(Math.random() * labels.length)],
        confidence: Number((0.75 + Math.random() * 0.23).toFixed(2)),
      },
    ],
    fps: 15,
    status: "online",
  };
}