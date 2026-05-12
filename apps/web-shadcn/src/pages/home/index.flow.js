import { Section, Item } from "@/components/index.js";

function generateMockExecution(nodeId) {
  const statuses = ["completed", "completed", "completed", "failed", "running"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const baseData = {
    trigger: { url: "https://example.com" },
    input: { url: "https://example.com/article" },
    request: {
      url: "https://example.com/article",
      status: 200,
      statusText: "OK",
      responseTime: 245,
    },
    parse: {
      html: "<html>...</html>",
      images: ["img1.jpg", "img2.jpg", "img3.jpg"],
      stylesheets: ["style1.css", "style2.css"],
      scripts: ["app.js"],
    },
    "img-extract": { urls: ["img1.jpg", "img2.jpg", "img3.jpg"], count: 3 },
    "css-extract": { urls: ["style1.css", "style2.css"], count: 2 },
    "img-request": {
      results: [
        {
          originalUrl: "img1.jpg",
          base64: "data:image/jpeg;base64,...",
          contentType: "image/jpeg",
        },
        {
          originalUrl: "img2.jpg",
          base64: "data:image/jpeg;base64,...",
          contentType: "image/jpeg",
        },
        {
          originalUrl: "img3.jpg",
          base64: "data:image/jpeg;base64,...",
          contentType: "image/jpeg",
        },
      ],
    },
    "css-request": {
      results: [
        {
          originalUrl: "style1.css",
          content: "body { color: red; }",
          contentType: "text/css",
        },
        {
          originalUrl: "style2.css",
          content: "h1 { font-size: 24px; }",
          contentType: "text/css",
        },
      ],
    },
    merge: {
      html: "<html>...</html>",
      stats: { imagesReplaced: 3, stylesheetsInlined: 2 },
    },
    save: {
      path: "/outputs/pipeline_xxx/1747043200000.html",
      size: 45678,
      url: "file:///...",
    },
  };

  const nodeIndex = [
    "trigger",
    "input",
    "request",
    "parse",
    "img-extract",
    "css-extract",
    "img-request",
    "css-request",
    "merge",
    "save",
  ].indexOf(nodeId);

  const input =
    nodeIndex === 0
      ? { triggerTime: new Date().toISOString(), triggerBy: "user" }
      : baseData[nodeId] || {};

  const logs = [
    {
      timestamp: new Date(Date.now() - 5000),
      level: "info",
      message: "[" + nodeId + "] 节点开始执行",
    },
    {
      timestamp: new Date(Date.now() - 4500),
      level: "debug",
      message:
        "[" +
        nodeId +
        "] 输入数据: " +
        JSON.stringify(input).slice(0, 100) +
        "...",
    },
    {
      timestamp: new Date(Date.now() - 3000),
      level: "info",
      message: "[" + nodeId + "] 处理中...",
    },
    {
      timestamp: new Date(Date.now() - 1000),
      level: "info",
      message: "[" + nodeId + "] 执行完成",
    },
  ];

  if (nodeId === "request") {
    logs.push({
      timestamp: new Date(Date.now() - 4000),
      level: "debug",
      message: "发送 HTTP GET 请求到 https://example.com/article",
    });
    logs.push({
      timestamp: new Date(Date.now() - 3500),
      level: "info",
      message: "响应状态: 200 OK (245ms)",
    });
  }

  if (nodeId === "img-request") {
    logs.push({
      timestamp: new Date(Date.now() - 4000),
      level: "info",
      message: "开始批量下载 3 个图片资源",
    });
    logs.push({
      timestamp: new Date(Date.now() - 3000),
      level: "debug",
      message: "img1.jpg -> base64 转换完成",
    });
    logs.push({
      timestamp: new Date(Date.now() - 2000),
      level: "debug",
      message: "img2.jpg -> base64 转换完成",
    });
    logs.push({
      timestamp: new Date(Date.now() - 1000),
      level: "debug",
      message: "img3.jpg -> base64 转换完成",
    });
  }

  if (status === "failed") {
    logs.push({
      timestamp: new Date(),
      level: "error",
      message: "执行失败: 网络连接超时",
    });
  }

  return {
    status: status,
    input: input,
    output: status === "completed" ? input : undefined,
    error:
      status === "failed"
        ? {
            message: "网络连接超时",
            stack: "Error: connect ETIMEDOUT\n    at ...",
          }
        : undefined,
    logs: logs,
    timing: {
      startTime: new Date(Date.now() - 5000),
      endTime: new Date(Date.now() - 1000),
      duration: 4000,
    },
  };
}

export default function FlowExamplePage() {
  const view$ = new Timeless.ui.ScrollViewCore({});
  const selectedNodeId = ref(null);
  const selectedNodeData = ref(null);

  const flow$ = new Timeless.ui.FlowCanvasModel({
    nodes: [
      new Timeless.ui.FlowNodeModel({
        id: "trigger",
        position: { x: 0, y: 200 },
        data: { label: "手动触发" },
        type: "default",
        execution: generateMockExecution("trigger"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "input",
        position: { x: 200, y: 200 },
        data: { label: "输入 URL" },
        type: "default",
        execution: generateMockExecution("input"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "request",
        position: { x: 400, y: 200 },
        data: { label: "页面请求", desc: "HTTP / CDP" },
        type: "default",
        execution: generateMockExecution("request"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "parse",
        position: { x: 620, y: 200 },
        data: { label: "响应解析" },
        type: "default",
        execution: generateMockExecution("parse"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "img-extract",
        position: { x: 840, y: 100 },
        data: { label: "img 提取" },
        type: "default",
        execution: generateMockExecution("img-extract"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "css-extract",
        position: { x: 840, y: 300 },
        data: { label: "css 提取" },
        type: "default",
        execution: generateMockExecution("css-extract"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "img-request",
        position: { x: 1060, y: 100 },
        data: { label: "img 请求" },
        type: "default",
        execution: generateMockExecution("img-request"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "css-request",
        position: { x: 1060, y: 300 },
        data: { label: "css 请求" },
        type: "default",
        execution: generateMockExecution("css-request"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "merge",
        position: { x: 1280, y: 200 },
        data: { label: "合并替换", desc: "img→base64, css→inline" },
        type: "default",
        execution: generateMockExecution("merge"),
      }),
      new Timeless.ui.FlowNodeModel({
        id: "save",
        position: { x: 1500, y: 200 },
        data: { label: "保存" },
        type: "default",
        execution: generateMockExecution("save"),
      }),
    ],
    edges: [
      {
        id: "e-trigger-input",
        source: "trigger",
        target: "input",
        type: "bezier",
      },
      {
        id: "e-input-request",
        source: "input",
        target: "request",
        type: "bezier",
      },
      {
        id: "e-request-parse",
        source: "request",
        target: "parse",
        type: "bezier",
      },
      {
        id: "e-parse-img",
        source: "parse",
        target: "img-extract",
        type: "bezier",
      },
      {
        id: "e-parse-css",
        source: "parse",
        target: "css-extract",
        type: "bezier",
      },
      { id: "e-parse-merge", source: "parse", target: "merge", type: "bezier" },
      {
        id: "e-img-extract-req",
        source: "img-extract",
        target: "img-request",
        type: "bezier",
      },
      {
        id: "e-css-extract-req",
        source: "css-extract",
        target: "css-request",
        type: "bezier",
      },
      {
        id: "e-img-req-merge",
        source: "img-request",
        target: "merge",
        type: "bezier",
      },
      {
        id: "e-css-req-merge",
        source: "css-request",
        target: "merge",
        type: "bezier",
      },
      { id: "e-merge-save", source: "merge", target: "save", type: "bezier" },
    ],
    isValidConnection: function (conn) {
      return conn.source !== conn.target;
    },
  });

  flow$.onNodeClick(function (params) {
    flow$.nodes.forEach(function (n) {
      n.selected = false;
    });
    params.node.selected = true;
    selectedNodeId.value = params.node.id;
    selectedNodeData.value = params.node.execution;
  });

  flow$.onNodeDrag(function (params) {
    console.log("Node dragging:", params.node.id, params.position);
  });

  flow$.onNodeRerun(function (params) {
    var nodeId = params.node.id;
    console.log("Re-running node:", nodeId);
    params.node.setExecutionStatus("running");
    params.node.execution.logs = [];
    params.node.addLog("info", "[" + nodeId + "] 重新执行中...");
    setTimeout(function () {
      var mockResult = generateMockExecution(nodeId);
      mockResult.status = "completed";
      mockResult.logs.unshift({
        timestamp: new Date(),
        level: "info",
        message: "[" + nodeId + "] 重新执行",
      });
      params.node.execution = mockResult;
      selectedNodeData.value = params.node.execution;
    }, 1500);
  });

  var closePanel = function () {
    selectedNodeId.value = null;
    selectedNodeData.value = null;
    flow$.nodes.forEach(function (n) {
      n.selected = false;
    });
  };

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("Flow 执行结果", [
        View(
          {
            class:
              "relative w-full h-[500px] border border-border rounded-lg overflow-hidden",
          },
          [
            FlowCanvasView({
              store: flow$,
              showBackground: true,
              showControls: true,
              showMinimap: false,
              backgroundVariant: "dots",
              nodeTypes: {
                default: function (props) {
                  return [
                    View({ class: "px-4 py-2 text-sm text-center" }, [
                      props.node.data && props.node.data.label
                        ? props.node.data.label
                        : props.node.id,
                    ]),
                  ];
                },
              },
            }),
            Show({
              when: selectedNodeId.value !== null,
              ok: function () {
                var data = selectedNodeData.value;
                var statusLabels = {
                  pending: "等待",
                  running: "运行中",
                  completed: "已完成",
                  failed: "失败",
                  skipped: "已跳过",
                };
                var statusBgs = {
                  pending: "bg-gray-100 dark:bg-gray-800",
                  running: "bg-yellow-100 dark:bg-yellow-900",
                  completed: "bg-green-100 dark:bg-green-900",
                  failed: "bg-red-100 dark:bg-red-900",
                  skipped: "bg-blue-100 dark:bg-blue-900",
                };
                var statusTexts = {
                  pending: "text-gray-700 dark:text-gray-300",
                  running: "text-yellow-700 dark:text-yellow-300",
                  completed: "text-green-700 dark:text-green-300",
                  failed: "text-red-700 dark:text-red-300",
                  skipped: "text-blue-700 dark:text-blue-300",
                };
                var statusLabel = statusLabels[data && data.status] || "未知";
                var statusBg = statusBgs[data && data.status] || "bg-gray-100";
                var statusText =
                  statusTexts[data && data.status] || "text-gray-700";

                return View(
                  {
                    class:
                      "absolute right-0 top-0 bottom-0 w-[400px] bg-white dark:bg-gray-800 border-l border-border shadow-xl overflow-hidden flex flex-col",
                  },
                  [
                    View(
                      {
                        class:
                          "flex items-center justify-between p-4 border-b border-border",
                      },
                      [
                        View({ class: "font-semibold" }, ["节点详情"]),
                        View(
                          {
                            class:
                              "w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
                            onClick: closePanel,
                          },
                          ["×"],
                        ),
                      ],
                    ),
                    View({ class: "p-4 border-b border-border" }, [
                      View(
                        {
                          class:
                            "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium " +
                            statusBg +
                            " " +
                            statusText,
                        },
                        [statusLabel],
                      ),
                      Show({
                        when: data && data.timing && data.timing.duration,
                        ok: function () {
                          return View(
                            {
                              class:
                                "text-sm text-gray-500 dark:text-gray-400 mt-2",
                            },
                            ["执行耗时: " + data.timing.duration + "ms"],
                          );
                        },
                      }),
                    ]),
                    View({ class: "flex-1 overflow-y-auto" }, [
                      View({ class: "border-b border-border" }, [
                        View({ class: "px-4 py-3 font-medium text-sm" }, [
                          "输入数据",
                        ]),
                        View({ class: "px-4 pb-3" }, [
                          View(
                            {
                              class:
                                "p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono overflow-x-auto whitespace-pre",
                            },
                            [
                              JSON.stringify(
                                (data && data.input) || {},
                                null,
                                2,
                              ),
                            ],
                          ),
                        ]),
                      ]),
                      View({ class: "border-b border-border" }, [
                        View({ class: "px-4 py-3 font-medium text-sm" }, [
                          "输出数据",
                        ]),
                        Show({
                          when: data && data.output,
                          ok: function () {
                            return View({ class: "px-4 pb-3" }, [
                              View(
                                {
                                  class:
                                    "p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs font-mono overflow-x-auto whitespace-pre",
                                },
                                [JSON.stringify(data.output, null, 2)],
                              ),
                            ]);
                          },
                          else: function () {
                            return View(
                              { class: "px-4 pb-3 text-sm text-gray-500" },
                              ["暂无输出数据"],
                            );
                          },
                        }),
                      ]),
                      View({ class: "border-b border-border" }, [
                        View({ class: "px-4 py-3 font-medium text-sm" }, [
                          "执行日志",
                        ]),
                        View({ class: "px-4 pb-3 max-h-64 overflow-y-auto" }, [
                          For({
                            each: (data && data.logs) || [],
                            render: function (log) {
                              var levelColors = {
                                debug: "text-gray-400",
                                info: "text-blue-500",
                                warn: "text-yellow-500",
                                error: "text-red-500",
                              };
                              var levelLabels = {
                                debug: "DBG",
                                info: "INF",
                                warn: "WRN",
                                error: "ERR",
                              };
                              return View(
                                { class: "flex gap-2 text-xs py-1 font-mono" },
                                [
                                  View(
                                    {
                                      class: "text-gray-400 whitespace-nowrap",
                                    },
                                    [
                                      new Date(
                                        log.timestamp,
                                      ).toLocaleTimeString(),
                                    ],
                                  ),
                                  View(
                                    {
                                      class:
                                        (levelColors[log.level] ||
                                          "text-gray-400") + " w-8",
                                    },
                                    [levelLabels[log.level] || "LOG"],
                                  ),
                                  View(
                                    {
                                      class:
                                        "text-gray-700 dark:text-gray-300 break-all",
                                    },
                                    [log.message],
                                  ),
                                ],
                              );
                            },
                          }),
                        ]),
                      ]),
                      Show({
                        when: data && data.error,
                        ok: function () {
                          return View({ class: "border-b border-border" }, [
                            View(
                              {
                                class:
                                  "px-4 py-3 font-medium text-sm text-red-500",
                              },
                              ["错误信息"],
                            ),
                            View({ class: "px-4 pb-3" }, [
                              View(
                                {
                                  class:
                                    "p-3 bg-red-50 dark:bg-red-900/20 rounded text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap",
                                },
                                [
                                  data.error.message +
                                    "\n\n" +
                                    (data.error.stack || ""),
                                ],
                              ),
                            ]),
                          ]);
                        },
                      }),
                    ]),
                  ],
                );
              },
            }),
          ],
        ),
      ]),
      Section("State", [
        Item("Current Nodes", [
          View(
            {
              class:
                "p-4 bg-muted rounded-lg text-xs font-mono whitespace-pre max-h-96 overflow-auto",
            },
            [JSON.stringify(flow$.toJSON(), null, 2)],
          ),
        ]),
      ]),
    ]),
  ]);
}
