import { createAreaChartState } from "./area";
import type { AreaChartState, ChartOptions } from "./types";

export function createChartState<TData>(
  options: ChartOptions<TData>,
): AreaChartState<TData> {
  switch (options.type) {
    case "area":
      return createAreaChartState(options);
    default:
      return assertNever(options as never);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported chart type: ${JSON.stringify(value)}`);
}
