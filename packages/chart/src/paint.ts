import type {
  AreaChartStyle,
  ChartFillStyle,
  ChartPaint,
  ChartPaintInput,
  ChartStrokeStyle,
} from "./types";

const defaultStrokeColor = "#22c55e";

export function createDefaultAreaFill(id: string, color = defaultStrokeColor): ChartPaint {
  return {
    type: "linear-gradient",
    id: `${id}-area-fill`,
    from: { x: 0, y: 0 },
    to: { x: 0, y: 1 },
    coordinateSpace: "relative",
    stops: [
      { offset: 0.05, color, opacity: 0.3 },
      { offset: 0.95, color, opacity: 0 },
    ],
  };
}

export function resolveAreaStyle(
  id: string,
  style: AreaChartStyle | undefined,
): { stroke: ChartStrokeStyle; fill: ChartFillStyle } {
  const strokePaint = resolvePaint(style?.stroke, {
    type: "color",
    color: defaultStrokeColor,
  });

  return {
    stroke: {
      paint: strokePaint,
      width: resolvePositiveNumber(style?.strokeWidth, 1.5),
      opacity: resolveOpacity(style?.strokeOpacity, 1),
      lineCap: style?.lineCap ?? "round",
      lineJoin: style?.lineJoin ?? "round",
    },
    fill: {
      paint: resolvePaint(style?.fill, createDefaultAreaFill(id, paintColor(strokePaint))),
      opacity: resolveOpacity(style?.fillOpacity, 1),
    },
  };
}

export function resolvePaint(input: ChartPaintInput, fallback: ChartPaint): ChartPaint {
  if (input === null) {
    return { type: "none" };
  }
  if (input === undefined) {
    return fallback;
  }
  if (typeof input === "string") {
    return { type: "color", color: input };
  }
  return input;
}

function resolvePositiveNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function resolveOpacity(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, value));
}

function paintColor(paint: ChartPaint) {
  return paint.type === "color" ? paint.color : defaultStrokeColor;
}
