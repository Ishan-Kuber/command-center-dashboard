import mqtt, { type MqttClient } from 'mqtt';
import { BaseTelemetryConsumer } from '@/lib/telemetry/base-consumer';
import type { MqttConsumerConfig } from '@/lib/types';

export class MqttConsumer extends BaseTelemetryConsumer {
  private client: MqttClient | null = null;
  private readonly brokerUrl: string;
  private readonly topics: string[];
  private readonly clientId: string;

  constructor(config: MqttConsumerConfig) {
    super(config.reconnectMaxInterval, config.connectTimeoutMs ?? 5000);
    this.brokerUrl = config.brokerUrl;
    this.topics = config.topics;
    this.clientId =
      config.clientId ?? `dashboard-${Math.random().toString(16).slice(2, 10)}`;
  }

  protected openConnection(): void {
    // We drive reconnection ourselves via BaseTelemetryConsumer's backoff,
    // so mqtt.js's own reconnect is disabled to avoid two competing loops.
    this.client = mqtt.connect(this.brokerUrl, {
      clientId: this.clientId,
      reconnectPeriod: 0,
      connectTimeout: this.connectTimeoutMs,
      clean: true,
    });

    this.client.on('connect', () => {
      this.client?.subscribe(this.topics, { qos: 0 }, (err) => {
        if (err) {
          this.handleError(err);
          return;
        }
        this.onOpen();
      });
    });

    this.client.on('message', (_topic, payload) => {
      this.handlePayload(payload.toString());
    });

    this.client.on('error', (err) => this.handleError(err));
    this.client.on('close', () => this.onClose());
  }

  protected closeConnection(): void {
    if (!this.client) return;
    this.client.removeAllListeners();
    this.client.end(true);
    this.client = null;
  }
}