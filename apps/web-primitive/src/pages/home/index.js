const { View, Text, Fragment, For, computed, refobj } = Timeless;
const { KeepAliveSubViews } = Timeless.web;

export default function Page(props) {
  const { views, history } = props;

  const menuItems = [
    { key: "general", label: "General", desc: "Buttons, badges, cards" },
    { key: "form", label: "Form", desc: "Input, select, date picker" },
    { key: "validate", label: "Validate", desc: "Form validation" },
    { key: "llm", label: "LLM", desc: "AI model selector" },
    { key: "data", label: "Data", desc: "Table, progress, steps" },
    { key: "scroll", label: "Scroll", desc: "Scroll view, waterfall" },
    { key: "feedback", label: "Feedback", desc: "Dialog, sheet, popover" },
    { key: "nav", label: "Navigation", desc: "Tabs, accordion" },
    { key: "overlay", label: "Overlay", desc: "Dropdown, tooltip, context menu" },
    { key: "debug", label: "Debug", desc: "Select, search" },
    { key: "lifecycle", label: "Lifecycle", desc: "Mount/unmount demo" },
    { key: "command", label: "Command", desc: "Command palette" },
    { key: "download_task", label: "Download", desc: "Download manager" },
    { key: "flow", label: "Flow", desc: "Pipeline canvas" },
  ];

  const currentKey_ = refobj(views.current || {});

  return View({ class: "flex h-full" }, [
    // Sidebar
    View({ class: "w-[220px] shrink-0 border-r border-border overflow-auto p-3" }, [
      Text({ class: "text-xs font-semibold uppercase text-muted-foreground mb-3 px-2" }, ["Components"]),
      ...menuItems.map((item) =>
        View({
          class: "px-3 py-2 rounded-md cursor-pointer hover:bg-accent mb-0.5" +
            (currentKey_.value?.key === item.key ? " bg-accent text-accent-foreground" : ""),
          onClick() { history.push("/home/index/" + item.key); },
        }, [
          Text({ class: "text-sm font-medium" }, [item.label]),
          Text({ class: "text-xs text-muted-foreground" }, [item.desc]),
        ]),
      ),
    ]),
    // Content
    View({ class: "flex-1 overflow-auto" }, [
      KeepAliveSubViews({}),
    ]),
  ]);
}
