import { ref, refarr, refobj, isRef } from "@timeless/reactive";

/**
 * Convert plain data object to reactive data for client-side hydration.
 *
 * - Primitive values (number, string, boolean) → ref()
 * - Arrays → refarr()
 * - Nested objects → recursive conversion with Proxy
 *
 * This allows the same component code to work on both server and client:
 * - Server: uses plain values for SSR
 * - Client: uses reactive refs for interactivity
 *
 * @example
 * ```js
 * const data = createReactiveData({
 *   count: 0,
 *   fruits: ["Apple", "Banana"],
 *   user: { name: "John" }
 * });
 *
 * // data.count is ref(0)
 * // data.fruits is refarr(["Apple", "Banana"])
 * // data.user.name is ref("John")
 * ```
 */
export function createReactiveData<T extends Record<string, any>>(
  data: T,
): ReactiveData<T> {
  const reactiveStore: Record<string, any> = {};

  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

    const value = data[key];
    reactiveStore[key] = convertToReactive(value);
  }

  // Create proxy for natural access syntax (data.count++ instead of data.count.value++)
  return new Proxy(reactiveStore, {
    get(target, prop, receiver) {
      // Handle symbols and special properties
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }

      if (prop === "__isReactiveData") return true;
      if (prop === "__raw") return target;

      const val = target[prop];
      if (val === undefined) return undefined;

      // Return the ref itself for template binding
      // Templates like [count] will use the ref directly
      return val;
    },
    set(target, prop, newValue, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.set(target, prop, newValue, receiver);
      }

      const current = target[prop];

      if (isRef(current)) {
        // Update existing ref
        if (typeof current.as === "function") {
          current.as(newValue);
        } else if ("value" in current) {
          current.value = newValue;
        }
      } else {
        // Create new reactive value
        target[prop] = convertToReactive(newValue);
      }

      return true;
    },
    has(target, prop) {
      return prop in target || prop === "__isReactiveData" || prop === "__raw";
    },
    ownKeys(target) {
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
  }) as ReactiveData<T>;
}

/**
 * Convert a single value to its reactive equivalent
 */
function convertToReactive(value: any): any {
  // Already reactive
  if (isRef(value)) {
    return value;
  }

  // Null or undefined
  if (value === null || value === undefined) {
    return ref(value);
  }

  // Array → refarr
  if (Array.isArray(value)) {
    // Recursively convert array items if they are objects
    const convertedItems = value.map((item) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        // For objects inside arrays, we don't wrap them in reactive
        // because refarr already handles object proxying
        return item;
      }
      return item;
    });
    return refarr(convertedItems);
  }

  // Object → recursive conversion
  if (typeof value === "object") {
    return createReactiveData(value);
  }

  // Primitive → ref
  return ref(value);
}

/**
 * Check if a value is reactive data created by createReactiveData
 */
export function isReactiveData(value: any): value is ReactiveData<any> {
  return value && value.__isReactiveData === true;
}

/**
 * Get the raw reactive store from reactive data
 */
export function getRawReactiveStore(
  data: ReactiveData<any>,
): Record<string, any> {
  return data.__raw;
}

// Type definitions
type ReactiveValue<T> = T extends any[]
  ? ReturnType<typeof refarr<T[number]>>
  : T extends object
    ? ReactiveData<T>
    : ReturnType<typeof ref<T>>;

export type ReactiveData<T extends Record<string, any>> = {
  [K in keyof T]: ReactiveValue<T[K]>;
} & {
  __isReactiveData: true;
  __raw: Record<string, any>;
};
