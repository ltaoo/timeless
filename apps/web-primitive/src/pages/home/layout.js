const { View, Text, Icon, Fragment, refobj, computed, ref, ListenerManager } = Timeless;
const { KeepAliveSubViews } = Timeless.web;

export default function Page(props) {
  const { views, app, history } = props;
  const theme_ = ref(localStorage.getItem("theme") || "light");

  function toggleTheme() {
    const next = theme_.value === "dark" ? "light" : "dark";
    theme_.as(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return View({ class: "flex h-screen bg-background" }, [
    // Icon sidebar
    View({ class: "w-[72px] shrink-0 flex flex-col items-center gap-1 py-3 border-r border-border bg-muted/30" }, [
      View({ class: "w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg mb-2" }, ["T"]),
      navItem("message-square-more", "Chat", "/chat", history),
      navItem("rss", "Articles", "/article/category", history),
      navItem("folder-open", "Projects", "/home/project/workspace", history),
      View({ class: "flex-1" }),
      navItem("grid-3x3", "Admin", "/admin/dashboard", history),
      View({
        class: "w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent cursor-pointer text-muted-foreground",
        onClick: toggleTheme,
      }, [Icon({ name: theme_.value === "dark" ? "sun" : "moon", size: 18 })]),
      View({
        class: "w-10 h-10 flex items-center justify-center rounded-lg hover:bg-accent cursor-pointer",
        onClick() {
          history.push("/settings");
        },
      }, [Icon({ name: "settings", size: 18 })]),
    ]),
    // Content
    View({ class: "flex-1 flex flex-col overflow-hidden" }, [
      KeepAliveSubViews({}),
    ]),
  ]);
}

function navItem(icon, label, path, history) {
  return View({
    class: "w-10 h-10 flex flex-col items-center justify-center rounded-lg hover:bg-accent cursor-pointer text-muted-foreground text-[10px] gap-0.5",
    onClick() { history.push(path); },
  }, [
    Icon({ name: icon, size: 18 }),
    View({ as: "span", class: "text-[10px] leading-none" }, [label]),
  ]);
}
