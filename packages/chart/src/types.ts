export type ChartKind = "area";

export type ChartCurve = "linear" | "monotone";

export type ChartPathCommand =
  | {
      type: "M";
      x: number;
      y: number;
    }
  | {
      type: "L";
      x: number;
      y: number;
    }
  | {
      type: "C";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x: number;
      y: number;
    }
  | {
      type: "Z";
    };

export interface ChartPoint {
  x: number;
  y: number;
}

export interface ChartSample<TData = unknown> extends ChartPoint {
  index: number;
  datum: TData;
  xValue: number;
  yValue: number;
}

export interface ChartSize {
  width: number;
  height: number;
}

export interface ChartRect extends ChartPoint, ChartSize {}

export interface ChartInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ChartPadding = number | Partial<ChartInsets>;

export type ChartAccessor<TData> =
  | keyof TData
  | ((datum: TData, index: number) => unknown);

export type ChartDomainToken = "auto" | "dataMin" | "dataMax";

export type ChartDomainValue = number | ChartDomainToken;

export type ChartDomain = readonly [ChartDomainValue, ChartDomainValue];

export interface ChartScaleState {
  type: "linear";
  domain: readonly [number, number];
  range: readonly [number, number];
}

export type ChartPaint =
  | {
      type: "none";
    }
  | {
      type: "color";
      color: string;
      opacity?: number;
    }
  | {
      type: "linear-gradient";
      id: string;
      from: ChartPoint;
      to: ChartPoint;
      coordinateSpace: "chart" | "plot" | "relative";
      stops: ChartGradientStop[];
    };

export interface ChartGradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

export type ChartPaintInput = string | ChartPaint | null | undefined;

export interface ChartStrokeStyle {
  paint: ChartPaint;
  width: number;
  opacity: number;
  lineCap: "butt" | "round" | "square";
  lineJoin: "miter" | "round" | "bevel";
}

export interface ChartFillStyle {
  paint: ChartPaint;
  opacity: number;
}

export interface AreaChartStyle {
  stroke?: ChartPaintInput;
  strokeWidth?: number;
  strokeOpacity?: number;
  fill?: ChartPaintInput;
  fillOpacity?: number;
  lineCap?: ChartStrokeStyle["lineCap"];
  lineJoin?: ChartStrokeStyle["lineJoin"];
}

export interface ChartPathPrimitive {
  type: "path";
  id: string;
  role: "area-fill" | "area-stroke";
  commands: ChartPathCommand[];
  fill?: ChartFillStyle;
  stroke?: ChartStrokeStyle;
  clip?: ChartRect;
}

export type ChartPrimitive = ChartPathPrimitive;

export interface ChartLayer {
  id: string;
  type: "series";
  primitiveIds: string[];
}

export interface AreaChartSeriesState<TData = unknown> {
  id: string;
  type: "area";
  curve: ChartCurve;
  samples: ChartSample<TData>[];
  baselineY: number;
  linePath: ChartPathCommand[];
  areaPath: ChartPathCommand[];
  primitiveIds: string[];
}

export interface AreaChartState<TData = unknown> {
  version: 1;
  type: "area";
  id: string;
  width: number;
  height: number;
  plotArea: ChartRect;
  padding: ChartInsets;
  xScale: ChartScaleState;
  yScale: ChartScaleState;
  dataLength: number;
  skippedLength: number;
  series: AreaChartSeriesState<TData>[];
  layers: ChartLayer[];
  primitives: ChartPrimitive[];
}

export interface AreaChartOptions<TData = Record<string, unknown>> {
  id?: string;
  data: readonly TData[];
  width: number;
  height: number;
  padding?: ChartPadding;
  x?: ChartAccessor<TData>;
  y: ChartAccessor<TData>;
  xDomain?: ChartDomain;
  yDomain?: ChartDomain;
  baseline?: number | "domainMin" | "domainMax";
  curve?: ChartCurve;
  style?: AreaChartStyle;
}

export type ChartOptions<TData = Record<string, unknown>> =
  AreaChartOptions<TData> & {
    type: "area";
  };

export interface ChartCapability {
  version: 1;
  chartTypes: ChartKind[];
  curves: ChartCurve[];
  primitives: ChartPrimitive["type"][];
  paints: ChartPaint["type"][];
  hostDependencies: string[];
}
