import type { ChartCapability } from "./types";

export const chartCapability: ChartCapability = {
  version: 1,
  chartTypes: ["area"],
  curves: ["linear", "monotone"],
  primitives: ["path"],
  paints: ["none", "color", "linear-gradient"],
  hostDependencies: [],
};
