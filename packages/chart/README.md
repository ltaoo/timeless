# @timeless/chart

Host-neutral chart state for Timeless.

This package computes chart layout, scales, paths, paints, and render primitives in plain JavaScript. It does not depend on SVG, Canvas, DOM, React, or any other rendering host. A host renderer can consume `state.primitives` and map each `PathCommand` to its own drawing API.

```ts
import { createChartState } from "@timeless/chart";

const state = createChartState({
  type: "area",
  data: speedChart,
  width: 240,
  height: 48,
  x: "time",
  y: "speed",
  yDomain: [0, "auto"],
  curve: "monotone",
  style: {
    stroke: "#22c55e",
    strokeWidth: 1.5,
  },
});

for (const primitive of state.primitives) {
  // SVG, Canvas, terminal, native, or another host renders this state directly.
  console.log(primitive.role, primitive.commands);
}
```
