export function renderHome(options = {}) {
  const { rightWidth = 60 } = options;
  const sidebar = [
    "Timeless",
    "Node Vanilla",
    "",
    "Menu",
    "  • Home",
    "  • Article",
    "  • Project",
    "  • Settings",
    "",
    "Actions",
    "  • Admin",
    "  • Theme",
  ];

  const content = [
    "Home",
    "====",
    "",
    "这是一个在终端渲染的两列布局示例。",
    "左侧为固定宽度的导航区，右侧为自适应内容区。",
    "",
    "布局要点",
    `- 右侧宽度: ${rightWidth}`,
    "- 文本自动换行",
    "- 两列高度自动对齐",
  ];

  return { sidebar, content };
}

