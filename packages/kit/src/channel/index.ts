/**
 * @file Bidirectional, long-lived channel domain model.
 */
import { BaseDomain, BizError, Handler, Result } from "@timeless/inner-base";

import {
  MaybePromise,
  SocketClientCore,
  SocketCloseReason,
  SocketConnection,
  SocketMessageMeta,
} from "@/http_client/socket";

export type ChannelStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "closing"
  | "closed"
  | "failed";

export type ChannelMessageMeta = {
  raw: unknown;
  event?: unknown;
  receivedAt: number;
};

export type ChannelSentMessage<T> = {
  data: T;
  raw: unknown;
  sentAt: number;
};

export type ChannelReconnectInfo = {
  attempt: number;
  delay: number;
  scheduledAt: number;
};

export type ChannelReconnectOptions = {
  enabled?: boolean;
  interval?: number;
};

export type ChannelCoreProps<TMessage = unknown, TSend = unknown> = {
  _name?: string;
  client?: SocketClientCore;
  hostname?: string;
  headers?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | null | undefined>;
  params?: any;
  initialMessage?: TSend;
  process?: (v: unknown, meta: ChannelMessageMeta) => TMessage;
  encode?: (v: TSend) => unknown;
  reconnect?: ChannelReconnectOptions;
  onConnected?: () => void;
  onReconnecting?: (info: ChannelReconnectInfo) => void;
  onReconnected?: () => void;
  onMessage?: (message: TMessage) => void;
  onSent?: (message: ChannelSentMessage<TSend>) => void;
  onClose?: (reason: SocketCloseReason) => void;
  onFailed?: (error: BizError) => void;
  onStatusChange?: (status: ChannelStatus) => void;
  onConnecting?: (connecting: boolean) => void;
};

export type ChannelState<TMessage, TSend> = {
  initial: boolean;
  connecting: boolean;
  connected: boolean;
  status: ChannelStatus;
  error: BizError | null;
  lastMessage: TMessage | null;
  lastSent: TSend | null;
  closeReason: SocketCloseReason | null;
  reconnectAttempt: number;
  nextReconnectAt: number | null;
};

enum Events {
  BeforeConnect,
  ConnectingChange,
  StatusChange,
  Connected,
  Reconnecting,
  Reconnected,
  Message,
  MessageChange,
  Sent,
  Close,
  Failed,
  StateChange,
}

type TheTypesOfEvents<TMessage, TSend> = {
  [Events.BeforeConnect]: void;
  [Events.ConnectingChange]: boolean;
  [Events.StatusChange]: ChannelStatus;
  [Events.Connected]: void;
  [Events.Reconnecting]: ChannelReconnectInfo;
  [Events.Reconnected]: void;
  [Events.Message]: TMessage;
  [Events.MessageChange]: TMessage | null;
  [Events.Sent]: ChannelSentMessage<TSend>;
  [Events.Close]: SocketCloseReason;
  [Events.Failed]: BizError;
  [Events.StateChange]: ChannelState<TMessage, TSend>;
};

export type TheMessageOfChannelCore<T extends ChannelCore<any, any>> =
  NonNullable<T["lastMessage"]>;

export type TheSendMessageOfChannelCore<T extends ChannelCore<any, any>> =
  NonNullable<T["lastSent"]>;

function isResult<T>(v: unknown): v is Result<T> {
  return !!v && typeof v === "object" && "error" in v && "data" in v;
}

async function toVoidResult(
  fn: () => MaybePromise<Result<null> | void>,
): Promise<Result<null>> {
  try {
    const resolved = await fn();
    if (isResult<null>(resolved)) {
      return resolved;
    }
    return Result.Ok(null);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

async function toResult<T>(
  fn: () => MaybePromise<Result<T>>,
): Promise<Result<T>> {
  try {
    return await fn();
  } catch (err) {
    return Result.Err(err as Error);
  }
}

function toBizError(error: unknown) {
  if (error instanceof BizError) {
    return error;
  }
  const result = Result.Err(error as Error);
  return result.error!;
}

export class ChannelCore<
  TMessage = unknown,
  TSend = unknown,
> extends BaseDomain<TheTypesOfEvents<TMessage, TSend>> {
  _name = "ChannelCore";
  client?: SocketClientCore;
  endpoint: unknown;
  hostname = "";
  headers: Record<string, string | number> = {};
  query?: Record<string, string | number | boolean | null | undefined>;
  params?: any;
  initialMessage?: TSend;
  process?: (v: unknown, meta: ChannelMessageMeta) => TMessage;
  encode?: (v: TSend) => unknown;
  initial = true;
  connecting = false;
  connected = false;
  status: ChannelStatus = "idle";
  error: BizError | null = null;
  lastMessage: TMessage | null = null;
  lastSent: TSend | null = null;
  closeReason: SocketCloseReason | null = null;
  reconnectAttempt = 0;
  nextReconnectAt: number | null = null;
  pending: Promise<Result<null>> | null = null;
  id = String(this.uid());

  private connection: SocketConnection | null = null;
  private connectionController: AbortController | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectEnabled = false;
  private reconnectDelay = 5000;
  private shouldConnect = false;
  private connectedOnce = false;

  get state(): ChannelState<TMessage, TSend> {
    return {
      initial: this.initial,
      connecting: this.connecting,
      connected: this.connected,
      status: this.status,
      error: this.error,
      lastMessage: this.lastMessage,
      lastSent: this.lastSent,
      closeReason: this.closeReason,
      reconnectAttempt: this.reconnectAttempt,
      nextReconnectAt: this.nextReconnectAt,
    };
  }

  constructor(
    endpoint: unknown,
    props: ChannelCoreProps<TMessage, TSend> = {},
  ) {
    super({ unique_id: props._name });

    const {
      _name,
      client,
      hostname = "",
      headers = {},
      query,
      params,
      initialMessage,
      process,
      encode,
      reconnect,
      onConnected,
      onReconnecting,
      onReconnected,
      onMessage,
      onSent,
      onClose,
      onFailed,
      onStatusChange,
      onConnecting,
    } = props;

    this.endpoint = endpoint;
    this.client = client;
    this.hostname = hostname;
    this.headers = headers;
    this.query = query;
    this.params = params;
    this.initialMessage = initialMessage;
    this.process = process;
    this.encode = encode;
    this.reconnectEnabled =
      reconnect !== undefined && reconnect.enabled !== false;
    this.reconnectDelay = Math.max(0, reconnect?.interval ?? 5000);
    if (_name) {
      this._name = _name;
    }
    if (onConnected) {
      this.onConnected(onConnected);
    }
    if (onReconnecting) {
      this.onReconnecting(onReconnecting);
    }
    if (onReconnected) {
      this.onReconnected(onReconnected);
    }
    if (onMessage) {
      this.onMessage(onMessage);
    }
    if (onSent) {
      this.onSent(onSent);
    }
    if (onClose) {
      this.onClose(onClose);
    }
    if (onStatusChange) {
      this.onStatusChange(onStatusChange);
    }
    if (onConnecting) {
      this.onConnectingChange(onConnecting);
    }
    if (onFailed) {
      this.onFailed(onFailed, { override: true });
    }
  }

  connect() {
    this.shouldConnect = true;
    this.cancelReconnect();
    this.reconnectAttempt = 0;
    return this.beginConnect(false);
  }

  private beginConnect(reconnecting: boolean) {
    if (this.connected) {
      return Promise.resolve(Result.Ok(null));
    }
    if (this.pending) {
      return this.pending;
    }
    const task = this.runConnect(reconnecting);
    this.pending = task;
    void task.finally(() => {
      if (this.pending === task) {
        this.pending = null;
      }
    });
    return task;
  }

  private async runConnect(reconnecting: boolean) {
    if (this.connection || this.connectionController) {
      await this.discardConnection("replace unavailable connection");
    }
    if (!this.shouldConnect) {
      return Result.Err("连接已取消");
    }

    this.initial = false;
    this.error = null;
    this.closeReason = null;
    this.nextReconnectAt = null;
    this.setConnecting(true);
    this.setStatus(reconnecting ? "reconnecting" : "connecting");
    this.emit(Events.BeforeConnect);
    this.emitState();

    if (!this.client) {
      const error = this.fail("缺少 socket client", false);
      return Result.Err(error);
    }

    const controller = new AbortController();
    this.connectionController = controller;
    const result = await toResult(() =>
      this.client!.open({
        endpoint: this.endpoint,
        hostname: this.hostname,
        headers: this.headers,
        query: this.query,
        params: this.params,
        signal: controller.signal,
        onMessage: (data, meta) => {
          if (this.connectionController !== controller) {
            return;
          }
          this.receiveMessage(data, meta);
        },
        onClose: (reason) => {
          if (this.connectionController !== controller) {
            return;
          }
          this.connection = null;
          this.connectionController = null;
          this.handleClose(reason);
        },
        onError: (error) => {
          if (this.connectionController !== controller) {
            return;
          }
          this.handleError(error);
        },
      }),
    );
    if (controller.signal.aborted || this.connectionController !== controller) {
      if (!result.error) {
        await toVoidResult(() => result.data.close(1000, "connect canceled"));
      }
      return Result.Err("连接已取消");
    }
    if (result.error) {
      this.connectionController = null;
      controller.abort();
      const error = this.fail(result.error, true);
      return Result.Err(error);
    }

    this.connection = result.data;
    this.handleConnected();
    if (this.initialMessage !== undefined) {
      const sent = await this.sendMessage(this.initialMessage);
      if (sent.error) {
        return sent;
      }
    }
    return Result.Ok(null);
  }

  async sendMessage(data: TSend) {
    if (!this.connected || !this.connection) {
      return Result.Err("连接未建立");
    }
    let raw: unknown;
    try {
      raw = this.encode ? this.encode(data) : data;
    } catch (err) {
      const error = this.reportError(err);
      return Result.Err(error);
    }
    const sent: ChannelSentMessage<TSend> = {
      data,
      raw,
      sentAt: Date.now(),
    };
    const result = await toVoidResult(() => this.connection!.send(raw));
    if (result.error) {
      const error = this.fail(result.error, true);
      return Result.Err(error);
    }
    this.lastSent = data;
    this.emit(Events.Sent, sent);
    this.emitState();
    return Result.Ok(null);
  }

  send(data: TSend) {
    return this.sendMessage(data);
  }

  async close(code?: number, reason?: string) {
    this.shouldConnect = false;
    this.cancelReconnect();
    this.reconnectAttempt = 0;

    const controller = this.connectionController;
    this.connectionController = null;
    controller?.abort();
    const connection = this.connection;
    this.connection = null;
    this.setConnecting(false);
    this.connected = false;
    this.setStatus("closing");
    this.emitState();

    const result = connection
      ? await toVoidResult(() => connection.close(code, reason))
      : Result.Ok(null);
    if (result.error) {
      const error = this.fail(result.error, false);
      return Result.Err(error);
    }
    this.finishClose({ code, reason, clean: true });
    return Result.Ok(null);
  }

  disconnect(code?: number, reason?: string) {
    return this.close(code, reason);
  }

  async reconnect() {
    this.shouldConnect = true;
    this.cancelReconnect();
    this.reconnectAttempt = Math.max(1, this.reconnectAttempt);
    const pending = this.pending;
    await this.discardConnection("reconnect");
    if (pending) {
      await pending;
    }
    return this.beginConnect(true);
  }

  clear() {
    this.lastMessage = null;
    this.lastSent = null;
    this.error = null;
    this.emit(Events.MessageChange, this.lastMessage);
    this.emitState();
  }

  getHostname() {
    return this.hostname;
  }

  setHostname(hostname: string) {
    this.hostname = hostname;
  }

  setHeaders(headers: Record<string, string | number>) {
    this.headers = headers;
  }

  appendHeaders(headers: Record<string, string | number>) {
    this.headers = {
      ...this.headers,
      ...headers,
    };
  }

  setClient(client: SocketClientCore) {
    this.client = client;
  }

  setError(error: BizError) {
    this.error = error;
    this.emitState();
  }

  destroy() {
    void this.close(1000, "destroy");
    super.destroy();
  }

  receiveMessage(data: unknown, extra: SocketMessageMeta = {}) {
    try {
      const meta: ChannelMessageMeta = {
        raw: data,
        event: extra.event,
        receivedAt: extra.receivedAt ?? Date.now(),
      };
      const message = this.process
        ? this.process(data, meta)
        : (data as TMessage);
      this.lastMessage = message;
      this.emit(Events.Message, message);
      this.emit(Events.MessageChange, message);
      this.emitState();
    } catch (err) {
      this.reportError(err);
    }
  }

  private async discardConnection(reason: string) {
    const controller = this.connectionController;
    this.connectionController = null;
    controller?.abort();
    const connection = this.connection;
    this.connection = null;
    this.connected = false;
    if (connection) {
      await toVoidResult(() => connection.close(1000, reason));
    }
  }

  private handleConnected() {
    const reconnected = this.connectedOnce;
    this.connectedOnce = true;
    this.cancelReconnect();
    this.reconnectAttempt = 0;
    this.error = null;
    this.closeReason = null;
    this.setConnecting(false);
    this.connected = true;
    this.setStatus("connected");
    this.emit(Events.Connected);
    if (reconnected) {
      this.emit(Events.Reconnected);
    }
    this.emitState();
  }

  private handleClose(reason: SocketCloseReason = {}) {
    this.setConnecting(false);
    this.connection = null;
    this.connectionController = null;
    this.connected = false;
    this.closeReason = reason;
    const reconnecting = this.reconnectEnabled && this.shouldConnect;
    this.setStatus(reconnecting ? "reconnecting" : "closed");
    this.emit(Events.Close, reason);
    if (!reconnecting || !this.scheduleReconnect()) {
      this.emitState();
    }
  }

  private finishClose(reason: SocketCloseReason) {
    this.setConnecting(false);
    this.connection = null;
    this.connectionController = null;
    this.connected = false;
    this.closeReason = reason;
    this.setStatus("closed");
    this.emit(Events.Close, reason);
    this.emitState();
  }

  private handleError(error: unknown) {
    return this.fail(error, true);
  }

  private fail(error: unknown, reconnect: boolean) {
    const err = toBizError(error);
    this.error = err;
    this.setConnecting(false);
    this.connected = false;
    this.setStatus("failed");
    this.emit(Events.Failed, err);
    this.emitState();
    if (reconnect) {
      this.scheduleReconnect();
    }
    return err;
  }

  private reportError(error: unknown) {
    const err = toBizError(error);
    this.error = err;
    this.emit(Events.Failed, err);
    this.emitState();
    return err;
  }

  private scheduleReconnect() {
    if (!this.reconnectEnabled || !this.shouldConnect || this.connected) {
      return false;
    }
    this.setStatus("reconnecting");
    if (this.reconnectTimer !== null) {
      this.emitState();
      return true;
    }
    this.reconnectAttempt += 1;
    const info: ChannelReconnectInfo = {
      attempt: this.reconnectAttempt,
      delay: this.reconnectDelay,
      scheduledAt: Date.now() + this.reconnectDelay,
    };
    this.nextReconnectAt = info.scheduledAt;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.nextReconnectAt = null;
      void this.beginConnect(true);
    }, this.reconnectDelay);
    this.emit(Events.Reconnecting, info);
    this.emitState();
    return true;
  }

  private cancelReconnect() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.nextReconnectAt = null;
  }

  private setConnecting(connecting: boolean) {
    if (this.connecting === connecting) {
      return;
    }
    this.connecting = connecting;
    this.emit(Events.ConnectingChange, connecting);
  }

  private setStatus(status: ChannelStatus) {
    if (this.status === status) {
      return;
    }
    this.status = status;
    this.emit(Events.StatusChange, status);
  }

  private emitState() {
    this.emit(Events.StateChange, { ...this.state });
  }

  beforeConnect(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.BeforeConnect]>,
  ) {
    return this.on(Events.BeforeConnect, handler);
  }

  onConnectingChange(
    handler: Handler<
      TheTypesOfEvents<TMessage, TSend>[Events.ConnectingChange]
    >,
  ) {
    return this.on(Events.ConnectingChange, handler);
  }

  onStatusChange(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.StatusChange]>,
  ) {
    return this.on(Events.StatusChange, handler);
  }

  onConnected(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Connected]>,
  ) {
    return this.on(Events.Connected, handler);
  }

  onReconnecting(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Reconnecting]>,
  ) {
    return this.on(Events.Reconnecting, handler);
  }

  onReconnected(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Reconnected]>,
  ) {
    return this.on(Events.Reconnected, handler);
  }

  onMessage(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Message]>,
  ) {
    return this.on(Events.Message, handler);
  }

  onMessageChange(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.MessageChange]>,
  ) {
    return this.on(Events.MessageChange, handler);
  }

  onSent(handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Sent]>) {
    return this.on(Events.Sent, handler);
  }

  onClose(handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Close]>) {
    return this.on(Events.Close, handler);
  }

  onFailed(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Failed]>,
    opt: Partial<{
      override: boolean;
    }> = {},
  ) {
    if (opt.override) {
      this.offEvent(Events.Failed);
    }
    return this.on(Events.Failed, handler);
  }

  onError(handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Failed]>) {
    return this.on(Events.Failed, handler);
  }

  onStateChange(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.StateChange]>,
  ) {
    return this.on(Events.StateChange, handler);
  }
}
