"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Radio, RotateCw } from "lucide-react";
import { MqttConsumer } from "@/lib/telemetry/mqtt-consumer";
import { WebSocketConsumer } from "@/lib/telemetry/ws-consumer";
import { useDashboardStore } from "@/lib/store/dashboardStore";
import type { ConnectionState, ConnectionStatus, TelemetryMessage } from "@/lib/types";
import {
  hasMqttConfig,
  hasWebSocketConfig,
  mqttBrokerUrl,
  mqttTopics,
  webSocketUrl,
} from "../connection-config";

const RECONNECT_NOTICE_MS = 30_000;
const FAILURE_NOTICE_MS = 60_000;
const DEDUPE_TTL_MS = 30_000;
const MAX_DEDUPE_ENTRIES = 2_000;

type Protocol = "mqtt" | "websocket";
type LinkStatus = ConnectionStatus | "unconfigured";
type LinkState = {
  configured: boolean;
  status: LinkStatus;
  disconnectedSince: number | null;
  lastError: string | null;
};
type LinkStates = Record<Protocol, LinkState>;

type ConsumerRefs = {
  mqtt: MqttConsumer | null;
  websocket: WebSocketConsumer | null;
};

function initialLinks(): LinkStates {
  return {
    mqtt: {
      configured: hasMqttConfig,
      status: hasMqttConfig ? "disconnected" : "unconfigured",
      disconnectedSince: null,
      lastError: null,
    },
    websocket: {
      configured: hasWebSocketConfig,
      status: hasWebSocketConfig ? "disconnected" : "unconfigured",
      disconnectedSince: null,
      lastError: null,
    },
  };
}

function telemetryFingerprint(message: TelemetryMessage): string {
  const detections = message.detections
    .map((detection) => [
      detection.classLabel,
      detection.confidence,
      detection.boundingBox.x,
      detection.boundingBox.y,
      detection.boundingBox.width,
      detection.boundingBox.height,
    ]);

  return JSON.stringify([
    message.deviceId,
    message.timestamp,
    message.location.lat,
    message.location.lng,
    message.metrics.fps,
    message.metrics.latencyMs,
    message.metrics.status,
    detections,
  ]);
}

export default function ConnectionMonitor() {
  const processTelemetry = useDashboardStore((state) => state.processTelemetry);
  const setMqttConnected = useDashboardStore((state) => state.setMqttConnected);
  const setWsConnected = useDashboardStore((state) => state.setWsConnected);
  const consumers = useRef<ConsumerRefs>({ mqtt: null, websocket: null });
  const seenMessages = useRef(new Map<string, number>());
  const [links, setLinks] = useState<LinkStates>(initialLinks);
  const [now, setNow] = useState(0);

  const receiveTelemetry = useCallback(
    (message: TelemetryMessage) => {
      const receivedAt = Date.now();
      const cache = seenMessages.current;

      for (const [fingerprint, recordedAt] of cache) {
        if (receivedAt - recordedAt > DEDUPE_TTL_MS) cache.delete(fingerprint);
      }

      const fingerprint = telemetryFingerprint(message);
      if (cache.has(fingerprint)) return;

      cache.set(fingerprint, receivedAt);
      while (cache.size > MAX_DEDUPE_ENTRIES) {
        const oldestFingerprint = cache.keys().next().value;
        if (oldestFingerprint === undefined) break;
        cache.delete(oldestFingerprint);
      }

      processTelemetry(message);
    },
    [processTelemetry],
  );

  useEffect(() => {
    const mqttConsumer = hasMqttConfig
      ? new MqttConsumer({
          brokerUrl: mqttBrokerUrl,
          topics: mqttTopics,
          reconnectMaxInterval: 30_000,
        })
      : null;
    const websocketConsumer = hasWebSocketConfig
      ? new WebSocketConsumer({
          url: webSocketUrl,
          reconnectMaxInterval: 30_000,
        })
      : null;

    consumers.current = { mqtt: mqttConsumer, websocket: websocketConsumer };

    const updateStatus = (protocol: Protocol, connection: ConnectionState) => {
      const connected = connection.status === "connected";
      setLinks((current) => ({
        ...current,
        [protocol]: {
          ...current[protocol],
          status: connection.status,
          disconnectedSince: connected
            ? null
            : current[protocol].disconnectedSince ?? Date.now(),
          lastError: connection.lastError,
        },
      }));
      if (protocol === "mqtt") setMqttConnected(connected);
      else setWsConnected(connected);
    };

    const unsubscribe: Array<() => void> = [];
    if (mqttConsumer) {
      unsubscribe.push(mqttConsumer.onStatusChange((state) => updateStatus("mqtt", state)));
      unsubscribe.push(mqttConsumer.onMessage(receiveTelemetry));
      mqttConsumer.connect();
    }
    if (websocketConsumer) {
      unsubscribe.push(websocketConsumer.onStatusChange((state) => updateStatus("websocket", state)));
      unsubscribe.push(websocketConsumer.onMessage(receiveTelemetry));
      websocketConsumer.connect();
    }

    return () => {
      unsubscribe.forEach((removeListener) => removeListener());
      mqttConsumer?.disconnect();
      websocketConsumer?.disconnect();
      consumers.current = { mqtt: null, websocket: null };
      setMqttConnected(false);
      setWsConnected(false);
    };
  }, [receiveTelemetry, setMqttConnected, setWsConnected]);

  const hasDisconnectedLink = (Object.keys(links) as Protocol[]).some(
    (protocol) =>
      links[protocol].configured &&
      links[protocol].status !== "connected" &&
      links[protocol].disconnectedSince !== null,
  );

  useEffect(() => {
    if (!hasDisconnectedLink) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [hasDisconnectedLink]);

  const configuredLinks = (Object.keys(links) as Protocol[]).filter(
    (protocol) => links[protocol].configured && links[protocol].status !== "connected",
  );
  const attentionLinks = configuredLinks.filter((protocol) => {
    const since = links[protocol].disconnectedSince;
    return since !== null && now - since >= RECONNECT_NOTICE_MS;
  });
  const persistentLinks = attentionLinks.filter((protocol) => {
    const since = links[protocol].disconnectedSince;
    return since !== null && now - since >= FAILURE_NOTICE_MS;
  });
  const isFailure = persistentLinks.length > 0;
  const noticeLinks = isFailure ? persistentLinks : attentionLinks;
  const noticeNames = noticeLinks.map((protocol) => protocol === "mqtt" ? "MQTT" : "WebSocket");
  const noticeLabel = noticeNames.length < 2
    ? noticeNames[0]
    : `${noticeNames.slice(0, -1).join(", ")} and ${noticeNames.at(-1)}`;

  const retryConnections = () => {
    const retryAt = Date.now();
    setLinks((current) => {
      const next = { ...current };
      for (const protocol of configuredLinks) {
        next[protocol] = {
          ...current[protocol],
          disconnectedSince: retryAt,
        };
      }
      return next;
    });
    setNow(retryAt);

    if (links.mqtt.configured && links.mqtt.status !== "connected") {
      consumers.current.mqtt?.connect();
    }
    if (links.websocket.configured && links.websocket.status !== "connected") {
      consumers.current.websocket?.connect();
    }
  };

  if (!noticeLinks.length) return null;

  return (
    <aside
      className={`fixed bottom-4 right-4 z-[1300] w-[min(25rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
        isFailure
          ? "cc-critical-border bg-muted"
          : "cc-warning-border bg-muted"
      }`}
      role={isFailure ? "alert" : "status"}
      aria-live={isFailure ? "assertive" : "polite"}
    >
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isFailure ? "cc-critical-soft cc-critical" : "cc-warning-soft cc-warning"}`}>
          {isFailure ? <AlertTriangle className="size-4" aria-hidden="true" /> : <RotateCw className="size-4 animate-spin" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {isFailure ? `Still unable to connect to ${noticeLabel}` : `Trying to reconnect to ${noticeLabel}…`}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {isFailure
              ? "Automatic retries are continuing. You can retry the unavailable connection now."
              : "The connection is not available yet; automatic retries are in progress."}
          </p>
        </div>
      </div>
      {isFailure && (
        <button
          type="button"
          onClick={retryConnections}
          className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border cc-critical-border cc-critical-soft px-3 text-sm font-medium cc-critical transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Radio className="size-4" aria-hidden="true" />
          Retry connection
        </button>
      )}
    </aside>
  );
}
