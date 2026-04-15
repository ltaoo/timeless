import { View } from "@timeless/timeless";

export function Section(title, children) {
  return View({ class: "space-y-3" }, [
    View(
      { class: "text-sm font-semibold text-zinc-500 uppercase tracking-wider" },
      [title],
    ),
    View({ class: "space-y-4 pl-1" }, children),
  ]);
}

export function Item(label, children) {
  return View({ class: "space-y-2" }, [
    View({ class: "text-sm text-zinc-400" }, [label]),
    View({ class: "flex flex-wrap items-center gap-3" }, children),
  ]);
}

/**
 * 页面导航链接栏 - 复刻 web-vanilla sidebar 的 SSR 版本
 */
export function NavBar(props) {
  const { current } = props;
  const links = [
    { href: "/", label: "Home", key: "home" },
    { href: "/components", label: "Components", key: "components" },
    { href: "/settings", label: "Settings", key: "settings" },
    { href: "/login", label: "Login", key: "login" },
  ];

  return View(
    {
      as: "nav",
      class:
        "flex items-center gap-1 px-6 py-3 border-b border-border bg-card",
    },
    [
      View(
        {
          as: "a",
          href: "/",
          class:
            "text-lg font-bold tracking-tight text-foreground mr-6 hover:opacity-80 transition-opacity",
        },
        ["T"],
      ),
      ...links.map((link) =>
        View(
          {
            as: "a",
            href: link.href,
            class:
              current === link.key
                ? "px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground"
                : "px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors",
          },
          [link.label],
        ),
      ),
    ],
  );
}
