import { z } from "zod";

// Schema for individual YOLO bounding box detections from 5B
export const BoundingBoxSchema = z.object({
  x: z.number(),      // Bounding box X center / offset
  y: z.number(),      // Bounding box Y center / offset
  width: z.number(),  // Box width
  height: z.number(), // Box height
  label: z.string(),  // Detected class (e.g., 'person', 'vehicle')
  confidence: z.number().min(0).max(1), // Model score (0 to 1)
});

// Full telemetry schema emitted by 5B Edge Devices
export const EdgeInferencePayloadSchema = z.object({
  deviceId: z.string(),
  timestamp: z.number(), // Epoch time in ms
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  detections: z.array(BoundingBoxSchema),
  fps: z.number().optional(),
  status: z.enum(["online", "offline", "warning"]),
});

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type EdgeInferencePayload = z.infer<typeof EdgeInferencePayloadSchema>;