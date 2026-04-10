// import type { VNodeStyle } from "./types";

export interface AnimationConfig {
  // property: keyof VNodeStyle;
  from?: any;
  to: any;
  duration: number;
  easing?: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
  delay?: number;
}

