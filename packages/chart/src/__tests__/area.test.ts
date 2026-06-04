import { describe, expect, it } from "vitest";

import {
  chartCapability,
  createAreaChartState,
  createChartState,
  serializePathCommands,
} from "../index";

describe("createAreaChartState", () => {
  it("creates host-neutral area state from speed data", () => {
    const state = createAreaChartState({
      id: "speed",
      data: [
        { time: 0, speed: 0 },
        { time: 1, speed: 100 },
        { time: 2, speed: 200 },
      ],
      width: 100,
      height: 50,
      x: "time",
      y: "speed",
      yDomain: [0, "auto"],
      curve: "linear",
      style: {
        stroke: "#22c55e",
        strokeWidth: 1.5,
      },
    });

    expect(state.type).toBe("area");
    expect(state.xScale.domain).toEqual([0, 2]);
    expect(state.yScale.domain).toEqual([0, 200]);
    expect(state.series[0].baselineY).toBe(50);
    expect(state.series[0].samples.map(({ x, y }) => [x, y])).toEqual([
      [0, 50],
      [50, 25],
      [100, 0],
    ]);
    expect(state.primitives.map((primitive) => primitive.role)).toEqual([
      "area-fill",
      "area-stroke",
    ]);
  });

  it("uses cubic commands for monotone curves without requiring a host", () => {
    const state = createAreaChartState({
      data: [
        { speed: 10 },
        { speed: 30 },
        { speed: 20 },
      ],
      width: 90,
      height: 30,
      y: "speed",
    });

    expect(state.series[0].curve).toBe("monotone");
    expect(state.series[0].linePath.some((command) => command.type === "C")).toBe(
      true,
    );
    expect(serializePathCommands(state.series[0].linePath)).toContain("C");
  });

  it("tracks skipped data without breaking the render state", () => {
    const state = createAreaChartState({
      data: [{ speed: 100 }, { speed: undefined }, { speed: 50 }],
      width: 100,
      height: 40,
      y: "speed",
      curve: "linear",
    });

    expect(state.dataLength).toBe(3);
    expect(state.skippedLength).toBe(1);
    expect(state.series[0].samples).toHaveLength(2);
    expect(state.primitives).toHaveLength(2);
  });

  it("keeps chart capability free of rendering-host dependencies", () => {
    expect(chartCapability.chartTypes).toEqual(["area"]);
    expect(chartCapability.hostDependencies).toEqual([]);
  });

  it("supports the generic chart-state entry", () => {
    const state = createChartState({
      type: "area",
      data: [{ speed: 1 }],
      width: 10,
      height: 10,
      y: "speed",
    });

    expect(state.type).toBe("area");
    expect(state.series[0].samples).toHaveLength(1);
  });
});
