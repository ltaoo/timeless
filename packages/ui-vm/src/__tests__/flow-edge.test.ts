import { describe, it, expect } from "vitest";

import { FlowNodeModel, FlowEdgeModel } from "@/flow";

function createNode(
  id: string,
  position: { x: number; y: number },
  width: number,
  height: number,
): FlowNodeModel {
  return new FlowNodeModel({
    id,
    position,
    width,
    height,
    data: {},
  });
}

function parsePath(d: string) {
  const parts = d.trim().split(/\s+/);
  const commands: { cmd: string; x: number; y: number }[] = [];
  let i = 0;
  while (i < parts.length) {
    const cmd = parts[i];
    if (cmd === "M" || cmd === "L") {
      commands.push({ cmd, x: parseFloat(parts[i + 1]), y: parseFloat(parts[i + 2]) });
      i += 3;
    } else if (cmd === "C") {
      // cubic bezier: C cx1 cy1, cx2 cy2, x y
      // skip control points, get endpoint
      const endpoint = parts.slice(i + 1).join(" ").split(",");
      const last = endpoint[endpoint.length - 1].trim().split(/\s+/);
      commands.push({ cmd, x: parseFloat(last[0]), y: parseFloat(last[1]) });
      // advance past all C params
      i += 7;
    } else if (cmd === "Q") {
      // quadratic bezier: Q cx cy, x y
      const raw = parts.slice(i + 1, i + 5).join(" ").split(",");
      const last = raw[raw.length - 1].trim().split(/\s+/);
      commands.push({ cmd, x: parseFloat(last[0]), y: parseFloat(last[1]) });
      i += 5;
    } else {
      i++;
    }
  }
  return commands;
}

function getStartEnd(d: string) {
  const cmds = parsePath(d);
  const start = cmds[0];
  const end = cmds[cmds.length - 1];
  return { start, end };
}

describe("FlowEdgeModel 路径计算", () => {
  /**
   * 场景: source(0,0, 200x100) ---right---> left--- target(400,0, 200x100)
   *
   * source 右边缘中点: (200, 50)
   * target 左边缘中点: (400, 50)
   */
  describe("getAnchorPoint - 锚点计算", () => {
    it("sourcePosition=right: 锚点应在 source 节点右边缘中点", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e1",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "straight",
      });

      expect(edge.sourceX).toBe(200); // x + width
      expect(edge.sourceY).toBe(50); // y + height/2
    });

    it("targetPosition=left: 锚点应在 target 节点左边缘中点", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e2",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "straight",
      });

      expect(edge.targetX).toBe(400); // target.x
      expect(edge.targetY).toBe(50); // target.y + height/2
    });

    it("sourcePosition=bottom: 锚点应在 source 节点底边中点", () => {
      const source = createNode("s", { x: 100, y: 0 }, 200, 100);
      const target = createNode("t", { x: 100, y: 300 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e3",
        source,
        target,
        sourcePosition: "bottom",
        targetPosition: "top",
        type: "straight",
      });

      expect(edge.sourceX).toBe(200); // x + width/2
      expect(edge.sourceY).toBe(100); // y + height
    });

    it("targetPosition=top: 锚点应在 target 节点顶边中点", () => {
      const source = createNode("s", { x: 100, y: 0 }, 200, 100);
      const target = createNode("t", { x: 100, y: 300 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e4",
        source,
        target,
        sourcePosition: "bottom",
        targetPosition: "top",
        type: "straight",
      });

      expect(edge.targetX).toBe(200); // target.x + width/2
      expect(edge.targetY).toBe(300); // target.y
    });

    it("sourcePosition=left: 锚点应在 source 节点左边缘中点", () => {
      const source = createNode("s", { x: 300, y: 50 }, 200, 100);
      const target = createNode("t", { x: 0, y: 50 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e5",
        source,
        target,
        sourcePosition: "left",
        targetPosition: "right",
        type: "straight",
      });

      expect(edge.sourceX).toBe(300); // source.x
      expect(edge.sourceY).toBe(100); // source.y + height/2
    });

    it("targetPosition=right: 锚点应在 target 节点右边缘中点", () => {
      const source = createNode("s", { x: 300, y: 50 }, 200, 100);
      const target = createNode("t", { x: 0, y: 50 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e6",
        source,
        target,
        sourcePosition: "left",
        targetPosition: "right",
        type: "straight",
      });

      expect(edge.targetX).toBe(200); // target.x + width
      expect(edge.targetY).toBe(100); // target.y + height/2
    });

    it("targetPosition=bottom: 锚点应在 target 节点底边中点", () => {
      const source = createNode("s", { x: 100, y: 300 }, 200, 100);
      const target = createNode("t", { x: 100, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e7",
        source,
        target,
        sourcePosition: "top",
        targetPosition: "bottom",
        type: "straight",
      });

      expect(edge.targetX).toBe(200); // target.x + width/2
      expect(edge.targetY).toBe(100); // target.y + height
    });
  });

  describe("straight 类型路径", () => {
    it("路径起点和终点应分别等于 sourceXY 和 targetXY", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 200 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-straight",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "straight",
      });

      const { start, end } = getStartEnd(edge.d);
      expect(start.x).toBe(edge.sourceX);
      expect(start.y).toBe(edge.sourceY);
      expect(end.x).toBe(edge.targetX);
      expect(end.y).toBe(edge.targetY);
    });

    it("路径格式应为 M sx sy L tx ty", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-fmt",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "straight",
      });

      expect(edge.d).toBe("M 200 50 L 400 50");
    });
  });

  describe("bezier 类型路径", () => {
    it("路径起点和终点应分别等于 sourceXY 和 targetXY", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 200 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-bezier",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "bezier",
      });

      const { start, end } = getStartEnd(edge.d);
      expect(start.x).toBe(edge.sourceX);
      expect(start.y).toBe(edge.sourceY);
      expect(end.x).toBe(edge.targetX);
      expect(end.y).toBe(edge.targetY);
    });

    it("水平连线的贝塞尔控制点应在水平方向偏移", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-bezier-h",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "bezier",
      });

      // M 200 50 C cx1 50, cx2 50, 400 50
      // 控制点 y 应等于端点 y（水平连线）
      expect(edge.d).toMatch(/^M 200 50 C/);
      expect(edge.d).toMatch(/400 50$/);
    });

    it("垂直连线 (bottom->top) 的贝塞尔控制点应在垂直方向偏移", () => {
      const source = createNode("s", { x: 100, y: 0 }, 200, 100);
      const target = createNode("t", { x: 100, y: 300 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-bezier-v",
        source,
        target,
        sourcePosition: "bottom",
        targetPosition: "top",
        type: "bezier",
      });

      // source anchor: (200, 100), target anchor: (200, 300)
      expect(edge.sourceX).toBe(200);
      expect(edge.sourceY).toBe(100);
      expect(edge.targetX).toBe(200);
      expect(edge.targetY).toBe(300);

      const { start, end } = getStartEnd(edge.d);
      expect(start.x).toBe(200);
      expect(start.y).toBe(100);
      expect(end.x).toBe(200);
      expect(end.y).toBe(300);
    });
  });

  describe("step 类型路径", () => {
    it("水平连线: 路径起终点正确且经过中间折点", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 200 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-step-h",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "step",
      });

      // source: (200, 50), target: (400, 150)
      // midX = 300
      // 水平: M 200 50 L 300 50 L 300 150 L 400 150
      const { start, end } = getStartEnd(edge.d);
      expect(start.x).toBe(edge.sourceX);
      expect(start.y).toBe(edge.sourceY);
      expect(end.x).toBe(edge.targetX);
      expect(end.y).toBe(edge.targetY);
    });

    it("垂直连线: 路径起终点正确", () => {
      const source = createNode("s", { x: 100, y: 0 }, 200, 100);
      const target = createNode("t", { x: 300, y: 300 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-step-v",
        source,
        target,
        sourcePosition: "bottom",
        targetPosition: "top",
        type: "step",
      });

      // source: (200, 100), target: (400, 300)
      const { start, end } = getStartEnd(edge.d);
      expect(start.x).toBe(edge.sourceX);
      expect(start.y).toBe(edge.sourceY);
      expect(end.x).toBe(edge.targetX);
      expect(end.y).toBe(edge.targetY);
    });
  });

  describe("smoothstep 类型路径", () => {
    it("路径起终点正确", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 200 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-ss",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "smoothstep",
      });

      const { start, end } = getStartEnd(edge.d);
      expect(start.x).toBe(edge.sourceX);
      expect(start.y).toBe(edge.sourceY);
      expect(end.x).toBe(edge.targetX);
      expect(end.y).toBe(edge.targetY);
    });
  });

  describe("默认值", () => {
    it("未传 width/height 时使用默认值 150x80", () => {
      const source = new FlowNodeModel({
        id: "s",
        position: { x: 0, y: 0 },
        data: {},
      } as any);
      const target = new FlowNodeModel({
        id: "t",
        position: { x: 400, y: 0 },
        data: {},
      } as any);
      const edge = new FlowEdgeModel({
        id: "e-default-size",
        source,
        target,
        type: "straight",
      });

      // sourcePosition defaults to "right", targetPosition defaults to "left"
      // source anchor: (0 + 150, 0 + 80/2) = (150, 40)
      // target anchor: (400, 0 + 80/2) = (400, 40)
      expect(edge.sourceX).toBe(150);
      expect(edge.sourceY).toBe(40);
      expect(edge.targetX).toBe(400);
      expect(edge.targetY).toBe(40);
    });

    it("默认 sourcePosition=right, targetPosition=left", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-default-pos",
        source,
        target,
        type: "straight",
      });

      // right anchor: (200, 50), left anchor: (400, 50)
      expect(edge.sourceX).toBe(200);
      expect(edge.sourceY).toBe(50);
      expect(edge.targetX).toBe(400);
      expect(edge.targetY).toBe(50);
    });

    it("默认 type=bezier", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-default-type",
        source,
        target,
      });

      expect(edge.type).toBe("bezier");
      expect(edge.d).toMatch(/^M .* C /); // bezier path has C command
    });
  });

  describe("拖拽后 computePath 应使用最新位置", () => {
    it("拖拽 source 节点后重新计算路径", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-drag",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "straight",
      });

      expect(edge.sourceX).toBe(200);
      expect(edge.sourceY).toBe(50);

      // 模拟拖拽: 修改 data.position
      source.data.position = { x: 100, y: 100 };
      edge.computePath();

      // 新 right anchor: (100 + 200, 100 + 50) = (300, 150)
      expect(edge.sourceX).toBe(300);
      expect(edge.sourceY).toBe(150);
    });

    it("拖拽 target 节点后重新计算路径", () => {
      const source = createNode("s", { x: 0, y: 0 }, 200, 100);
      const target = createNode("t", { x: 400, y: 0 }, 200, 100);
      const edge = new FlowEdgeModel({
        id: "e-drag-target",
        source,
        target,
        sourcePosition: "right",
        targetPosition: "left",
        type: "straight",
      });

      expect(edge.targetX).toBe(400);
      expect(edge.targetY).toBe(50);

      target.data.position = { x: 500, y: 200 };
      edge.computePath();

      expect(edge.targetX).toBe(500);
      expect(edge.targetY).toBe(250);
    });
  });
});
