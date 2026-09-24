import { useCommandCenterStore } from "@/store/useCommandCenterStore";
import { EdgeInferencePayloadSchema } from "@/types/telemetry";

export function handleIncomingTelemetry(rawMessage: string | object) {
  try {
    // 1. Parse JSON if string from MQTT/WebSocket
    const rawData = typeof rawMessage === "string" ? JSON.parse(rawMessage) : rawMessage;

    // 2. Validate payload against 5B schema
    const data = EdgeInferencePayloadSchema.parse(rawData);

    // 3. Update global Zustand state safely
    const store = useCommandCenterStore.getState();
    if (typeof store.updateDevice === "function") {
      store.updateDevice(data.deviceId, {
        lat: data.location.lat,
        lng: data.location.lng,
        status: data.status,
        telemetry: {
          detections: data.detections,
          fps: data.fps,
          lastSeen: data.timestamp,
        },
      });
    } else {
      console.warn("Zustand store function 'updateDevice' is not yet mounted.");
    }
  } catch (error) {
    console.error("Payload mismatch or invalid 5B telemetry received:", error);
  }
}