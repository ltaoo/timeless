// ResizablePanels 使用示例

import { ResizablePanelsCore, ResizablePanelCore } from "@timeless/ui";
import { ResizablePanels, ResizablePanel, ResizableHandle, View } from "@timeless/shadcnui";

// 创建 ResizablePanels 实例
const panelsGroup = new ResizablePanelsCore({
  direction: "horizontal", // 或 "vertical"
  onResize: (sizes) => {
    console.log("Panel sizes:", sizes);
  },
});

// 创建面板实例
const leftPanel = new ResizablePanelCore({
  defaultSize: 30,
  minSize: 20,
  maxSize: 50,
});

const rightPanel = new ResizablePanelCore({
  defaultSize: 70,
  minSize: 50,
  maxSize: 80,
});

// 使用组件
const App = View({ class: "h-screen w-screen" }, [
  ResizablePanels(
    {
      store: panelsGroup,
      direction: "horizontal",
      class: "rounded-lg border",
    },
    [
      // 左侧面板
      ResizablePanel(
        {
          store: leftPanel,
          group: panelsGroup,
        },
        [
          View({ class: "p-4" }, ["Left Panel Content"]),
        ],
      ),

      // 拖拽手柄
      ResizableHandle({
        store: panelsGroup,
        panelBefore: leftPanel,
        panelAfter: rightPanel,
        withHandle: true, // 显示手柄图标
      }),

      // 右侧面板
      ResizablePanel(
        {
          store: rightPanel,
          group: panelsGroup,
        },
        [
          View({ class: "p-4" }, ["Right Panel Content"]),
        ],
      ),
    ],
  ),
]);

// 垂直布局示例
const verticalGroup = new ResizablePanelsCore({
  direction: "vertical",
});

const topPanel = new ResizablePanelCore({
  defaultSize: 40,
  minSize: 20,
});

const bottomPanel = new ResizablePanelCore({
  defaultSize: 60,
  minSize: 30,
});

const VerticalApp = View({ class: "h-screen w-screen" }, [
  ResizablePanels(
    {
      store: verticalGroup,
      direction: "vertical",
      class: "rounded-lg border",
    },
    [
      ResizablePanel(
        {
          store: topPanel,
          group: verticalGroup,
        },
        [View({ class: "p-4" }, ["Top Panel"])],
      ),

      ResizableHandle({
        store: verticalGroup,
        panelBefore: topPanel,
        panelAfter: bottomPanel,
        withHandle: true,
      }),

      ResizablePanel(
        {
          store: bottomPanel,
          group: verticalGroup,
        },
        [View({ class: "p-4" }, ["Bottom Panel"])],
      ),
    ],
  ),
]);

// 嵌套布局示例（三栏布局）
const mainGroup = new ResizablePanelsCore({ direction: "horizontal" });
const leftPanelNested = new ResizablePanelCore({ defaultSize: 25, minSize: 15 });
const middlePanelNested = new ResizablePanelCore({ defaultSize: 50, minSize: 30 });
const rightPanelNested = new ResizablePanelCore({ defaultSize: 25, minSize: 15 });

const NestedApp = View({ class: "h-screen w-screen" }, [
  ResizablePanels(
    {
      store: mainGroup,
      direction: "horizontal",
      class: "rounded-lg border",
    },
    [
      ResizablePanel(
        { store: leftPanelNested, group: mainGroup },
        [View({ class: "p-4 bg-blue-50" }, ["Sidebar"])],
      ),

      ResizableHandle({
        store: mainGroup,
        panelBefore: leftPanelNested,
        panelAfter: middlePanelNested,
        withHandle: true,
      }),

      ResizablePanel(
        { store: middlePanelNested, group: mainGroup },
        [View({ class: "p-4 bg-white" }, ["Main Content"])],
      ),

      ResizableHandle({
        store: mainGroup,
        panelBefore: middlePanelNested,
        panelAfter: rightPanelNested,
        withHandle: true,
      }),

      ResizablePanel(
        { store: rightPanelNested, group: mainGroup },
        [View({ class: "p-4 bg-gray-50" }, ["Inspector"])],
      ),
    ],
  ),
]);

// 可折叠面板示例
const collapsiblePanel = new ResizablePanelCore({
  defaultSize: 30,
  minSize: 0,
  collapsible: true,
  collapsedSize: 0,
});

// 编程式控制
collapsiblePanel.collapse(); // 折叠面板
collapsiblePanel.expand(); // 展开面板
collapsiblePanel.setSize(50); // 设置大小为 50%
