/**
 * @file Bidirectional channel core.
 */
import { BaseDomain, BizError, Handler, Result } from "@timeless/inner-base";

type MaybePromise<T> = T | Promise<T>;

export type ChannelStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "closing"
  | "closed"
  | "failed";

export type ChannelCloseReason = {
  code?: number;
  reason?: string;
  clean?: boolean;
  event?: unknown;
};

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

export type ChannelCoreProps<TMessage = unknown, TSend = unknown> = {
  _name?: string;
  hostname?: string;
  headers?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | null | undefined>;
  params?: any;
  initialMessage?: TSend;
  process?: (v: unknown, meta: ChannelMessageMeta) => TMessage;
  encode?: (v: TSend) => unknown;
  onConnected?: () => void;
  onMessage?: (message: TMessage) => void;
  onSent?: (message: ChannelSentMessage<TSend>) => void;
  onClose?: (reason: ChannelCloseReason) => void;
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
  closeReason: ChannelCloseReason | null;
};

enum Events {
  BeforeConnect,
  ConnectingChange,
  StatusChange,
  Connected,
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
  [Events.Message]: TMessage;
  [Events.MessageChange]: TMessage | null;
  [Events.Sent]: ChannelSentMessage<TSend>;
  [Events.Close]: ChannelCloseReason;
  [Events.Failed]: BizError;
  [Events.StateChange]: ChannelState<TMessage, TSend>;
};

let handler: null | ((v: ChannelCore<any, any>) => void) = null;

export function onChannelCreated(h: (v: ChannelCore<any, any>) => void) {
  handler = h;
}

export type TheMessageOfChannelCore<T extends ChannelCore<any, any>> =
  NonNullable<T["lastMessage"]>;

export type TheSendMessageOfChannelCore<T extends ChannelCore<any, any>> =
  NonNullable<T["lastSent"]>;

function isResult<T>(v: unknown): v is Result<T> {
  return !!v && typeof v === "object" && "error" in v && "data" in v;
}

async function toVoidResult(
  value: MaybePromise<Result<null> | void>,
): Promise<Result<null>> {
  try {
    const resolved = await value;
    if (isResult<null>(resolved)) {
      return resolved;
    }
    return Result.Ok(null);
  } catch (err) {
    return Result.Err(err as Error);
  }
}

function toBizError(error: unknown) {
  if (error instanceof BizError) {
    return error;
  }
  const r = Result.Err(error as Error);
  return r.error!;
}

export class ChannelCore<TMessage = unknown, TSend = unknown> extends BaseDomain<
  TheTypesOfEvents<TMessage, TSend>
> {
  _name = "ChannelCore";
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
  closeReason: ChannelCloseReason | null = null;
  pending: Promise<Result<null>> | null = null;
  id = String(this.uid());

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
    };
  }

  constructor(endpoint: unknown, props: ChannelCoreProps<TMessage, TSend> = {}) {
    super({ unique_id: props._name });

    const {
      _name,
      hostname = "",
      headers = {},
      query,
      params,
      initialMessage,
      process,
      encode,
      onConnected,
      onMessage,
      onSent,
      onClose,
      onFailed,
      onStatusChange,
      onConnecting,
    } = props;

    this.endpoint = endpoint;
    this.hostname = hostname;
    this.headers = headers;
    this.query = query;
    this.params = params;
    this.initialMessage = initialMessage;
    this.process = process;
    this.encode = encode;
    if (_name) {
      this._name = _name;
    }
    if (onConnected) {
      this.onConnected(onConnected);
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
    if (handler) {
      handler(this);
    }
    if (onFailed) {
      this.onFailed(onFailed, { override: true });
    }
  }

  async connect() {
    if (this.pending) {
      return this.pending;
    }
    const task = this.runConnect();
    this.pending = task;
    try {
      return await task;
    } finally {
      this.pending = null;
    }
  }

  private async runConnect() {
    if (this.connected) {
      return Result.Ok(null);
    }

    this.initial = false;
    this.error = null;
    this.closeReason = null;
    this.setConnecting(true);
    this.setStatus("connecting");
    this.emit(Events.BeforeConnect);
    this.emitState();

    const result = await toVoidResult(this.openConnection());
    if (result.error) {
      const error = this.fail(result.error);
      return Result.Err(error);
    }

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
    if (!this.connected) {
      return Result.Err("连接未建立");
    }
    const raw = this.encode ? this.encode(data) : data;
    const sent: ChannelSentMessage<TSend> = {
      data,
      raw,
      sentAt: Date.now(),
    };
    const result = await toVoidResult(this.postMessage(raw));
    if (result.error) {
      const error = this.fail(result.error);
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
    if (!this.connected && this.status !== "connecting") {
      this.handleClose({ code, reason, clean: true });
      return Result.Ok(null);
    }
    this.setConnecting(false);
    this.connected = false;
    this.setStatus("closing");
    this.emitState();
    const result = await toVoidResult(this.closeConnection(code, reason));
    if (result.error) {
      const error = this.fail(result.error);
      return Result.Err(error);
    }
    this.handleClose({ code, reason, clean: true });
    return Result.Ok(null);
  }

  disconnect(code?: number, reason?: string) {
    return this.close(code, reason);
  }

  reconnect() {
    if (!this.connected) {
      return this.connect();
    }
    return this.close(1000, "reconnect").then((r) => {
      if (r.error) {
        return r;
      }
      return this.connect();
    });
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

  setError(error: BizError) {
    this.error = error;
    this.emitState();
  }

  destroy() {
    this.close();
    super.destroy();
  }

  /**
   * Provider hook. For WebSocket this opens the socket; for Velo it registers
   * the Go message listener.
   */
  openConnection(): MaybePromise<Result<null> | void> {
    const tip = "请在 provider 中实现 openConnection 方法";
    console.log(tip);
    return Result.Err(tip);
  }

  /** Provider hook for messages sent from frontend to host. */
  postMessage(data: unknown): MaybePromise<Result<null> | void> {
    void data;
    const tip = "请在 provider 中实现 postMessage 方法";
    console.log(tip);
    return Result.Err(tip);
  }

  /** Provider hook for closing or unbinding the underlying channel. */
  closeConnection(
    code?: number,
    reason?: string,
  ): MaybePromise<Result<null> | void> {
    void code;
    void reason;
    const tip = "请在 provider 中实现 closeConnection 方法";
    console.log(tip);
    return Result.Err(tip);
  }

  handleConnected() {
    const wasConnected = this.connected && this.status === "connected";
    this.setConnecting(false);
    this.connected = true;
    this.setStatus("connected");
    if (!wasConnected) {
      this.emit(Events.Connected);
    }
    this.emitState();
  }

  receiveMessage(data: unknown, extra: Partial<ChannelMessageMeta> = {}) {
    try {
      const meta: ChannelMessageMeta = {
        raw: data,
        event: extra.event,
        receivedAt: extra.receivedAt ?? Date.now(),
      };
      const message = this.process ? this.process(data, meta) : (data as TMessage);
      this.lastMessage = message;
      this.emit(Events.Message, message);
      this.emit(Events.MessageChange, message);
      this.emitState();
    } catch (err) {
      this.fail(err);
    }
  }

  handleClose(reason: ChannelCloseReason = {}) {
    const wasClosed =
      !this.connected && this.status === "closed" && !!this.closeReason;
    this.setConnecting(false);
    this.connected = false;
    this.closeReason = reason;
    this.setStatus("closed");
    if (!wasClosed) {
      this.emit(Events.Close, reason);
    }
    this.emitState();
  }

  handleError(error: unknown) {
    return this.fail(error);
  }

  private fail(error: unknown) {
    const err = toBizError(error);
    this.error = err;
    this.setConnecting(false);
    this.connected = false;
    this.setStatus("failed");
    this.emit(Events.Failed, err);
    this.emitState();
    return err;
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
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.ConnectingChange]>,
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

  onOpen(
    handler: Handler<TheTypesOfEvents<TMessage, TSend>[Events.Connected]>,
  ) {
    return this.onConnected(handler);
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
