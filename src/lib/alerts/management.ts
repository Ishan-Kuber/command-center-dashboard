export function acknowledgeAlert(
  alert: any,
  userId: string,
  timestamp: number = Date.now(),
): any {
  return {
    ...alert,
    acknowledged: true,
    acknowledgedAt: timestamp,
    acknowledgedBy: userId,
  };
}

export function silenceRule(
  rule: any,
  durationMs: number,
  currentTime: number = Date.now(),
): any {
  const MIN_SILENCE = 15 * 60 * 1000;
  const MAX_SILENCE = 24 * 60 * 60 * 1000;
  const validDuration = Math.max(
    MIN_SILENCE,
    Math.min(durationMs, MAX_SILENCE),
  );

  return {
    ...rule,
    silencedUntil: currentTime + validDuration,
  };
}

export function unsilenceRule(rule: any): any {
  return {
    ...rule,
    silencedUntil: null,
  };
}

export function filterAlerts(alerts: any[], filter: any): any[] {
  return alerts.filter((alert) => {
    if (filter.severities && !filter.severities.includes(alert.severity)) {
      return false;
    }
    if (
      filter.acknowledged !== undefined &&
      alert.acknowledged !== filter.acknowledged
    ) {
      return false;
    }
    if (filter.timeRange) {
      if (
        alert.timestamp < filter.timeRange.start ||
        alert.timestamp > filter.timeRange.end
      ) {
        return false;
      }
    }
    if (filter.ruleIds && !filter.ruleIds.includes(alert.ruleId)) {
      return false;
    }
    return true;
  });
}

export function countUnacknowledgedAlerts(alerts: any[]): number {
  return alerts.filter((a) => !a.acknowledged).length;
}

export function countAlertsBySeverity(alerts: any[]): Record<string, number> {
  return {
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    informational: alerts.filter((a) => a.severity === "informational").length,
  };
}

export function partitionAlerts(alerts: any[]): any {
  return {
    unacknowledged: alerts.filter((a) => !a.acknowledged),
    acknowledged: alerts.filter((a) => a.acknowledged),
  };
}

export function sortAlertsByTimestamp(
  alerts: any[],
  newestFirst: boolean = true,
): any[] {
  return [...alerts].sort((a, b) => {
    return newestFirst ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
  });
}

export function getLatestAlertPerRule(alerts: any[]): any[] {
  const grouped = alerts.reduce(
    (acc, alert) => {
      if (!acc[alert.ruleId]) {
        acc[alert.ruleId] = [];
      }
      acc[alert.ruleId].push(alert);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return Object.values(grouped).map((ruleAlerts) => {
    return ruleAlerts.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest,
    );
  });
}

export function trimAlertHistory(
  alerts: any[],
  maxAge: number = 7 * 24 * 60 * 60 * 1000,
): any[] {
  const cutoff = Date.now() - maxAge;
  return alerts.filter((a) => a.timestamp > cutoff);
}
