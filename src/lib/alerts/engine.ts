export function evaluateRule(
  rule: any,
  metrics: any,
  currentTime: number = Date.now(),
): any | null {
  if (rule.silencedUntil && currentTime < rule.silencedUntil) {
    return null;
  }

  const metricValue = getMetricValue(rule.metricType, metrics);
  const breached = compareThreshold(metricValue, rule.operator, rule.threshold);

  if (!breached) {
    return null;
  }

  return {
    id: generateId(),
    ruleId: rule.id,
    ruleName: rule.name,
    timestamp: currentTime,
    severity: rule.severity,
    metricValue,
    acknowledged: false,
    acknowledgedAt: null,
    acknowledgedBy: null,
  };
}

export function evaluateAllRules(
  rules: any[],
  metrics: any,
  currentTime: number = Date.now(),
): any[] {
  const alerts: any[] = [];
  for (const rule of rules) {
    const alert = evaluateRule(rule, metrics, currentTime);
    if (alert) {
      alerts.push(alert);
    }
  }
  return alerts;
}

function getMetricValue(metricType: string, metrics: any): number {
  switch (metricType) {
    case "detection_count":
      return metrics.detectionCount;
    case "detection_rate":
      return metrics.detectionRate;
    case "confidence":
      return metrics.avgConfidence;
    default:
      return 0;
  }
}

export function compareThreshold(
  value: number,
  operator: string,
  threshold: number,
): boolean {
  switch (operator) {
    case "gt":
      return value > threshold;
    case "lt":
      return value < threshold;
    case "gte":
      return value >= threshold;
    case "lte":
      return value <= threshold;
    default:
      return false;
  }
}

export function isRuleSilenced(
  rule: any,
  currentTime: number = Date.now(),
): boolean {
  return rule.silencedUntil !== null && currentTime < rule.silencedUntil;
}

function generateId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function deduplicateAlerts(
  alerts: any[],
  dedupeWindowMs: number = 60000,
): any[] {
  const seen = new Set<string>();
  return alerts.filter((alert) => {
    const key = `${alert.ruleId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
