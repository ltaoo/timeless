import type { Catalog, ComponentDefinition } from "./types";
/** Discover links from the catalog's ComponentId/ChildList schema references. */
export function componentReferences(
  definition: ComponentDefinition,
  catalog: Catalog,
): string[] {
  const result: string[] = [];
  const schemas = catalog.schema.components as Record<string, unknown>;
  const walk = (schema: unknown, value: unknown, field = "") => {
    if (!schema || typeof schema !== "object" || value === undefined) return;
    const shape = schema as Record<string, unknown>;
    const ref = typeof shape.$ref === "string" ? shape.$ref : "";
    if (
      ref.endsWith("#/$defs/ComponentId") &&
      field !== "id" &&
      typeof value === "string"
    )
      result.push(value);
    if (ref.endsWith("#/$defs/ChildList")) {
      if (Array.isArray(value)) result.push(...(value as string[]));
      else result.push((value as { componentId: string }).componentId);
    }
    if (Array.isArray(shape.allOf))
      for (const part of shape.allOf) walk(part, value, field);
    if (shape.properties && value !== null && typeof value === "object")
      for (const [key, child] of Object.entries(shape.properties))
        walk(child, (value as Record<string, unknown>)[key], key);
    if (shape.items && Array.isArray(value))
      for (const item of value) walk(shape.items, item, field);
  };
  walk(schemas[definition.component], definition);
  return result;
}
