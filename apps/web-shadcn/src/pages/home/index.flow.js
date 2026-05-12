import { Section, Item } from "@/components/index.js";

export default function FlowExamplePage() {
  const view$ = new Timeless.ui.ScrollViewCore({});

  const flow$ = new Timeless.ui.FlowCanvasModel({
    nodes: [
      {
        id: "1",
        position: { x: 100, y: 100 },
        data: { label: "Start" },
        type: "default",
      },
      {
        id: "2",
        position: { x: 350, y: 50 },
        data: { label: "Process A" },
        type: "default",
      },
      {
        id: "3",
        position: { x: 350, y: 200 },
        data: { label: "Process B" },
        type: "default",
      },
      {
        id: "4",
        position: { x: 600, y: 125 },
        data: { label: "End" },
        type: "default",
      },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2", type: "bezier" },
      { id: "e1-3", source: "1", target: "3", type: "bezier" },
      { id: "e2-4", source: "2", target: "4", type: "bezier" },
      { id: "e3-4", source: "3", target: "4", type: "bezier" },
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
              FlowCanvas({
                store: flow$,
                showBackground: true,
                showControls: true,
                showMinimap: false,
                backgroundVariant: "dots",
                nodeTypes: {
                  default: ({ node, store }) => [
                    FlowHandle({
                      store,
                      nodeId: node.id,
                      handleId: "input",
                      type: "target",
                      position: "left",
                    }),
                    View({ class: "px-4 py-2 text-sm text-center" }, [
                      node.data?.label || node.id,
                    ]),
                    FlowHandle({
                      store,
                      nodeId: node.id,
                      handleId: "output",
                      type: "source",
                      position: "right",
                    }),
                  ],
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
                  flow$.addNode({
                    id,
                    position: {
                      x: Math.random() * 400 + 100,
                      y: Math.random() * 300 + 100,
                    },
                    data: { label: `New Node ${id.slice(-4)}` },
                  });
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
