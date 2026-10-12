import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ProtocolValidator, createBasicCatalog } from "../index";
const directory = fileURLToPath(new URL("./fixtures", import.meta.url));
const validator: ProtocolValidator = new ProtocolValidator(
  createBasicCatalog(),
);
interface Fixture {
  schema: string;
  tests: { description: string; valid: boolean; data: unknown }[];
}
describe("official v0.9.1 schema conformance fixtures", () => {
  for (const filename of readdirSync(directory).filter((filename) =>
    filename.endsWith(".json"),
  )) {
    const fixture = JSON.parse(
      readFileSync(`${directory}/${filename}`, "utf8"),
    ) as Fixture;
    for (const test of fixture.tests) {
      it(`${filename}: ${test.description}`, () => {
        const validate = () =>
          fixture.schema === "client_to_server.json"
            ? validator.validateClient(test.data)
            : validator.validate(test.data);
        if (test.valid) expect(validate).not.toThrow();
        else expect(validate).toThrow();
      });
    }
  }
});
