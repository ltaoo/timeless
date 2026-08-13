import { Result } from "@timeless/inner-base";

export type MaybePromise<T> = T | Promise<T>;

export type SocketCloseReason = {
  code?: number;
  reason?: string;
  clean?: boolean;
  event?: unknown;
};

export type SocketMessageMeta = {
  event?: unknown;
  receivedAt?: number;
};

export type SocketConnection = {
  send: (data: unknown) => MaybePromise<Result<null> | void>;
  close: (code?: number, reason?: string) => MaybePromise<Result<null> | void>;
};

export type SocketOpenOptions = {
  endpoint: unknown;
  hostname: string;
  headers: Record<string, string | number>;
  query?: Record<string, string | number | boolean | null | undefined>;
  params?: any;
  signal: AbortSignal;
  onMessage: (data: unknown, meta?: SocketMessageMeta) => void;
  onClose: (reason: SocketCloseReason) => void;
  onError: (error: unknown) => void;
};

/**
 * Socket transport abstraction. Platform providers implement `open`; the
 * channel domain owns connection state, message processing, and reconnection.
 */
export class SocketClientCore {
  open(options: SocketOpenOptions): MaybePromise<Result<SocketConnection>> {
    void options;
    const tip = "请通过 provider 实现 SocketClientCore.open 方法";
    console.log(tip);
    return Result.Err(tip);
  }
}
