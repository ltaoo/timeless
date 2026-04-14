console.log("primitive.version " + __Version);

export * from "./reactive/for";
export * from "./reactive/show";
export * from "./reactive/match";

// Content
export * from "./content/view";
export * from "./content/fragment";
export * from "./content/icon";
export * from "./content/popper";
export * from "./content/list-view";
export * from "./content/portal";
export * from "./content/lazy-view";
export * from "./content/type";
export * as SVG from "./content/svg";
export * from "./content/img";
export * from "./content/label";
export * from "./content/style";
export * from "./content/rich-text";
export * from "./content/aspect-ratio";
export * from "./content/text";

// content
export * from "./layout/flex";
export * from "./layout/grid";
export * from "./layout/row";
export * from "./layout/column";
export * from "./style";
export * from "./util/lazy";
export * from "./util/h";
export * from "./util/listener";
export * from "./interaction/dismissable";

export * from "./event";

// Input
export * from "./input/input";
export * from "./input/number-input";
export * from "./input/password-input";
export * from "./input/checkbox";
export * from "./input/select";
export * from "./input/slider";
export * from "./input/file-picker";
export * from "./input/textarea";
export * from "./input/radio";

export * from "./interaction/link";
export * from "./interaction/button";

export * from "./vnode/view";
export { setPlatform } from "./platform";
export type { Platform } from "./platform";
export { getPlatform } from "./platform";

export { Logger, Result, base } from "@timeless/base";
export type { Handler } from "@timeless/base";
