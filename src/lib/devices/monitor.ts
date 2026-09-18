import type { DeviceState } from '@/lib/types';

export const DEFAULT_DEVICE_TIMEOUT_MS = 10000;
export const DEFAULT_MIN_FPS = 10;

export function computeDeviceStatus(
  lastSeen: number,
  currentTime: number,
  timeoutMs: number = DEFAULT_DEVICE_TIMEOUT_MS
): 'online' | 'offline' {
  return currentTime - lastSeen > timeoutMs ? 'offline' : 'online';
}

export function shouldWarnFps(
  fps: number,
  minThreshold: number = DEFAULT_MIN_FPS
): boolean {
  return fps < minThreshold;
}

export function countByStatus(
  devices: DeviceState[]
): { online: number; offline: number } {
  return devices.reduce(
    (acc, device) => {
      if (device.status === 'online') acc.online += 1;
      else acc.offline += 1;
      return acc;
    },
    { online: 0, offline: 0 }
  );
}