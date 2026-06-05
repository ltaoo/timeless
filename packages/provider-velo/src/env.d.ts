declare global {
  var __Version: string;

  interface Window {
    invoke?: VeloInvoke;
    goCall?: VeloInvoke;
    onGoMessage?: (handler: (payload: unknown) => void) => void;
    __goMessageHandlers?: Array<(payload: unknown) => void>;
  }
}

export type VeloInvoke = (
  url: string,
  options: {
    method?: string;
    headers?: Record<string, unknown[]>;
    args?: unknown;
  },
) => Promise<unknown>;

export {};
