const { View, Text } = Timeless;

// Simple split layout
export function SplitLayout(options) {
  const { left, right, defaultSize = 30, minSize = 20, maxSize = 50 } = options;
  const { SplitView } = Timeless;
  return SplitView({
    class: "flex-1",
    defaultSize,
    minSize,
    maxSize,
  }, [
    typeof left === "function" ? left() : left,
    typeof right === "function" ? right() : right,
  ]);
}

// Sidebar layout
export function SidebarLayout(options, children) {
  const { sidebar, sidebarWidth = "w-56" } = options;
  return View(
    { class: "flex h-full" },
    [
      View({ class: sidebarWidth + " border-r border-border shrink-0" }, [
        typeof sidebar === "function" ? sidebar() : sidebar,
      ]),
      View({ class: "flex-1 overflow-auto" }, [
        typeof children === "function" ? children() : children,
      ]),
    ],
  );
}

// Stack layout
export function StackLayout(options, children) {
  const { header, footer } = options;
  return View(
    { class: "flex flex-col h-full" },
    [
      header ? View({ class: "shrink-0" }, [typeof header === "function" ? header() : header]) : null,
      View({ class: "flex-1 overflow-auto" }, [
        typeof children === "function" ? children() : children,
      ]),
      footer ? View({ class: "shrink-0" }, [typeof footer === "function" ? footer() : footer]) : null,
    ],
  );
}

// Page content wrapper
export function PageContent(props, children) {
  return View(
    { class: "p-6 overflow-auto h-full" },
    Array.isArray(children) ? children : [children],
  );
}
