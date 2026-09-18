import { BaseTelemetryConsumer } from '@/lib/telemetry/base-consumer';
import type { WebSocketConsumerConfig } from '@/lib/types';

export class WebSocketConsumer extends BaseTelemetryConsumer {
  private socket: WebSocket | null = null;
  private readonly url: string;

  constructor(config: WebSocketConsumerConfig) {
    super(config.reconnectMaxInterval, config.connectTimeoutMs ?? 5000);
    this.url = config.url;
  }

  protected openConnection(): void {
    this.socket = new WebSocket(this.url);
    this.socket.onopen = () => this.onOpen();
    this.socket.onmessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') this.handlePayload(event.data);
    };
    this.socket.onerror = () => this.handleError(new Error('WebSocket error'));
    this.socket.onclose = () => this.onClose();
  }

  protected closeConnection(): void {
    if (!this.socket) return;
    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onerror = null;
    this.socket.onclose = null;
    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close();
    }
    this.socket = null;
  }
}