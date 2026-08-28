export type AnalyticsEventName =
  | "session_start"
  | "page_view"
  | "click"
  | "input"
  | "form_submit"
  | "request"
  | "identify"
  | (string & {});

export interface AnalyticsEvent {
  event_id: string;
  event: AnalyticsEventName;
  timestamp: number;
  app_id: string;
  anonymous_id: string;
  session_id: string;
  user_id?: string;
  context: Record<string, unknown>;
  properties: Record<string, unknown>;
}

export interface AnalyticsPayload {
  app_id: string;
  sent_at: number;
  events: AnalyticsEvent[];
}

export interface AnalyticsCaptureOptions {
  page_views?: boolean;
  clicks?: boolean;
  inputs?: boolean;
  forms?: boolean;
  requests?: boolean;
}

export interface AnalyticsTransportContext {
  unloading: boolean;
}

export interface AnalyticsOptions {
  app_id: string;
  endpoint?: string;
  transport?: (
    payload: AnalyticsPayload,
    context: AnalyticsTransportContext,
  ) => void | Promise<void>;
  headers?: Record<string, string>;
  capture?: boolean | AnalyticsCaptureOptions;
  batch_size?: number;
  max_queue_size?: number;
  flush_interval?: number;
  session_timeout?: number;
  click_selector?: string;
  exclude_selector?: string;
  sensitive_selector?: string;
  capture_text?: boolean;
  capture_input_values?: boolean;
  capture_url_query?: boolean;
  capture_url_hash?: boolean;
  common_properties?: Record<string, unknown>;
  request_filter?: (url: string) => boolean;
  before_send?: (event: AnalyticsEvent) => AnalyticsEvent | null;
  storage?: Storage | false;
}

interface NormalizedCaptureOptions {
  page_views: boolean;
  clicks: boolean;
  inputs: boolean;
  forms: boolean;
  requests: boolean;
}

interface NormalizedOptions extends Omit<AnalyticsOptions, "capture"> {
  capture: NormalizedCaptureOptions;
  batch_size: number;
  max_queue_size: number;
  flush_interval: number;
  session_timeout: number;
  click_selector: string;
  exclude_selector: string;
  sensitive_selector: string;
  capture_text: boolean;
  capture_input_values: boolean;
  capture_url_query: boolean;
  capture_url_hash: boolean;
  common_properties: Record<string, unknown>;
}

interface StoredSession {
  session_id: string;
  last_activity: number;
}

const default_capture: NormalizedCaptureOptions = {
  page_views: true,
  clicks: true,
  inputs: true,
  forms: true,
  requests: true,
};

const now = () => Date.now();

function random_id(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function get_storage(storage: Storage | false | undefined): Storage | null {
  if (storage === false) return null;
  if (storage) return storage;
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function get_url(): string {
  return typeof location === "undefined" ? "" : location.href;
}

function get_referrer(): string {
  return typeof document === "undefined" ? "" : document.referrer;
}

function duration_since(start: number): number {
  return Math.max(0, Math.round(performance_now() - start));
}

function performance_now(): number {
  return typeof performance === "undefined" ? now() : performance.now();
}

function normalize_options(options: AnalyticsOptions): NormalizedOptions {
  if (!options.app_id?.trim()) throw new Error("analytics: app_id is required");
  if (!options.endpoint && !options.transport) {
    throw new Error("analytics: endpoint or transport is required");
  }

  const capture =
    options.capture === false
      ? {
          page_views: false,
          clicks: false,
          inputs: false,
          forms: false,
          requests: false,
        }
      : {
          ...default_capture,
          ...(typeof options.capture === "object" ? options.capture : {}),
        };

  return {
    ...options,
    capture,
    batch_size: Math.max(1, options.batch_size ?? 20),
    max_queue_size: Math.max(1, options.max_queue_size ?? 1000),
    flush_interval: Math.max(0, options.flush_interval ?? 5000),
    session_timeout: Math.max(1000, options.session_timeout ?? 30 * 60 * 1000),
    click_selector:
      options.click_selector ??
      "a,button,input[type=button],input[type=submit],[role=button],[data-analytics-click]",
    exclude_selector: options.exclude_selector ?? "[data-analytics-ignore]",
    sensitive_selector:
      options.sensitive_selector ??
      "input[type=password],[data-analytics-mask],[data-private]",
    capture_text: options.capture_text ?? false,
    capture_input_values: options.capture_input_values ?? false,
    capture_url_query: options.capture_url_query ?? false,
    capture_url_hash: options.capture_url_hash ?? true,
    common_properties: { ...(options.common_properties || {}) },
  };
}

function safe_closest(element: Element, selector: string): Element | null {
  try {
    return element.closest(selector);
  } catch {
    return null;
  }
}

function event_element(event: Event): Element | null {
  const path = event.composedPath?.();
  const target = path?.[0] ?? event.target;
  return target instanceof Element ? target : null;
}

function short_text(value: string | null | undefined, limit = 200): string {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function element_path(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;

  while (current && parts.length < 5) {
    const semantic_name = current.getAttribute("data-n");
    if (semantic_name) {
      parts.unshift(`[data-n=${JSON.stringify(semantic_name)}]`);
      break;
    }
    if (current.id) {
      parts.unshift(`#${current.id}`);
      break;
    }

    const tag = current.tagName.toLowerCase();
    const siblings = current.parentElement
      ? Array.from(current.parentElement.children).filter(
          (child) => child.tagName === current!.tagName,
        )
      : [];
    parts.unshift(
      siblings.length > 1
        ? `${tag}:nth-of-type(${siblings.indexOf(current) + 1})`
        : tag,
    );
    current = current.parentElement;
  }
  return parts.join(" > ");
}

function input_kind(element: Element): string {
  return (
    element.getAttribute("type") ||
    (element instanceof HTMLTextAreaElement
      ? "textarea"
      : element instanceof HTMLSelectElement
        ? "select"
        : "text")
  ).toLowerCase();
}

function request_details(
  input: RequestInfo | URL,
  init?: RequestInit,
): { method: string; url: string } {
  if (typeof Request !== "undefined" && input instanceof Request) {
    return {
      method: (init?.method || input.method || "GET").toUpperCase(),
      url: input.url,
    };
  }
  return {
    method: (init?.method || "GET").toUpperCase(),
    url: String(input),
  };
}

function observe_browser(model: Analytics): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const cleanups: Array<() => void> = [];
  const listen = (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions | boolean,
  ) => {
    target.addEventListener(type, listener, options);
    cleanups.push(() => target.removeEventListener(type, listener, options));
  };

  listen(
    document,
    "click",
    ((event: MouseEvent) => {
      const target = event_element(event);
      if (!target) return;
      const element = safe_closest(target, model.options.click_selector);
      if (element) model.capture_element("click", element);
    }) as EventListener,
    true,
  );

  listen(
    document,
    "change",
    ((event: Event) => {
      const element = event_element(event);
      if (element?.matches("input,textarea,select")) {
        model.capture_element("input", element);
      }
    }) as EventListener,
    true,
  );

  listen(
    document,
    "submit",
    ((event: Event) => {
      const element = event_element(event);
      if (element instanceof HTMLFormElement) {
        model.capture_element("form_submit", element);
      }
    }) as EventListener,
    true,
  );

  const capture_navigation = (navigation_type: string) => {
    queueMicrotask(() => model.capture_page(get_url(), navigation_type));
  };
  const original_push_state = history.pushState;
  const original_replace_state = history.replaceState;
  const wrapped_push_state: History["pushState"] = function (...args) {
    original_push_state.apply(history, args);
    capture_navigation("push_state");
  };
  const wrapped_replace_state: History["replaceState"] = function (...args) {
    original_replace_state.apply(history, args);
    capture_navigation("replace_state");
  };
  history.pushState = wrapped_push_state;
  history.replaceState = wrapped_replace_state;
  cleanups.push(() => {
    if (history.pushState === wrapped_push_state)
      history.pushState = original_push_state;
    if (history.replaceState === wrapped_replace_state) {
      history.replaceState = original_replace_state;
    }
  });
  listen(window, "popstate", () => capture_navigation("pop_state"));
  listen(window, "hashchange", () => capture_navigation("hash_change"));

  if (typeof window.fetch === "function") {
    const original_fetch = window.fetch;
    const wrapped_fetch: typeof window.fetch = async function (input, init) {
      const details = request_details(input, init);
      const start = performance_now();
      try {
        const response = await original_fetch.call(window, input, init);
        model.capture_request({
          ...details,
          status: response.status,
          duration: duration_since(start),
          transport: "fetch",
        });
        return response;
      } catch (error) {
        model.capture_request({
          ...details,
          status: 0,
          duration: duration_since(start),
          transport: "fetch",
          error: error instanceof Error ? error.name : "Error",
        });
        throw error;
      }
    };
    window.fetch = wrapped_fetch;
    cleanups.push(() => {
      if (window.fetch === wrapped_fetch) window.fetch = original_fetch;
    });
  }

  if (typeof XMLHttpRequest !== "undefined") {
    const requests = new WeakMap<
      XMLHttpRequest,
      { method: string; url: string; start?: number }
    >();
    const original_open = XMLHttpRequest.prototype.open;
    const original_send = XMLHttpRequest.prototype.send;
    const wrapped_open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      ...args: unknown[]
    ) {
      requests.set(this, { method: method.toUpperCase(), url: String(url) });
      return (original_open as Function).call(this, method, url, ...args);
    } as typeof original_open;
    const wrapped_send = function (
      this: XMLHttpRequest,
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      const details = requests.get(this);
      if (details) {
        details.start = performance_now();
        this.addEventListener(
          "loadend",
          () => {
            model.capture_request({
              method: details.method,
              url: details.url,
              status: this.status,
              duration: duration_since(details.start!),
              transport: "xhr",
            });
          },
          { once: true },
        );
      }
      return original_send.call(this, body);
    } as typeof original_send;
    XMLHttpRequest.prototype.open = wrapped_open;
    XMLHttpRequest.prototype.send = wrapped_send;
    cleanups.push(() => {
      if (XMLHttpRequest.prototype.open === wrapped_open) {
        XMLHttpRequest.prototype.open = original_open;
      }
      if (XMLHttpRequest.prototype.send === wrapped_send) {
        XMLHttpRequest.prototype.send = original_send;
      }
    });
  }

  listen(window, "pagehide", () => void model.flush(true).catch(() => {}));
  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}

export class Analytics {
  readonly options: NormalizedOptions;
  private readonly storage: Storage | null;
  private readonly storage_key: string;
  private anonymous_id: string;
  private user_id?: string;
  private session?: StoredSession;
  private last_page = "";
  private queue: AnalyticsEvent[] = [];
  private sending?: Promise<void>;
  private stop_observing?: () => void;
  private flush_timer?: ReturnType<typeof setInterval>;
  private transporting = false;
  private enabled: boolean;

  constructor(options: AnalyticsOptions) {
    this.options = normalize_options(options);
    this.storage = get_storage(options.storage);
    this.storage_key = `analytics:${this.options.app_id}`;
    this.anonymous_id = this.read("anonymous_id") || random_id();
    this.user_id = this.read("user_id") || undefined;
    this.enabled = this.read("opt_out") !== "1";
    this.session = this.read_json<StoredSession>("session");
    this.write("anonymous_id", this.anonymous_id);
  }

  start(): this {
    if (!this.enabled || this.stop_observing) return this;
    this.stop_observing = observe_browser(this);
    this.capture_page(get_url(), "load");
    if (this.options.flush_interval > 0) {
      this.flush_timer = setInterval(
        () => void this.flush().catch(() => {}),
        this.options.flush_interval,
      );
    }
    return this;
  }

  stop(): this {
    this.stop_observing?.();
    this.stop_observing = undefined;
    if (this.flush_timer) clearInterval(this.flush_timer);
    this.flush_timer = undefined;
    return this;
  }

  track(
    event: AnalyticsEventName,
    properties: Record<string, unknown> = {},
  ): this {
    if (!this.enabled || !event) return this;
    const session_started = this.touch_session();
    if (session_started && event !== "session_start") {
      this.enqueue(this.create_event("session_start", {}));
    }
    this.enqueue(this.create_event(event, properties));
    return this;
  }

  identify(user_id: string, properties: Record<string, unknown> = {}): this {
    if (!user_id.trim()) throw new Error("analytics: user_id cannot be empty");
    this.user_id = user_id;
    this.write("user_id", user_id);
    return this.track("identify", properties);
  }

  register(properties: Record<string, unknown>): this {
    Object.assign(this.options.common_properties, properties);
    return this;
  }

  capture_page(url: string, navigation_type = "manual"): this {
    if (!this.options.capture.page_views || !url) return this;
    const to = this.sanitize_url(url);
    if (!to || to === this.last_page) return this;
    const from = this.last_page || this.sanitize_url(get_referrer());
    this.last_page = to;
    return this.track("page_view", { from, to, navigation_type });
  }

  capture_element(
    event: "click" | "input" | "form_submit",
    element: Element,
  ): this {
    const enabled =
      (event === "click" && this.options.capture.clicks) ||
      (event === "input" && this.options.capture.inputs) ||
      (event === "form_submit" && this.options.capture.forms);
    if (!enabled || safe_closest(element, this.options.exclude_selector))
      return this;

    const masked = Boolean(
      safe_closest(element, this.options.sensitive_selector),
    );
    const properties: Record<string, unknown> = {
      tag: element.tagName.toLowerCase(),
      semantic_name:
        element.getAttribute("data-n") ||
        element.getAttribute("data-analytics-name") ||
        element.getAttribute("aria-label") ||
        element.getAttribute("name") ||
        element.id ||
        undefined,
      id: element.id || undefined,
      class: short_text(element.getAttribute("class")),
      role: element.getAttribute("role") || undefined,
      path: element_path(element),
    };

    if (element instanceof HTMLAnchorElement) {
      properties.href = this.sanitize_url(element.href);
    }
    if (this.options.capture_text && !masked && event === "click") {
      properties.text = short_text(element.textContent);
    }
    if (element instanceof HTMLFormElement) {
      properties.action = this.sanitize_url(element.action);
      properties.method = element.method.toUpperCase();
    }
    if (
      event === "input" &&
      (element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLSelectElement)
    ) {
      properties.input_type = input_kind(element);
      if (
        element instanceof HTMLInputElement &&
        ["checkbox", "radio"].includes(element.type)
      ) {
        properties.checked = element.checked;
      } else if (!masked) {
        properties.value_length = element.value.length;
        if (this.options.capture_input_values) properties.value = element.value;
      }
    }
    return this.track(event, properties);
  }

  capture_request(properties: {
    method: string;
    url: string;
    status: number;
    duration: number;
    transport: "fetch" | "xhr" | string;
    error?: string;
  }): this {
    if (
      this.transporting ||
      !this.options.capture.requests ||
      !this.should_capture_request(properties.url)
    ) {
      return this;
    }
    return this.track("request", {
      ...properties,
      url: this.sanitize_url(properties.url),
      success: properties.status >= 200 && properties.status < 400,
    });
  }

  opt_out(): this {
    this.enabled = false;
    this.queue = [];
    this.write("opt_out", "1");
    return this.stop();
  }

  opt_in(): this {
    this.enabled = true;
    this.remove("opt_out");
    return this.start();
  }

  reset(): this {
    this.remove("anonymous_id");
    this.remove("user_id");
    this.remove("session");
    this.anonymous_id = random_id();
    this.user_id = undefined;
    this.session = undefined;
    this.last_page = "";
    this.queue = [];
    this.write("anonymous_id", this.anonymous_id);
    return this;
  }

  flush(unloading = false): Promise<void> {
    if (this.sending) return this.sending;
    this.sending = this.flush_queue(unloading).finally(() => {
      this.sending = undefined;
    });
    return this.sending;
  }

  private create_event(
    event: AnalyticsEventName,
    properties: Record<string, unknown>,
  ): AnalyticsEvent {
    return {
      event_id: random_id(),
      event,
      timestamp: now(),
      app_id: this.options.app_id,
      anonymous_id: this.anonymous_id,
      session_id: this.session!.session_id,
      ...(this.user_id ? { user_id: this.user_id } : {}),
      context: this.context(),
      properties: { ...this.options.common_properties, ...properties },
    };
  }

  private context(): Record<string, unknown> {
    const url = this.sanitize_url(get_url());
    let path = "";
    try {
      path = new URL(url).pathname;
    } catch {
      path = url;
    }
    return {
      url,
      path,
      title: typeof document === "undefined" ? "" : document.title,
      language: typeof navigator === "undefined" ? "" : navigator.language,
      viewport:
        typeof window === "undefined"
          ? undefined
          : { width: window.innerWidth, height: window.innerHeight },
    };
  }

  private enqueue(event: AnalyticsEvent): void {
    let next_event: AnalyticsEvent | null = event;
    try {
      if (this.options.before_send)
        next_event = this.options.before_send(event);
    } catch {
      next_event = null;
    }
    if (!next_event) return;
    this.queue.push(next_event);
    if (this.queue.length > this.options.max_queue_size) this.queue.shift();
    if (this.queue.length >= this.options.batch_size) {
      void this.flush().catch(() => {});
    }
  }

  private touch_session(): boolean {
    const current_time = now();
    const is_new =
      !this.session ||
      current_time - this.session.last_activity > this.options.session_timeout;
    this.session = {
      session_id: is_new ? random_id() : this.session!.session_id,
      last_activity: current_time,
    };
    this.write("session", JSON.stringify(this.session));
    return is_new;
  }

  private sanitize_url(value: string): string {
    if (!value) return "";
    try {
      const url = new URL(value, get_url() || "http://localhost");
      if (!this.options.capture_url_query) url.search = "";
      if (!this.options.capture_url_hash) url.hash = "";
      return url.href;
    } catch {
      return value.split("?")[0].slice(0, 2048);
    }
  }

  private should_capture_request(url: string): boolean {
    if (this.options.request_filter && !this.options.request_filter(url))
      return false;
    if (!this.options.endpoint) return true;
    return this.sanitize_url(url) !== this.sanitize_url(this.options.endpoint);
  }

  private async flush_queue(unloading: boolean): Promise<void> {
    while (this.queue.length) {
      const events = this.queue.splice(0, this.options.batch_size);
      const payload: AnalyticsPayload = {
        app_id: this.options.app_id,
        sent_at: now(),
        events,
      };
      try {
        await this.send(payload, unloading);
      } catch (error) {
        this.queue.unshift(...events);
        throw error;
      }
    }
  }

  private async send(
    payload: AnalyticsPayload,
    unloading: boolean,
  ): Promise<void> {
    this.transporting = true;
    try {
      if (this.options.transport) {
        await this.options.transport(payload, { unloading });
        return;
      }

      const body = JSON.stringify(payload);
      if (
        unloading &&
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function" &&
        Object.keys(this.options.headers || {}).length === 0
      ) {
        if (
          navigator.sendBeacon(
            this.options.endpoint!,
            new Blob([body], { type: "application/json" }),
          )
        ) {
          return;
        }
      }

      const response = await fetch(this.options.endpoint!, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...this.options.headers,
        },
        body,
        keepalive: unloading,
      });
      if (!response.ok)
        throw new Error(`analytics: endpoint returned ${response.status}`);
    } finally {
      this.transporting = false;
    }
  }

  private read(name: string): string | null {
    try {
      return this.storage?.getItem(`${this.storage_key}:${name}`) ?? null;
    } catch {
      return null;
    }
  }

  private read_json<T>(name: string): T | undefined {
    try {
      const value = this.read(name);
      return value ? (JSON.parse(value) as T) : undefined;
    } catch {
      return undefined;
    }
  }

  private write(name: string, value: string): void {
    try {
      this.storage?.setItem(`${this.storage_key}:${name}`, value);
    } catch {
      // Storage denial must not break the host application.
    }
  }

  private remove(name: string): void {
    try {
      this.storage?.removeItem(`${this.storage_key}:${name}`);
    } catch {
      // Storage denial must not break the host application.
    }
  }
}

export function init_analytics(options: AnalyticsOptions): Analytics {
  return new Analytics(options).start();
}
