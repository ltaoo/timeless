import { Section, Item } from "@/components/index.js";

export default function FlowExamplePage() {
  const view$ = new Timeless.ui.ScrollViewCore({});

  const flow$ = new Timeless.ui.FlowCanvasModel({
    nodes: [
      new Timeless.ui.FlowNodeModel({
        id: "trigger",
        position: { x: 0, y: 200 },
        data: { label: "手动触发" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "input",
        position: { x: 200, y: 200 },
        data: { label: "输入 URL" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "request",
        position: { x: 400, y: 200 },
        data: { label: "页面请求", desc: "HTTP / CDP" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "parse",
        position: { x: 620, y: 200 },
        data: { label: "响应解析" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "img-extract",
        position: { x: 840, y: 100 },
        data: { label: "img 提取" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "css-extract",
        position: { x: 840, y: 300 },
        data: { label: "css 提取" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "img-request",
        position: { x: 1060, y: 100 },
        data: { label: "img 请求" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "css-request",
        position: { x: 1060, y: 300 },
        data: { label: "css 请求" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "merge",
        position: { x: 1280, y: 200 },
        data: { label: "合并替换", desc: "img→base64, css→inline" },
        type: "default",
      }),
      new Timeless.ui.FlowNodeModel({
        id: "save",
        position: { x: 1500, y: 200 },
        data: { label: "保存" },
        type: "default",
      }),
    ],
    edges: [
      { id: "e-trigger-input", source: "trigger", target: "input", type: "bezier" },
      { id: "e-input-request", source: "input", target: "request", type: "bezier" },
      { id: "e-request-parse", source: "request", target: "parse", type: "bezier" },
      { id: "e-parse-img", source: "parse", target: "img-extract", type: "bezier" },
      { id: "e-parse-css", source: "parse", target: "css-extract", type: "bezier" },
      { id: "e-parse-merge", source: "parse", target: "merge", type: "bezier" },
      { id: "e-img-extract-req", source: "img-extract", target: "img-request", type: "bezier" },
      { id: "e-css-extract-req", source: "css-extract", target: "css-request", type: "bezier" },
      { id: "e-img-req-merge", source: "img-request", target: "merge", type: "bezier" },
      { id: "e-css-req-merge", source: "css-request", target: "merge", type: "bezier" },
      { id: "e-merge-save", source: "merge", target: "save", type: "bezier" },
    ],
    isValidConnection: (conn) => conn.source !== conn.target,
  });

  flow$.onConnect((conn) => {
    console.log("Connection:", conn);
    flow$.addEdge({
      source: conn.source,
      sourceHandle: conn.sourceHandle,
      target: conn.target,
      targetHandle: conn.targetHandle,
    });
  });

  flow$.onNodeClick(({ node, event }) => {
    console.log("Node clicked:", node.id, event);
  });

  flow$.onNodeDrag(({ node, position }) => {
    console.log("Node dragging:", node.id, position);
  });

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("Flow", [
        Item("Basic Flow", [
          View(
            {
              class:
                "w-full h-[500px] border border-border rounded-lg overflow-hidden",
            },
            [
              FlowCanvasView({
                store: flow$,
                showBackground: true,
                showControls: true,
                showMinimap: false,
                backgroundVariant: "dots",
                nodeTypes: {
                  default({ node }) {
                    return [
                      View({ class: "px-4 py-2 text-sm text-center" }, [
                        node.data?.label || node.id,
                      ]),
                    ];
                  },
                },
              }),
            ],
          ),
        ]),
      ]),
      Section("Operations", [
        Item("Add Node", [
          View({ class: "flex gap-2" }, [
            Button(
              {
                store: new Timeless.ui.ButtonCore({}),
                onClick() {
                  const id = `node-${Date.now()}`;
                  flow$.addNode(
                    new Timeless.ui.FlowNodeModel({
                      id,
                      position: {
                        x: Math.random() * 400 + 100,
                        y: Math.random() * 300 + 100,
                      },
                      data: { label: `New Node ${id.slice(-4)}` },
                    }),
                  );
                },
              },
              ["Add Random Node"],
            ),
            Button(
              {
                store: new Timeless.ui.ButtonCore({}),
                onClick() {
                  const nodes = flow$.nodes;
                  if (nodes.length > 0) {
                    flow$.removeNode(nodes[nodes.length - 1].id);
                  }
                },
              },
              ["Remove Last Node"],
            ),
            Button(
              {
                store: new Timeless.ui.ButtonCore({}),
                onClick() {
                  flow$.fitView({ padding: 50 });
                },
              },
              ["Fit View"],
            ),
          ]),
        ]),
        Item("Fit View", [
          View({ class: "flex gap-2" }, [
            Button(
              {
                store: new Timeless.ui.ButtonCore({}),
                onClick() {
                  flow$.resetView();
                },
              },
              ["Reset View"],
            ),
            Button(
              {
                store: new Timeless.ui.ButtonCore({}),
                onClick() {
                  flow$.zoomIn();
                },
              },
              ["Zoom In"],
            ),
            Button(
              {
                store: new Timeless.ui.ButtonCore({}),
                onClick() {
                  flow$.zoomOut();
                },
              },
              ["Zoom Out"],
            ),
          ]),
        ]),
      ]),
      Section("State", [
        Item("Current Nodes", [
          View(
            {
              class: "p-4 bg-muted rounded-lg text-xs font-mono whitespace-pre",
            },
            [JSON.stringify(flow$.toJSON(), null, 2)],
          ),
        ]),
      ]),
    ]),
  ]);
}
