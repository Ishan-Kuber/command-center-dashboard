import { HotspotCluster } from "@/lib/types";

export interface DetectionPoint {
  lat: number;
  lng: number;
  confidence: number;
  deviceId: string;
}

const EARTH_RADIUS_KM = 6371;
const TOP_CONFIDENCE_COUNT = 5;

export function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function clusterDetections(
  detections: DetectionPoint[],
  radiusKm: number
): HotspotCluster[] {
  const unassigned = [...detections];
  const clusters: HotspotCluster[] = [];

  while (unassigned.length > 0) {
    const seed = unassigned.shift()!;
    const members = [seed];
    let centroid = { lat: seed.lat, lng: seed.lng };

    // Repeat until no more points fall within radiusKm of the running
    // centroid — a single pass can miss points that only qualify after
    // the centroid shifts toward earlier-absorbed members.
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = unassigned.length - 1; i >= 0; i--) {
        const point = unassigned[i];
        if (haversineDistance(centroid, point) <= radiusKm) {
          members.push(point);
          unassigned.splice(i, 1);
          centroid = {
            lat: members.reduce((s, m) => s + m.lat, 0) / members.length,
            lng: members.reduce((s, m) => s + m.lng, 0) / members.length,
          };
          changed = true;
        }
      }
    }

    const deviceIds = Array.from(new Set(members.map((m) => m.deviceId)));
    const topConfidences = members
      .map((m) => m.confidence)
      .sort((x, y) => y - x)
      .slice(0, TOP_CONFIDENCE_COUNT);

    clusters.push({
      centroid,
      detectionCount: members.length,
      topConfidences,
      deviceIds,
      radius: radiusKm,
    });
  }

  return clusters;
}