// Timeless umbrella package - re-exports all subpackages
console.log("timeless.version" + __Version);

// Re-export primitive (rendering layer)
export * from "@timeless/primitive";

// Re-export base packages
export * from "@timeless/base";

// Namespace exports
export * as base from "@timeless/base";
export * as reactive from "@timeless/reactive";
export * as utils from "@timeless/utils";
export * as kit from "@timeless/kit";
export * as ui from "@timeless/ui";
