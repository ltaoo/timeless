import { jsonSnapshot, pointer, readData, writeData } from "./data-model";
import { componentReferences } from "./schema-resolver";
import { ProtocolError, ProtocolValidator } from "./validation";
import type {
  A2UIOptions,
  Action,
  Catalog,
  ClientMessage,
  ComponentDefinition,
  FunctionCall,
  FunctionContext,
  JsonValue,
  ProtocolVersion,
  ServerMessage,
  SurfaceDefinition,
  TransportMetadata,
} from "./types";

export class SurfaceModel {
  readonly definition: SurfaceDefinition;
  readonly catalog: Catalog;
  readonly validator: ProtocolValidator;
  readonly version: ProtocolVersion;
  components = new Map<string, ComponentDefinition>();
  data: JsonValue | undefined = {};
  private listeners = new Set<() => void>();
  private locals = new Map<string, JsonValue>();
  private disposed = false;
  private options: A2UIOptions;
  constructor(
    definition: SurfaceDefinition,
    catalog: Catalog,
    validator: ProtocolValidator,
    version: ProtocolVersion,
    options: A2UIOptions,
  ) {
    this.definition = definition;
    this.catalog = catalog;
    this.validator = validator;
    this.version = version;
    this.options = options;
  }
  subscribe(listener: () => void): () => void {
    if (this.disposed)
      throw new ProtocolError("Surface is disposed", this.definition.surfaceId);
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  get subscriberCount(): number {
    return this.listeners.size;
  }
  notify(): void {
    const errors: unknown[] = [];
    for (const listener of [...this.listeners]) {
      try {
        listener();
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length)
      throw new AggregateError(errors, "Surface observers failed");
  }
  updateComponents(components: ComponentDefinition[]): void {
    const next = new Map(this.components);
    for (const component of components) next.set(component.id, component);
    const active = new Set<string>();
    const checked = new Set<string>();
    const visit = (id: string) => {
      if (active.has(id))
        throw new ProtocolError(
          "Cyclic component reference",
          this.definition.surfaceId,
          "/updateComponents/components",
        );
      if (checked.has(id) || !next.has(id)) return;
      active.add(id);
      for (const child of componentReferences(next.get(id)!, this.catalog))
        visit(child);
      active.delete(id);
      checked.add(id);
    };
    for (const id of next.keys()) visit(id);
    this.components = next;
    this.notify();
  }
  setData(path: string, value: JsonValue | undefined): void {
    if (this.disposed)
      throw new ProtocolError("Surface is disposed", this.definition.surfaceId);
    this.data = writeData(this.data, path, value);
    this.notify();
  }
  local(key: string, fallback: JsonValue): JsonValue {
    return this.locals.has(key) ? this.locals.get(key)! : fallback;
  }
  setLocal(key: string, value: JsonValue): void {
    this.locals.set(key, value);
    this.notify();
  }
  resolve(
    expression: unknown,
    scope = "/",
    action = false,
    depth = 0,
  ): unknown {
    if (depth > 32)
      throw new ProtocolError(
        "Function nesting is too deep",
        this.definition.surfaceId,
      );
    if (Array.isArray(expression))
      return expression.map((value) =>
        this.resolve(value, scope, action, depth + 1),
      );
    if (expression === null || typeof expression !== "object")
      return expression;
    const object = expression as Record<string, unknown>;
    if (typeof object.path === "string" && Object.keys(object).length === 1)
      return readData(this.data, pointer(object.path, scope));
    if (typeof object.call === "string")
      return this.call(
        object as unknown as FunctionCall,
        scope,
        action,
        depth + 1,
      );
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        key,
        this.resolve(value, scope, action, depth + 1),
      ]),
    );
  }
  private call(
    call: FunctionCall,
    scope: string,
    action: boolean,
    depth: number,
  ): unknown {
    this.validator.validateFunction(call, this.definition.surfaceId);
    const fn = Object.hasOwn(this.catalog.functions, call.call)
      ? this.catalog.functions[call.call]
      : undefined;
    if (!fn || (fn.actionOnly && !action))
      throw new ProtocolError(
        `Function is unavailable in this context: ${call.call}`,
        this.definition.surfaceId,
      );
    const context: FunctionContext = {
      locale: this.options.locale,
      read: (path) => readData(this.data, pointer(path, scope)),
      call: (name, args) =>
        this.call({ call: name, args }, scope, action, depth + 1),
    };
    return fn.execute(
      this.resolve(call.args ?? {}, scope, action, depth + 1) as Record<
        string,
        unknown
      >,
      context,
    );
  }
  input(definition: ComponentDefinition, scope: string): unknown {
    const value = definition.value;
    if (value && typeof value === "object" && "path" in value)
      return this.resolve(value, scope);
    return (
      this.locals.get(JSON.stringify([definition.id, scope, "input"])) ??
      this.resolve(value, scope)
    );
  }
  writeInput(
    definition: ComponentDefinition,
    scope: string,
    value: JsonValue,
  ): void {
    const binding = definition.value as { path?: unknown } | undefined;
    if (binding && typeof binding.path === "string")
      this.setData(pointer(binding.path, scope), value);
    else this.setLocal(JSON.stringify([definition.id, scope, "input"]), value);
  }
  errors(definition: ComponentDefinition, scope: string): string[] {
    const errors = (definition.checks ?? [])
      .filter((check) => !this.resolve(check.condition, scope))
      .map((check) => check.message);
    if (
      definition.component === "TextField" &&
      typeof definition.validationRegexp === "string" &&
      !new RegExp(definition.validationRegexp).test(
        String(this.input(definition, scope) ?? ""),
      )
    )
      errors.push("Value does not match the required format");
    return errors;
  }
  act(definition: ComponentDefinition, scope: string, action: Action): void {
    if (this.disposed) return;
    if (this.errors(definition, scope).length) return;
    if ("functionCall" in action) {
      this.resolve(action.functionCall, scope, true);
      return;
    }
    this.emit({
      version: this.version,
      action: {
        name: action.event.name,
        surfaceId: this.definition.surfaceId,
        sourceComponentId: definition.id,
        timestamp: new Date().toISOString(),
        context: jsonSnapshot(
          this.resolve(action.event.context ?? {}, scope),
        ) as Record<string, JsonValue>,
      },
    });
  }
  emit(message: ClientMessage): void {
    this.validator.validateClient(message, this.definition.surfaceId);
    const metadata: TransportMetadata = {
      a2uiClientCapabilities: {
        supportedCatalogIds: (this.options.catalogs ?? []).map(
          (catalog) => catalog.id,
        ),
      },
    };
    if (this.definition.sendDataModel)
      metadata.a2uiClientDataModel = {
        surfaces: { [this.definition.surfaceId]: jsonSnapshot(this.data) },
      };
    this.options.onClientMessage?.(message, metadata);
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.components.clear();
    this.locals.clear();
    this.data = undefined;
    try {
      this.notify();
    } finally {
      this.listeners.clear();
    }
  }
}

export class A2UIModel {
  readonly surfaces = new Map<string, SurfaceModel>();
  private options: A2UIOptions;
  private catalogs = new Map<
    string,
    { catalog: Catalog; validator: ProtocolValidator }
  >();
  private listeners = new Set<() => void>();
  private disposed = false;
  constructor(options: A2UIOptions) {
    this.options = options;
    for (const catalog of options.catalogs ?? []) {
      if (this.catalogs.has(catalog.id))
        throw new Error(`Duplicate catalog: ${catalog.id}`);
      this.catalogs.set(catalog.id, {
        catalog,
        validator: new ProtocolValidator(catalog),
      });
    }
  }
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  apply(message: unknown): void {
    if (this.disposed) throw new Error("A2UI model is disposed");
    let surfaceId = "";
    try {
      const envelope = message as Partial<ServerMessage>;
      const payload =
        envelope && typeof envelope === "object"
          ? (Object.values(envelope).find(
              (value) =>
                value && typeof value === "object" && "surfaceId" in value,
            ) as { surfaceId?: string; catalogId?: string } | undefined)
          : undefined;
      surfaceId =
        typeof payload?.surfaceId === "string" ? payload.surfaceId : "";
      const surface = this.surfaces.get(surfaceId);
      const entry =
        "createSurface" in (envelope ?? {})
          ? this.catalogs.get(String(payload?.catalogId))
          : surface
            ? this.catalogs.get(surface.definition.catalogId)
            : undefined;
      if (!entry)
        throw new ProtocolError(
          surface ? "Unsupported catalog" : "Unknown surface or catalog",
          surfaceId,
        );
      const validator: ProtocolValidator = entry.validator;
      validator.validate(message, surfaceId);
      if ("createSurface" in message) {
        if (surface)
          throw new ProtocolError("Surface already exists", surfaceId);
        this.surfaces.set(
          surfaceId,
          new SurfaceModel(
            message.createSurface,
            entry.catalog,
            entry.validator,
            message.version,
            this.options,
          ),
        );
        for (const listener of [...this.listeners]) listener();
      } else if ("updateComponents" in message)
        surface!.updateComponents(message.updateComponents.components);
      else if ("updateDataModel" in message)
        surface!.setData(
          message.updateDataModel.path ?? "/",
          message.updateDataModel.value,
        );
      else {
        this.surfaces.delete(surfaceId);
        surface!.dispose();
        for (const listener of [...this.listeners]) listener();
      }
    } catch (error) {
      const failure =
        error instanceof ProtocolError
          ? error
          : new ProtocolError(
              error instanceof Error ? error.message : String(error),
              surfaceId,
            );
      this.options.onClientMessage?.(
        {
          version: "v0.9.1",
          error: {
            code: "VALIDATION_FAILED",
            surfaceId,
            path: failure.path,
            message: failure.message,
          },
        },
        {
          a2uiClientCapabilities: {
            supportedCatalogIds: [...this.catalogs.keys()],
          },
        },
      );
      throw failure;
    }
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const errors: unknown[] = [];
    for (const surface of this.surfaces.values()) {
      try {
        surface.dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    this.surfaces.clear();
    for (const listener of [...this.listeners]) {
      try {
        listener();
      } catch (error) {
        errors.push(error);
      }
    }
    this.listeners.clear();
    if (errors.length)
      throw new AggregateError(errors, "A2UI model cleanup failed");
  }
}
