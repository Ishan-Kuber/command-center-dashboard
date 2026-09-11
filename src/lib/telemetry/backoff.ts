const BASE_DELAY_MS = 1000;

export function computeBackoffDelay(
  attempt: number,
  maxInterval: number = 30000
): number {
  const delay = BASE_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, maxInterval);
}