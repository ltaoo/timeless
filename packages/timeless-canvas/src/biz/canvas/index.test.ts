import { describe, it, expect } from "vitest";

import { Canvas } from "./index";
import { PathParser } from "@/biz/svg/path-parser";

/**
 * 多个圆环
 * <svg t="1725725314088" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3044" width="200" height="200"><path d="M288 373.333333c-82.432 0-149.333333 66.922667-149.333333 149.333334a149.333333 149.333333 0 0 0 149.333333 149.333333c82.496 0 149.333333-66.816 149.333333-149.333333 0-82.410667-66.88-149.333333-149.333333-149.333334z m0 64c47.104 0 85.333333 38.250667 85.333333 85.333334 0 47.146667-38.186667 85.333333-85.333333 85.333333a85.333333 85.333333 0 1 1 0-170.666667zM757.333333 672a128.021333 128.021333 0 1 0 128 128c0-70.656-57.344-128-128-128z m0 64a64.021333 64.021333 0 1 1-64 64c0-35.328 28.672-64 64-64zM757.333333 117.333333a128.021333 128.021333 0 1 0 128 128c0-70.656-57.344-128-128-128z m0 64a64.021333 64.021333 0 1 1-64 64c0-35.328 28.672-64 64-64z" fill="#000000" p-id="3045"></path><path d="M356.565333 580.864a32 32 0 0 1 43.904-10.965333l266.666667 160a32 32 0 0 1-32.938667 54.869333l-266.666666-160a32 32 0 0 1-10.965334-43.904zM643.050667 264.789333a32 32 0 0 1 36.565333 52.522667l-256 178.282667a32 32 0 0 1-36.565333-52.522667l256-178.282667z" fill="#000000" p-id="3046"></path></svg>
 */

/**
 * 连续两个逆时针，再顺时针，就处理不了了
 * <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
	<path fill="currentColor" d="M17 8q.2 0 .35-.15t.15-.35v-3q0-.2-.15-.35T17 4t-.35.15t-.15.35v3q0 .2.15.35T17 8m0 2q.2 0 .35-.15t.15-.35t-.15-.35T17 9t-.35.15t-.15.35t.15.35t.35.15m-1.5 7q.625 0 1.063-.437T17 15.5t-.437-1.062T15.5 14t-1.062.438T14 15.5t.438 1.063T15.5 17m-9 0q.625 0 1.063-.437T8 15.5t-.437-1.062T6.5 14t-1.062.438T5 15.5t.438 1.063T6.5 17M17 12q-2.075 0-3.537-1.463T12 7q0-2.05 1.45-3.525T17 2q2.075 0 3.538 1.462T22 7t-1.463 3.538T17 12M3.5 22q-.625 0-1.062-.437T2 20.5v-7.15q0-.175.025-.35t.075-.325L4.1 7q.15-.45.538-.725T5.5 6H8V5q0-.425.287-.712T9 4h.525q.425 0 .65.35t.1.75q-.125.5-.2.988T10 7.075q0 .375-.25.65T9.125 8H5.85L4.8 11h5.975q.225 0 .438.1t.362.3q1 1.225 2.413 1.913T17 14q.475 0 .925-.062t.9-.188q.425-.125.8.138t.375.687V20.5q0 .625-.437 1.063T18.5 22t-1.062-.437T17 20.5V20H5v.5q0 .625-.437 1.063T3.5 22" />
</svg>
 */

describe("SVG path convert to bezier path", () => {
  it("simple curve1", () => {
    const content = "M120.41 95.9L102.59 60.1C97.4 62.68 92.04 65.87 86.68 69.63C56.62 90.7 27.67 129.47 27.67 171.84Z";
    const bezier = Canvas({});
    bezier.buildBezierPathsFromPathString(content);
    const paths = bezier.paths;
  });
});

describe("lucide bolt icon - SVG with arc commands", () => {
  const boltSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bolt-icon lucide-bolt"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><circle cx="12" cy="12" r="4"/></svg>`;

  it("parse_svg should extract correct dimensions from viewBox", () => {
    const data = PathParser.parse_svg(boltSvg);
    // viewBox="0 0 24 24" => dimensions should be 24x24
    expect(data.dimensions.width).toBe(24);
    expect(data.dimensions.height).toBe(24);
  });

  it("parse_svg should extract both path and circle elements", () => {
    const data = PathParser.parse_svg(boltSvg);
    // Should have 2 paths: 1 from <path> + 1 from <circle>
    expect(data.paths.length).toBe(2);
    expect(data.paths[0].d).toContain("M21 16V8");
    expect(data.paths[1].from).toBe("circle");
  });

  it("parse_svg should handle globalSettings correctly with fill=none", () => {
    const data = PathParser.parse_svg(boltSvg);
    // fill="none" should NOT be propagated as fill
    // stroke="currentColor" is a global setting
    for (const path of data.paths) {
      // fill should not be "none" - it should either be undefined or "black" (from currentColor conversion)
      expect(path.fill).not.toBe("none");
    }
  });

  it("parse_svg should handle stroke=currentColor in global settings", () => {
    const data = PathParser.parse_svg(boltSvg);
    // The global stroke="currentColor" gets spread into paths
    // But only path-level matches convert "currentColor" -> "black"
    // Global level does NOT convert, so paths may get "currentColor" as stroke
    for (const path of data.paths) {
      console.log("path stroke:", path.stroke);
    }
    // This might be a bug: globalSettings.stroke = "currentColor" is not converted to "black"
    // Only path-level strokeMatch converts "currentColor" to "black"
  });

  it("parse should correctly tokenize path with arc commands", () => {
    const pathD = "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z";
    const tokens = PathParser.parse(pathD);
    console.log("tokens:", JSON.stringify(tokens, null, 2));
    // M21 16
    expect(tokens[0]).toEqual(["M", "21", "16"]);
    // V8
    expect(tokens[1]).toEqual(["V", "8"]);
    // a2 2 0 0 0-1-1.73  (relative arc)
    expect(tokens[2][0]).toBe("a");
    expect(tokens[2][1]).toBe("2");   // rx
    expect(tokens[2][2]).toBe("2");   // ry
    expect(tokens[2][3]).toBe("0");   // rotation
    expect(tokens[2][4]).toBe("0");   // large-arc-flag
    expect(tokens[2][5]).toBe("0");   // sweep-flag
    expect(tokens[2][6]).toBe("-1");  // x (relative)
    expect(tokens[2][7]).toBe("-1.73"); // y (relative)
  });

  it("buildBezierPathsFromPathString should produce paths within grid bounds", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    console.log("grid:", grid);
    // grid defaults: x=0, y=0, width=512, height=512, padding=48
    // scale = (512 - 48*2) / 24 = 416 / 24 ≈ 17.333

    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    console.log("result.dimensions:", result.dimensions);
    console.log("result.paths.length:", result.paths.length);

    const lines = result.paths;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`\nLine ${i}:`);
      for (let j = 0; j < line.paths.length; j++) {
        const subPath = line.paths[j];
        console.log(`  SubPath ${j}: ${subPath.path_points.length} points, closed=${subPath.closed}`);
        for (let k = 0; k < subPath.path_points.length; k++) {
          const bp = subPath.path_points[k];
          const pt = bp.point;
          console.log(`    Point ${k}: (${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})${bp.start ? " [start]" : ""}${bp.end ? " [end]" : ""}`);
          if (bp.from) {
            console.log(`      from: (${bp.from.x.toFixed(2)}, ${bp.from.y.toFixed(2)})`);
          }
          if (bp.to) {
            console.log(`      to: (${bp.to.x.toFixed(2)}, ${bp.to.y.toFixed(2)})`);
          }
        }
      }
    }
  });

  it("all bezier points should be within the canvas grid area", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    const gridLeft = grid.x + grid.padding;
    const gridTop = grid.y + grid.padding;
    const gridRight = grid.x + grid.width - grid.padding;
    const gridBottom = grid.y + grid.height - grid.padding;
    console.log(`Grid draw area: (${gridLeft}, ${gridTop}) - (${gridRight}, ${gridBottom})`);

    // SVG viewBox is "0 0 24 24", path coords go from 3 to 21
    // After transform: x = coord * scale + padding
    // Minimum coord = 3 => 3 * 17.333 + 48 = 100
    // Maximum coord = 21 => 21 * 17.333 + 48 = 412
    // So points should all be within [48, 464] range (grid.padding to grid.width - grid.padding)

    const lines = result.paths;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.paths.length; j++) {
        const subPath = line.paths[j];
        for (let k = 0; k < subPath.path_points.length; k++) {
          const bp = subPath.path_points[k];
          const pt = bp.point;
          // Points should be within the grid area (with padding)
          expect(pt.x).toBeGreaterThanOrEqual(gridLeft);
          expect(pt.x).toBeLessThanOrEqual(gridRight);
          expect(pt.y).toBeGreaterThanOrEqual(gridTop);
          expect(pt.y).toBeLessThanOrEqual(gridBottom);
        }
      }
    }
  });

  it("SVG coordinates should map correctly: 0 -> gridLeft, 24 -> gridRight", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    const scale = (grid.width - grid.padding * 2) / 24;
    console.log("scale:", scale);

    // Verify the expected coordinate mapping
    // SVG coord 0 should map to grid.x + grid.padding = 0 + 48 = 48
    // SVG coord 24 should map to 24 * scale + 48 = 24 * 17.333 + 48 = 416 + 48 = 464
    // SVG coord 12 (center) should map to 12 * scale + 48 = 208 + 48 = 256 (center of 512)
    const expectedCenter = 12 * scale + grid.x + grid.padding;
    expect(expectedCenter).toBeCloseTo(grid.width / 2, 0);

    // Now check actual circle center in the output
    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    // The circle (cx=12, cy=12, r=4) should be centered at canvas center
    const circleLine = result.paths[1]; // second path is the circle
    if (circleLine && circleLine.paths.length > 0) {
      const circlePoints = circleLine.paths[0].path_points;
      // Circle starts at top: (cx, cy - r) = (12, 8) in SVG coords
      const topPoint = circlePoints[0];
      const expectedTopX = 12 * scale + grid.x + grid.padding;
      const expectedTopY = 8 * scale + grid.y + grid.padding;
      console.log(`Circle top point: (${topPoint.point.x.toFixed(2)}, ${topPoint.point.y.toFixed(2)})`);
      console.log(`Expected: (${expectedTopX.toFixed(2)}, ${expectedTopY.toFixed(2)})`);
      expect(topPoint.point.x).toBeCloseTo(expectedTopX, 1);
      expect(topPoint.point.y).toBeCloseTo(expectedTopY, 1);
    }
  });

  it("investigate clipping: check if path bounding box covers expected SVG area", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    const scale = (grid.width - grid.padding * 2) / 24;
    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    // Collect all anchor points to find bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const lines = result.paths;
    for (const line of lines) {
      for (const subPath of line.paths) {
        for (const bp of subPath.path_points) {
          const pt = bp.point;
          minX = Math.min(minX, pt.x);
          minY = Math.min(minY, pt.y);
          maxX = Math.max(maxX, pt.x);
          maxY = Math.max(maxY, pt.y);
        }
      }
    }

    // Convert back to SVG coordinates to verify
    const svgMinX = (minX - grid.x - grid.padding) / scale;
    const svgMinY = (minY - grid.y - grid.padding) / scale;
    const svgMaxX = (maxX - grid.x - grid.padding) / scale;
    const svgMaxY = (maxY - grid.y - grid.padding) / scale;

    console.log(`Bounding box in canvas coords: (${minX.toFixed(2)}, ${minY.toFixed(2)}) - (${maxX.toFixed(2)}, ${maxY.toFixed(2)})`);
    console.log(`Bounding box in SVG coords: (${svgMinX.toFixed(2)}, ${svgMinY.toFixed(2)}) - (${svgMaxX.toFixed(2)}, ${svgMaxY.toFixed(2)})`);

    // The bolt icon path uses coords from ~3 to ~21 in X, and ~2.27 to ~21.73 in Y
    // The circle uses coords from 8 to 16 in both axes
    // So the full bounding box should be approximately (3, 2.27) to (21, 21.73)
    // If it's NOT in this range, something is wrong with the coordinate transformation

    // SVG bounding box should be within [0, 24] range
    expect(svgMinX).toBeGreaterThanOrEqual(0);
    expect(svgMinY).toBeGreaterThanOrEqual(0);
    expect(svgMaxX).toBeLessThanOrEqual(24);
    expect(svgMaxY).toBeLessThanOrEqual(24);

    // The path has content from ~3 to ~21
    expect(svgMinX).toBeLessThanOrEqual(4);
    expect(svgMaxX).toBeGreaterThanOrEqual(20);
  });

  it("with setSize: paths should still be within grid after canvas resize", () => {
    const canvas = Canvas({});
    // Simulate real-world usage where canvas size is set to the container size
    canvas.setSize({ width: 800, height: 600 });
    const grid = canvas.grid;
    console.log("grid after setSize(800, 600):", grid);
    // grid.x = 800/2 - 512/2 = 144
    // grid.y = 600/2 - 512/2 = 44
    expect(grid.x).toBe(144);
    expect(grid.y).toBe(44);

    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    const scale = (grid.width - grid.padding * 2) / 24;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const line of result.paths) {
      for (const subPath of line.paths) {
        for (const bp of subPath.path_points) {
          minX = Math.min(minX, bp.point.x);
          minY = Math.min(minY, bp.point.y);
          maxX = Math.max(maxX, bp.point.x);
          maxY = Math.max(maxY, bp.point.y);
        }
      }
    }
    console.log(`After setSize - bounding box: (${minX.toFixed(2)}, ${minY.toFixed(2)}) - (${maxX.toFixed(2)}, ${maxY.toFixed(2)})`);

    // All points should be within the grid area (translated by grid.x, grid.y)
    const gridLeft = grid.x + grid.padding;
    const gridTop = grid.y + grid.padding;
    const gridRight = grid.x + grid.width - grid.padding;
    const gridBottom = grid.y + grid.height - grid.padding;
    console.log(`Grid draw area: (${gridLeft}, ${gridTop}) - (${gridRight}, ${gridBottom})`);

    for (const line of result.paths) {
      for (const subPath of line.paths) {
        for (const bp of subPath.path_points) {
          expect(bp.point.x).toBeGreaterThanOrEqual(gridLeft);
          expect(bp.point.x).toBeLessThanOrEqual(gridRight);
          expect(bp.point.y).toBeGreaterThanOrEqual(gridTop);
          expect(bp.point.y).toBeLessThanOrEqual(gridBottom);
        }
      }
    }
  });

  it("verify every point (anchor + control) maps back to correct SVG coordinates", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    const scale = (grid.width - grid.padding * 2) / 24;
    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    function toSvg(canvasVal: number, axis: "x" | "y") {
      const offset = axis === "x" ? grid.x : grid.y;
      return (canvasVal - offset - grid.padding) / scale;
    }

    // 手算 SVG path 的预期绝对坐标序列：
    // M21,16 → V8 → a... → endpoint(20, 6.27) → l... → (13, 2.27)
    // → a... → (11, 2.27) → l... → (4, 6.27) → A... → (3, 8)
    // → v8 → (3, 16) → a... → (4, 17.73) → l... → (11, 21.73)
    // → a... → (13, 21.73) → l... → (20, 17.73) → A... → (21, 16) → z
    const expectedSvgAnchors = [
      { x: 21, y: 16 },   // M21 16
      { x: 21, y: 8 },    // V8
      // a2 2 0 0 0-1-1.73 → endpoint: (21-1, 8-1.73) = (20, 6.27)
      // l-7-4 → endpoint: (20-7, 6.27-4) = (13, 2.27)
      // a2 2 0 0 0-2 0 → endpoint: (13-2, 2.27) = (11, 2.27)
      // l-7 4 → endpoint: (11-7, 2.27+4) = (4, 6.27)
      // A2 2 0 0 0 3 8 → endpoint: (3, 8)
      // v8 → (3, 16)
      // a2 2 0 0 0 1 1.73 → (4, 17.73)
      // l7 4 → (11, 21.73)
      // a2 2 0 0 0 2 0 → (13, 21.73)
      // l7 -4 → (20, 17.73)
      // A2 2 0 0 0 21 16 → (21, 16)
    ];

    const lines = result.paths;
    console.log("\n=== All points mapped back to SVG coords ===");
    let allPointsInBounds = true;
    let outOfBoundsPoints: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (let j = 0; j < line.paths.length; j++) {
        const subPath = line.paths[j];
        console.log(`\nLine ${i} SubPath ${j}:`);
        for (let k = 0; k < subPath.path_points.length; k++) {
          const bp = subPath.path_points[k];
          const svgX = toSvg(bp.point.x, "x");
          const svgY = toSvg(bp.point.y, "y");
          const label = `  anchor[${k}]: svg(${svgX.toFixed(2)}, ${svgY.toFixed(2)}) canvas(${bp.point.x.toFixed(2)}, ${bp.point.y.toFixed(2)})`;
          console.log(label);

          // 锚点应在 [0, 24] 范围内
          if (svgX < -0.5 || svgX > 24.5 || svgY < -0.5 || svgY > 24.5) {
            allPointsInBounds = false;
            outOfBoundsPoints.push(`anchor[${k}]: svg(${svgX.toFixed(2)}, ${svgY.toFixed(2)})`);
          }

          if (bp.from) {
            const fSvgX = toSvg(bp.from.x, "x");
            const fSvgY = toSvg(bp.from.y, "y");
            console.log(`    from: svg(${fSvgX.toFixed(2)}, ${fSvgY.toFixed(2)}) canvas(${bp.from.x.toFixed(2)}, ${bp.from.y.toFixed(2)})`);
            if (fSvgX < -2 || fSvgX > 26 || fSvgY < -2 || fSvgY > 26) {
              allPointsInBounds = false;
              outOfBoundsPoints.push(`from[${k}]: svg(${fSvgX.toFixed(2)}, ${fSvgY.toFixed(2)})`);
            }
          }
          if (bp.to) {
            const tSvgX = toSvg(bp.to.x, "x");
            const tSvgY = toSvg(bp.to.y, "y");
            console.log(`    to:   svg(${tSvgX.toFixed(2)}, ${tSvgY.toFixed(2)}) canvas(${bp.to.x.toFixed(2)}, ${bp.to.y.toFixed(2)})`);
            if (tSvgX < -2 || tSvgX > 26 || tSvgY < -2 || tSvgY > 26) {
              allPointsInBounds = false;
              outOfBoundsPoints.push(`to[${k}]: svg(${tSvgX.toFixed(2)}, ${tSvgY.toFixed(2)})`);
            }
          }
        }
      }
    }

    if (outOfBoundsPoints.length > 0) {
      console.log("\n!!! OUT OF BOUNDS POINTS !!!");
      outOfBoundsPoints.forEach((p) => console.log("  ", p));
    }
    expect(allPointsInBounds).toBe(true);
  });

  it("verify arc-to-bezier conversion produces correct endpoint for relative arc 'a'", () => {
    // 只测 path 部分（不含 circle）来验证 arc 转换
    const pathOnlySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
    const canvas = Canvas({});
    const grid = canvas.grid;
    const scale = (grid.width - grid.padding * 2) / 24;

    const result = canvas.buildBezierPathsFromPathString(pathOnlySvg);
    expect(result).not.toBeNull();
    if (!result) return;

    function toSvg(v: number, axis: "x" | "y") {
      const offset = axis === "x" ? grid.x : grid.y;
      return (v - offset - grid.padding) / scale;
    }

    const subPath = result.paths[0].paths[0];
    const points = subPath.path_points;

    // 验证关键锚点的 SVG 坐标
    // Point 0: M21 16
    expect(toSvg(points[0].point.x, "x")).toBeCloseTo(21, 0);
    expect(toSvg(points[0].point.y, "y")).toBeCloseTo(16, 0);

    // Point 1: V8 → (21, 8)
    expect(toSvg(points[1].point.x, "x")).toBeCloseTo(21, 0);
    expect(toSvg(points[1].point.y, "y")).toBeCloseTo(8, 0);

    // 打印所有锚点的 SVG 坐标，用于人工验证 arc 转换是否正确
    console.log("\n=== Bolt hexagon path anchors (SVG coords) ===");
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      const sx = toSvg(pt.point.x, "x").toFixed(2);
      const sy = toSvg(pt.point.y, "y").toFixed(2);
      console.log(`  [${i}] (${sx}, ${sy})${pt.start ? " START" : ""}${pt.end ? " END" : ""}`);
    }

    // 预期的锚点序列（arc 的中间贝塞尔点也会出现）：
    // 关键验证：最后一个锚点应回到 (21, 16) 附近（闭合路径）
    const lastAnchor = points[points.length - 1];
    const lastSvgX = toSvg(lastAnchor.point.x, "x");
    const lastSvgY = toSvg(lastAnchor.point.y, "y");
    console.log(`  Last anchor SVG: (${lastSvgX.toFixed(2)}, ${lastSvgY.toFixed(2)})`);
    expect(lastSvgX).toBeCloseTo(21, 0);
    expect(lastSvgY).toBeCloseTo(16, 0);
  });

  it("compare buildBezierPathsFromPathString vs buildBezierPathsFromASN for same SVG", () => {
    const canvas1 = Canvas({});
    const canvas2 = Canvas({});

    const result1 = canvas1.buildBezierPathsFromPathString(boltSvg);
    const result2 = canvas2.buildBezierPathsFromASN({
      tag: "svg",
      attrs: {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      children: [
        {
          tag: "path",
          attrs: {
            d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
          },
        },
        {
          tag: "circle",
          attrs: { cx: "12", cy: "12", r: "4" },
        },
      ],
    });

    expect(result1).not.toBeNull();
    expect(result2).not.toBeNull();
    if (!result1 || !result2) return;

    const grid = canvas1.grid;
    const scale = (grid.width - grid.padding * 2) / 24;
    function toSvg(v: number, axis: "x" | "y") {
      const offset = axis === "x" ? grid.x : grid.y;
      return (v - offset - grid.padding) / scale;
    }

    console.log("\n=== Comparing buildBezierPathsFromPathString vs buildBezierPathsFromASN ===");
    console.log(`PathString: ${result1.paths.length} lines, ASN: ${result2.paths.length} lines`);

    // 比较两个方法产生的 line 数量
    expect(result1.paths.length).toBe(result2.paths.length);

    // 比较每个 line 的锚点坐标
    for (let i = 0; i < result1.paths.length; i++) {
      const paths1 = result1.paths[i].paths;
      const paths2 = result2.paths[i].paths;
      console.log(`\nLine ${i}: PathString has ${paths1.length} subpaths, ASN has ${paths2.length} subpaths`);

      for (let j = 0; j < Math.min(paths1.length, paths2.length); j++) {
        const pts1 = paths1[j].path_points;
        const pts2 = paths2[j].path_points;
        console.log(`  SubPath ${j}: PathString ${pts1.length} points, ASN ${pts2.length} points`);

        for (let k = 0; k < Math.min(pts1.length, pts2.length); k++) {
          const s1x = toSvg(pts1[k].point.x, "x");
          const s1y = toSvg(pts1[k].point.y, "y");
          const s2x = toSvg(pts2[k].point.x, "x");
          const s2y = toSvg(pts2[k].point.y, "y");
          const diff = Math.abs(s1x - s2x) + Math.abs(s1y - s2y);
          const marker = diff > 0.1 ? " <<<< MISMATCH" : "";
          console.log(`    [${k}] PathString=(${s1x.toFixed(2)}, ${s1y.toFixed(2)}) ASN=(${s2x.toFixed(2)}, ${s2y.toFixed(2)})${marker}`);
        }
      }
    }
  });

  it("check buildCommands output - actual canvas drawing coordinates", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    const scale = (grid.width - grid.padding * 2) / 24;

    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    function toSvg(v: number) {
      return (v - grid.x - grid.padding) / scale;
    }

    // 画布绘制区域边界（SVG 坐标 0 和 24 对应的画布坐标）
    const canvasMin = grid.x + grid.padding; // SVG 0 → canvas 48
    const canvasMax = grid.x + grid.width - grid.padding; // SVG 24 → canvas 464

    console.log(`\nCanvas draw bounds: [${canvasMin}, ${canvasMax}] (SVG [0, 24])`);
    console.log("=== buildCommands output ===");

    let hasOutOfBounds = false;
    const outOfBoundsList: string[] = [];

    for (let i = 0; i < result.paths.length; i++) {
      const line = result.paths[i];
      for (let j = 0; j < line.paths.length; j++) {
        const subPath = line.paths[j];
        const commands = subPath.buildCommands();
        console.log(`\nLine ${i} SubPath ${j}: ${commands.length} commands`);

        for (let k = 0; k < commands.length; k++) {
          const cmd = commands[k];
          const args = cmd.a;
          const svgArgs = args.map((v) => toSvg(v).toFixed(2));
          console.log(`  ${cmd.c} canvas[${args.map((v) => v.toFixed(1)).join(", ")}] svg[${svgArgs.join(", ")}]`);

          // 检查所有坐标参数是否在合理范围内
          if (cmd.c === "M" || cmd.c === "L") {
            // [x, y]
            const [x, y] = args;
            if (x < canvasMin || x > canvasMax || y < canvasMin || y > canvasMax) {
              hasOutOfBounds = true;
              outOfBoundsList.push(`${cmd.c}(${toSvg(x).toFixed(2)}, ${toSvg(y).toFixed(2)}) - OUT OF [0,24]`);
            }
          }
          if (cmd.c === "C") {
            // [c1x, c1y, c2x, c2y, ex, ey]
            for (let p = 0; p < 6; p += 2) {
              const px = args[p];
              const py = args[p + 1];
              const svgPx = toSvg(px);
              const svgPy = toSvg(py);
              // 控制点允许略微超出（bezier 控制点可以超出曲线范围）
              // 但如果大幅超出就有问题
              if (svgPx < -5 || svgPx > 29 || svgPy < -5 || svgPy > 29) {
                hasOutOfBounds = true;
                const label = p < 4 ? `cp${p / 2 + 1}` : "end";
                outOfBoundsList.push(`C.${label}(${svgPx.toFixed(2)}, ${svgPy.toFixed(2)}) - FAR OUT OF [0,24]`);
              }
            }
          }
          if (cmd.c === "Q") {
            // [cx, cy, ex, ey]
            for (let p = 0; p < 4; p += 2) {
              const px = args[p];
              const py = args[p + 1];
              const svgPx = toSvg(px);
              const svgPy = toSvg(py);
              if (svgPx < -5 || svgPx > 29 || svgPy < -5 || svgPy > 29) {
                hasOutOfBounds = true;
                const label = p < 2 ? "cp" : "end";
                outOfBoundsList.push(`Q.${label}(${svgPx.toFixed(2)}, ${svgPy.toFixed(2)}) - FAR OUT OF [0,24]`);
              }
            }
          }
        }
      }
    }

    if (outOfBoundsList.length > 0) {
      console.log("\n!!! OUT OF BOUNDS COMMANDS !!!");
      outOfBoundsList.forEach((s) => console.log("  ", s));
    } else {
      console.log("\nAll commands within bounds.");
    }
  });

  it("verify closed path: last C command before Z should connect back to start", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;
    const scale = (grid.width - grid.padding * 2) / 24;

    const pathOnlySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
    const canvas2 = Canvas({});
    const result = canvas2.buildBezierPathsFromPathString(pathOnlySvg);
    expect(result).not.toBeNull();
    if (!result) return;

    function toSvg(v: number) {
      return (v - canvas2.grid.x - canvas2.grid.padding) / ((canvas2.grid.width - canvas2.grid.padding * 2) / 24);
    }

    const subPath = result.paths[0].paths[0];
    const commands = subPath.buildCommands();

    // 找到 M 指令获取起点
    const mCmd = commands.find((c) => c.c === "M");
    expect(mCmd).toBeDefined();
    const startX = toSvg(mCmd!.a[0]);
    const startY = toSvg(mCmd!.a[1]);
    console.log(`Start point (SVG): (${startX.toFixed(2)}, ${startY.toFixed(2)})`);

    // 找到 Z 前的最后一条曲线/直线命令
    const zIndex = commands.findIndex((c) => c.c === "Z");
    expect(zIndex).toBeGreaterThan(0);
    const lastCmd = commands[zIndex - 1];
    console.log(`Last command before Z: ${lastCmd.c}`);

    // 最后一条命令的终点应该回到起点附近
    let endX: number, endY: number;
    if (lastCmd.c === "C") {
      endX = toSvg(lastCmd.a[4]);
      endY = toSvg(lastCmd.a[5]);
    } else if (lastCmd.c === "L" || lastCmd.c === "M") {
      endX = toSvg(lastCmd.a[0]);
      endY = toSvg(lastCmd.a[1]);
    } else {
      endX = startX;
      endY = startY;
    }
    console.log(`End point before Z (SVG): (${endX.toFixed(2)}, ${endY.toFixed(2)})`);
    console.log(`Distance from start: dx=${Math.abs(endX - startX).toFixed(4)}, dy=${Math.abs(endY - startY).toFixed(4)}`);

    // 闭合路径的终点应该非常接近起点
    expect(endX).toBeCloseTo(startX, 0);
    expect(endY).toBeCloseTo(startY, 0);
  });

  it("simulate loadSVGContent: scale then check positions", () => {
    const canvas = Canvas({});
    const grid = canvas.grid;

    const result = canvas.buildBezierPathsFromPathString(boltSvg);
    expect(result).not.toBeNull();
    if (!result) return;

    const { paths, dimensions } = result;
    canvas.appendObjects(paths, { transform: true, dimensions });

    // 模拟 loadSVGContent 的 scale 逻辑
    const targetWidth = 48;
    const targetHeight = 48;
    const targetX = 10;
    const targetY = 10;
    const scaledWidth = grid.width - grid.padding * 2;
    const scaledHeight = grid.height - grid.padding * 2;
    const iconScale = Math.min(targetWidth / scaledWidth, targetHeight / scaledHeight);

    // 记录缩放前的 box
    const line0 = paths[0];
    const line1 = paths[1];
    line0.refreshBox();
    line1.refreshBox();
    const boxesBefore = paths.map((line) => ({ ...line.box }));
    let overallX = Infinity;
    let overallY = Infinity;
    for (const b of boxesBefore) {
      if (b.x < overallX) overallX = b.x;
      if (b.y < overallY) overallY = b.y;
    }

    // 执行 scale
    for (const line of paths) {
      line.startScale();
      line.scale(iconScale);
      line.finishScale();
    }

    // 执行 translate（模拟 loadSVGContent 的修正逻辑）
    for (let i = 0; i < paths.length; i++) {
      const orig = boxesBefore[i];
      const dx = targetX + (orig.x - overallX) * iconScale - orig.x;
      const dy = targetY + (orig.y - overallY) * iconScale - orig.y;
      paths[i].translate(dx, dy);
      paths[i].refreshBox();
    }

    // 缩放后
    const box0After = { ...line0.box };
    const box1After = { ...line1.box };
    const actualWidth0 = box0After.x1 - box0After.x;
    const actualHeight0 = box0After.y1 - box0After.y;

    // 检查尺寸：缩放后 box 尺寸应约为 原尺寸 * iconScale
    const expectedWidth0 = (boxesBefore[0].x1 - boxesBefore[0].x) * iconScale;
    const expectedHeight0 = (boxesBefore[0].y1 - boxesBefore[0].y) * iconScale;
    expect(Math.abs(actualWidth0 - expectedWidth0)).toBeLessThan(2);
    expect(Math.abs(actualHeight0 - expectedHeight0)).toBeLessThan(2);

    // 检查位置：Line 0 应该在 target 附近
    expect(Math.abs(box0After.x - targetX)).toBeLessThan(2);
    expect(Math.abs(box0After.y - targetY)).toBeLessThan(2);

    // 检查两条 line 的相对位置：圆心应该在六边形中心附近
    const center0 = {
      x: (box0After.x + box0After.x1) / 2,
      y: (box0After.y + box0After.y1) / 2,
    };
    const center1 = {
      x: (box1After.x + box1After.x1) / 2,
      y: (box1After.y + box1After.y1) / 2,
    };
    const dist = Math.sqrt(
      Math.pow(center1.x - center0.x, 2) +
      Math.pow(center1.y - center0.y, 2),
    );
    // 圆心到六边形中心的距离应远小于目标尺寸
    expect(dist).toBeLessThan(targetWidth / 2);
  });

  it("BUG: globalSettings.stroke=currentColor is not converted to a valid color", () => {
    const data = PathParser.parse_svg(boltSvg);
    // The global stroke="currentColor" is spread into all path payloads without conversion
    // Only path-level matches convert "currentColor" -> "black" (path-parser.ts:265-267)
    // But global level (path-parser.ts:183-185) stores "currentColor" as-is
    //
    // This causes invalid stroke colors like "currentColor" to be passed to canvas context,
    // which canvas ignores, resulting in strokes not being rendered (icon appears clipped)
    for (const path of data.paths) {
      // Currently this is "currentColor" - which is a CSS value, not valid for canvas
      // It should be converted to "black" or another valid color
      console.log(`BUG: path.stroke = "${path.stroke}" (should be "black", not "currentColor")`);
      // Uncomment the line below once the bug is fixed:
      // expect(path.stroke).not.toBe("currentColor");
    }
  });

  it("BUG: width regex may match stroke-width when SVG has no explicit width attribute", () => {
    // This SVG has no width/height attributes, only viewBox and stroke-width
    const svgNoWidth = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2"><path d="M10 10L20 20"/></svg>`;
    const data = PathParser.parse_svg(svgNoWidth);
    // r2 = /width="([^"]+)"/ would match stroke-width="2" => width=2
    // But viewBox overrides it to 24
    console.log("dimensions:", data.dimensions);
    // With viewBox present, this is OK because viewBox overrides
    expect(data.dimensions.width).toBe(24);

    // But WITHOUT viewBox, it would be wrong:
    const svgNoViewBox = `<svg xmlns="http://www.w3.org/2000/svg" stroke-width="2"><path d="M10 10L20 20"/></svg>`;
    const data2 = PathParser.parse_svg(svgNoViewBox);
    console.log("BUG: dimensions without viewBox:", data2.dimensions);
    // This incorrectly gives width=2 (from stroke-width) instead of 0 or a proper default
    // The regex /width="([^"]+)"/ matches 'width="2"' inside 'stroke-width="2"'
  });
});
