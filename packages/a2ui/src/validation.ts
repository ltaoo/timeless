import Ajv2020, {
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import server_schema from "./schemas/server_to_client.json";
import client_schema from "./schemas/client_to_server.json";
import common_schema from "./schemas/common_types.json";
import type { Catalog, ClientMessage, ServerMessage } from "./types";
export class ProtocolError extends Error {
  readonly path: string;
  readonly surfaceId: string;
  constructor(message: string, surfaceId = "", path = "/") {
    super(message);
    this.name = "ProtocolError";
    this.path = path;
    this.surfaceId = surfaceId;
  }
}
export class ProtocolValidator {
  private server: ValidateFunction<ServerMessage>;
  private client: ValidateFunction<ClientMessage>;
  private functions: ValidateFunction;
  constructor(catalog: Catalog) {
    const ajv = new Ajv2020({
      strict: false,
      allErrors: true,
      ownProperties: true,
    });
    addFormats(ajv);
    ajv.addSchema(
      catalog.schema,
      "https://a2ui.org/specification/v0_9/catalog.json",
    );
    ajv.addSchema(common_schema);
    this.server = ajv.compile<ServerMessage>(server_schema);
    this.client = ajv.compile<ClientMessage>(client_schema);
    this.functions = ajv.compile({
      $ref: `${catalog.schema.$id}#/$defs/anyFunction`,
    });
  }
  validate(message: unknown, surfaceId = ""): asserts message is ServerMessage {
    if (!this.server(message)) this.fail(this.server.errors, surfaceId);
  }
  validateClient(
    message: unknown,
    surfaceId = "",
  ): asserts message is ClientMessage {
    if (!this.client(message)) this.fail(this.client.errors, surfaceId);
  }
  validateFunction(call: unknown, surfaceId: string): void {
    if (!this.functions(call)) this.fail(this.functions.errors, surfaceId);
  }
  private fail(
    errors: ErrorObject[] | null | undefined,
    surfaceId: string,
  ): never {
    const error = [...(errors ?? [])].sort(
      (a, b) => b.instancePath.length - a.instancePath.length,
    )[0];
    throw new ProtocolError(
      error?.message ?? "Invalid A2UI message",
      surfaceId,
      error?.instancePath || "/",
    );
  }
}
