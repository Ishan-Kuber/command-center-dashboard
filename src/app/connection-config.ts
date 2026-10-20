function isBrowserWebSocketUrl(value: string): boolean {
  if (!value || value.includes("<") || value.includes(">")) return false;

  try {
    const parsed = new URL(value);
    // These NEXT_PUBLIC endpoint values are browser-visible; current consumers have no secure auth flow.
    return (
      (parsed.protocol === "ws:" || parsed.protocol === "wss:") &&
      !parsed.username &&
      !parsed.password &&
      !parsed.search &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

export const mqttBrokerUrl = (process.env.NEXT_PUBLIC_MQTT_BROKER_URL ?? "").trim();
export const mqttTopics = (process.env.NEXT_PUBLIC_MQTT_TOPICS ?? "")
  .split(",")
  .map((topic) => topic.trim())
  .filter((topic) => topic.length > 0 && !topic.includes("<") && !topic.includes(">"));
export const webSocketUrl = (process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? "").trim();

export const hasMqttConfig = isBrowserWebSocketUrl(mqttBrokerUrl) && mqttTopics.length > 0;
export const hasWebSocketConfig = isBrowserWebSocketUrl(webSocketUrl);
export const hasAnyConnectionConfig = hasMqttConfig || hasWebSocketConfig;
