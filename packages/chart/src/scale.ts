import type { ChartDomain, ChartScaleState } from "./types";

export interface LinearScale {
  state: ChartScaleState;
  map(value: number): number;
  invert(value: number): number;
}

export function createLinearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): LinearScale {
  const [domainStart, domainEnd] = domain;
  const [rangeStart, rangeEnd] = range;
  const domainSpan = domainEnd - domainStart;
  const rangeSpan = rangeEnd - rangeStart;

  return {
    state: {
      type: "linear",
      domain: [domainStart, domainEnd],
      range: [rangeStart, rangeEnd],
    },
    map(value) {
      if (domainSpan === 0) {
        return rangeStart + rangeSpan / 2;
      }
      return rangeStart + ((value - domainStart) / domainSpan) * rangeSpan;
    },
    invert(value) {
      if (rangeSpan === 0) {
        return domainStart + domainSpan / 2;
      }
      return domainStart + ((value - rangeStart) / rangeSpan) * domainSpan;
    },
  };
}

export function resolveDomain(
  values: readonly number[],
  domain?: ChartDomain,
  fallback: readonly [number, number] = [0, 1],
): [number, number] {
  const finiteValues = values.filter(Number.isFinite);
  const dataMin = finiteValues.length ? Math.min(...finiteValues) : fallback[0];
  const dataMax = finiteValues.length ? Math.max(...finiteValues) : fallback[1];
  const defaultMin = Math.min(0, dataMin);
  const defaultMax = Math.max(0, dataMax);

  const min = resolveDomainValue(domain?.[0], "min", dataMin, dataMax, defaultMin);
  const max = resolveDomainValue(domain?.[1], "max", dataMin, dataMax, defaultMax);

  return expandCollapsedDomain([min, max]);
}

function resolveDomainValue(
  value: ChartDomain[number] | undefined,
  side: "min" | "max",
  dataMin: number,
  dataMax: number,
  fallback: number,
): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (value === "dataMin") {
    return dataMin;
  }
  if (value === "dataMax") {
    return dataMax;
  }
  if (value === "auto") {
    return side === "min" ? dataMin : dataMax;
  }
  return fallback;
}

function expandCollapsedDomain(domain: readonly [number, number]): [number, number] {
  let [min, max] = domain;

  if (min > max) {
    [min, max] = [max, min];
  }

  if (min !== max) {
    return [min, max];
  }

  if (min === 0) {
    return [0, 1];
  }

  const delta = Math.abs(min) * 0.5;
  return [min - delta, max + delta];
}
