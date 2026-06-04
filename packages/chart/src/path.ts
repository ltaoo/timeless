import type { ChartPathCommand, ChartPoint } from "./types";

export function createLinePath(
  points: readonly ChartPoint[],
  curve: "linear" | "monotone",
): ChartPathCommand[] {
  if (!points.length) {
    return [];
  }

  if (curve === "monotone") {
    return createMonotonePath(points);
  }

  return points.map((point, index) => {
    if (index === 0) {
      return { type: "M", x: point.x, y: point.y };
    }
    return { type: "L", x: point.x, y: point.y };
  });
}

export function createAreaPath(
  points: readonly ChartPoint[],
  baselineY: number,
  curve: "linear" | "monotone",
): ChartPathCommand[] {
  if (!points.length) {
    return [];
  }

  const line = createLinePath(points, curve);
  const first = points[0];
  const last = points[points.length - 1];

  return [
    { type: "M", x: first.x, y: baselineY },
    { type: "L", x: first.x, y: first.y },
    ...line.slice(1),
    { type: "L", x: last.x, y: baselineY },
    { type: "Z" },
  ];
}

export function serializePathCommands(commands: readonly ChartPathCommand[]): string {
  return commands
    .map((command) => {
      if (command.type === "Z") {
        return "Z";
      }
      if (command.type === "C") {
        return `C ${format(command.x1)} ${format(command.y1)} ${format(
          command.x2,
        )} ${format(command.y2)} ${format(command.x)} ${format(command.y)}`;
      }
      return `${command.type} ${format(command.x)} ${format(command.y)}`;
    })
    .join(" ");
}

function createMonotonePath(points: readonly ChartPoint[]): ChartPathCommand[] {
  if (points.length < 2) {
    return [{ type: "M", x: points[0].x, y: points[0].y }];
  }

  const tangents = createMonotoneTangents(points);
  const commands: ChartPathCommand[] = [{ type: "M", x: points[0].x, y: points[0].y }];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const dx = next.x - current.x;

    if (dx === 0) {
      commands.push({ type: "L", x: next.x, y: next.y });
      continue;
    }

    commands.push({
      type: "C",
      x1: current.x + dx / 3,
      y1: current.y + (tangents[index] * dx) / 3,
      x2: next.x - dx / 3,
      y2: next.y - (tangents[index + 1] * dx) / 3,
      x: next.x,
      y: next.y,
    });
  }

  return commands;
}

function createMonotoneTangents(points: readonly ChartPoint[]) {
  const segmentSlopes: number[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const dx = next.x - current.x;
    segmentSlopes.push(dx === 0 ? 0 : (next.y - current.y) / dx);
  }

  const tangents = new Array<number>(points.length);
  tangents[0] = segmentSlopes[0] ?? 0;
  tangents[points.length - 1] = segmentSlopes[segmentSlopes.length - 1] ?? 0;

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = segmentSlopes[index - 1];
    const next = segmentSlopes[index];

    if (previous * next <= 0) {
      tangents[index] = 0;
      continue;
    }

    const weighted = (previous + next) / 2;
    const limit = 3 * Math.min(Math.abs(previous), Math.abs(next));
    tangents[index] = Math.sign(weighted) * Math.min(Math.abs(weighted), limit);
  }

  return tangents;
}

function format(value: number) {
  if (Object.is(value, -0)) {
    return "0";
  }
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(3)).toString();
}
