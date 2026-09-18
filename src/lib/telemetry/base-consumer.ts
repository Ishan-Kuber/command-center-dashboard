import { computeBackoffDelay } from '@/lib/telemetry/backoff';
import type {
  ConnectionState,
  ConnectionStatusListener,
  TelemetryConsumer,
  TelemetryListener,
  TelemetryMessage,
} from '@/lib/types';

export abstract class BaseTelemetryConsumer implements TelemetryConsumer {
  protected reconnectMaxInterval: number;
  protected connectTimeoutMs: number;

  private state: ConnectionState = {
    status: 'disconnected',
    lastError: null,
    reconnectAttempt: 0,
    connectedAt: null,
  };

  private messageListeners = new Set<TelemetryListener>();
  private statusListeners = new Set<ConnectionStatusListener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalDisconnect = false;

  constructor(reconnectMaxInterval: number, connectTimeoutMs = 5000) {
    this.reconnectMaxInterval = reconnectMaxInterval;
    this.connectTimeoutMs = connectTimeoutMs;
  }

  /** Subclass opens the transport. Must call onOpen/onError/onClose. */
  protected abstract openConnection(): void;
  /** Subclass tears down the transport without triggering reconnect. */
  protected abstract closeConnection(): void;

  connect(): void {
    this.intentionalDisconnect = false;
    this.clearTimers();
    this.setState({ status: this.state.reconnectAttempt === 0 ? 'connecting' : 'reconnecting' });

    // Requirement 1.1/1.2: must be established within 5s or we retry.
    this.connectTimer = setTimeout(() => {
      this.handleError(new Error('Connection timeout'));
    }, this.connectTimeoutMs);

    try {
      this.openConnection();
    } catch (err) {
      this.handleError(err);
    }
  }

  disconnect(): void {
    this.intentionalDisconnect = true;
    this.clearTimers();
    this.closeConnection();
    this.setState({
      status: 'disconnected',
      reconnectAttempt: 0,
      connectedAt: null,
    });
  }

  onMessage(listener: TelemetryListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStatusChange(listener: ConnectionStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.state);
    return () => this.statusListeners.delete(listener);
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  protected onOpen(): void {
    this.clearTimers();
    this.setState({
      status: 'connected',
      lastError: null,
      reconnectAttempt: 0,
      connectedAt: Date.now(),
    });
  }

  protected onClose(): void {
    if (this.intentionalDisconnect) return;
    this.scheduleReconnect();
  }

  protected handleError(err: unknown): void {
    const message = err instanceof Error ? err.message : String(err);
    this.setState({ lastError: message });
    if (this.intentionalDisconnect) return;
    this.closeConnection();
    this.scheduleReconnect();
  }

  /** Parses a raw payload and fans it out to message listeners. */
  protected handlePayload(raw: string): void {
    const parsed = this.parseMessage(raw);
    if (!parsed) return;
    this.messageListeners.forEach((l) => l(parsed));
  }

  protected parseMessage(raw: string): TelemetryMessage | null {
    try {
      const data = JSON.parse(raw) as Partial<TelemetryMessage>;
      if (
        typeof data.deviceId !== 'string' ||
        typeof data.timestamp !== 'number' ||
        !data.location ||
        !Array.isArray(data.detections) ||
        !data.metrics
      ) {
        return null;
      }
      return data as TelemetryMessage;
    } catch {
      return null; // malformed payloads are dropped, never crash the stream
    }
  }

  private scheduleReconnect(): void {
    this.clearTimers();
    const attempt = this.state.reconnectAttempt;
    const delay = computeBackoffDelay(attempt, this.reconnectMaxInterval);

    this.setState({ status: 'reconnecting', reconnectAttempt: attempt + 1, connectedAt: null });
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.connectTimer) clearTimeout(this.connectTimer);
    this.reconnectTimer = null;
    this.connectTimer = null;
  }

  private setState(patch: Partial<ConnectionState>): void {
    this.state = { ...this.state, ...patch };
    const snapshot = this.getState();
    this.statusListeners.forEach((l) => l(snapshot));
  }
}