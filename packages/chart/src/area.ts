import { createAreaPath, createLinePath } from "./path";
import { resolveAreaStyle } from "./paint";
import { createLinearScale, resolveDomain } from "./scale";
import type {
  AreaChartOptions,
  AreaChartSeriesState,
  AreaChartState,
  ChartAccessor,
  ChartInsets,
  ChartLayer,
  ChartPadding,
  ChartPathPrimitive,
  ChartPoint,
  ChartPrimitive,
  ChartSample,
} from "./types";

export function createAreaChartState<TData>(
  options: AreaChartOptions<TData>,
): AreaChartState<TData> {
  const id = options.id ?? "area-chart";
  const padding = normalizePadding(options.padding);
  const width = resolveSize(options.width, "width");
  const height = resolveSize(options.height, "height");
  const plotArea = {
    x: padding.left,
    y: padding.top,
    width: Math.max(0, width - padding.left - padding.right),
    height: Math.max(0, height - padding.top - padding.bottom),
  };

  const samples = readSamples(options.data, options.x, options.y);
  const xDomain = resolveDomain(
    samples.map((sample) => sample.xValue),
    options.xDomain,
    [0, Math.max(1, options.data.length - 1)],
  );
  const yDomain = resolveDomain(
    samples.map((sample) => sample.yValue),
    options.yDomain,
  );
  const xScale = createLinearScale(xDomain, [plotArea.x, plotArea.x + plotArea.width]);
  const yScale = createLinearScale(yDomain, [plotArea.y + plotArea.height, plotArea.y]);
  const points = samples.map((sample) => ({
    ...sample,
    x: xScale.map(sample.xValue),
    y: yScale.map(sample.yValue),
  }));
  const baselineY = yScale.map(resolveBaselineValue(options.baseline, yDomain));
  const curve = options.curve ?? "monotone";
  const linePath = createLinePath(points, curve);
  const areaPath = createAreaPath(points, baselineY, curve);
  const style = resolveAreaStyle(id, options.style);
  const primitives = createAreaPrimitives(id, areaPath, linePath, plotArea, style);
  const series: AreaChartSeriesState<TData> = {
    id: `${id}-series-0`,
    type: "area",
    curve,
    samples: points,
    baselineY,
    linePath,
    areaPath,
    primitiveIds: primitives.map((primitive) => primitive.id),
  };
  const layers: ChartLayer[] = [
    {
      id: `${id}-series-layer`,
      type: "series",
      primitiveIds: series.primitiveIds,
    },
  ];

  return {
    version: 1,
    type: "area",
    id,
    width,
    height,
    plotArea,
    padding,
    xScale: xScale.state,
    yScale: yScale.state,
    dataLength: options.data.length,
    skippedLength: options.data.length - samples.length,
    series: [series],
    layers,
    primitives,
  };
}

function createAreaPrimitives(
  id: string,
  areaPath: ChartPathPrimitive["commands"],
  linePath: ChartPathPrimitive["commands"],
  clip: ChartPathPrimitive["clip"],
  style: ReturnType<typeof resolveAreaStyle>,
): ChartPrimitive[] {
  const primitives: ChartPrimitive[] = [];

  if (areaPath.length && style.fill.paint.type !== "none" && style.fill.opacity > 0) {
    primitives.push({
      type: "path",
      id: `${id}-area`,
      role: "area-fill",
      commands: areaPath,
      fill: style.fill,
      clip,
    });
  }

  if (
    linePath.length &&
    style.stroke.paint.type !== "none" &&
    style.stroke.width > 0 &&
    style.stroke.opacity > 0
  ) {
    primitives.push({
      type: "path",
      id: `${id}-line`,
      role: "area-stroke",
      commands: linePath,
      stroke: style.stroke,
      clip,
    });
  }

  return primitives;
}

function readSamples<TData>(
  data: readonly TData[],
  xAccessor: ChartAccessor<TData> | undefined,
  yAccessor: ChartAccessor<TData>,
): ChartSample<TData>[] {
  const samples: ChartSample<TData>[] = [];

  data.forEach((datum, index) => {
    const xValue = xAccessor ? toNumber(readValue(datum, index, xAccessor)) : index;
    const yValue = toNumber(readValue(datum, index, yAccessor));

    if (!Number.isFinite(xValue) || !Number.isFinite(yValue)) {
      return;
    }

    samples.push({
      index,
      datum,
      xValue,
      yValue,
      x: 0,
      y: 0,
    });
  });

  return samples;
}

function readValue<TData>(datum: TData, index: number, accessor: ChartAccessor<TData>) {
  if (typeof accessor === "function") {
    return accessor(datum, index);
  }
  return datum[accessor];
}

function toNumber(value: unknown) {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return Number.NaN;
}

function resolveBaselineValue(
  baseline: AreaChartOptions["baseline"],
  domain: readonly [number, number],
) {
  if (baseline === "domainMin") {
    return domain[0];
  }
  if (baseline === "domainMax") {
    return domain[1];
  }
  if (typeof baseline === "number" && Number.isFinite(baseline)) {
    return clamp(baseline, domain[0], domain[1]);
  }
  return clamp(0, domain[0], domain[1]);
}

function normalizePadding(padding: ChartPadding | undefined): ChartInsets {
  if (typeof padding === "number") {
    const value = Math.max(0, padding);
    return {
      top: value,
      right: value,
      bottom: value,
      left: value,
    };
  }

  return {
    top: Math.max(0, padding?.top ?? 0),
    right: Math.max(0, padding?.right ?? 0),
    bottom: Math.max(0, padding?.bottom ?? 0),
    left: Math.max(0, padding?.left ?? 0),
  };
}

function resolveSize(value: number, name: "width" | "height") {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Chart ${name} must be a finite number greater than or equal to 0.`);
  }
  return value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
