const nav_menus = [
  { id: "root.home_layout.index", icon: "home", label: "首页" },
  { id: "root.home_layout.task", icon: "calendar", label: "任务" },
  { id: "root.home_layout.explore", icon: "explore", label: "发现" },
  { id: "root.home_layout.settings", icon: "settings", label: "设置" },
];
const icons = {
  home: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
  calendar:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
  explore:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
  settings:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
};
const LogoSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="var(--GREEN)">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
</svg>`;

export function SidebarView(props) {
  const view$ = View({ class: "sidebar" }, [
    View({ class: "sidebar-header" }, [
      View({ class: "logo" }, [DangerouslyInnerHTML(LogoSVG)]),
    ]),
    For({
      class: "sidebar-nav",
      each: nav_menus,
      render(menu) {
        return View(
          {
            class: "nav-item",
            dataset: { id: menu.id, label: menu.label },
            onClick() {
              if (props.onClick) {
                props.onClick(menu);
              }
            },
          },
          [
            DangerouslyInnerHTML(icons[menu.icon]),
            View({ class: "nav-label" }, [Txt(menu.label)]),
          ]
        );
      },
    }),
    View({ class: "sidebar-footer" }, [
      View({ class: "user-avatar" }, [
        View({ class: "avatar-letter" }, [Txt("U")]),
      ]),
    ]),
  ]);
  const _style = document.createElement("style");
  _style.textContent = `.sidebar {
  width: 72px;
  height: 100%;
  background: var(--BG-1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  border-right: 1px solid var(--border);
}
.sidebar-header {
  margin-bottom: 24px;
}
.logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.nav-item {
  width: 100%;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--FG-1);
  transition: all 0.2s;
  border-radius: 0;
}
.nav-item:hover {
  background: var(--BG-3);
  color: var(--FG-0);
}
.nav-item.active {
  color: var(--GREEN);
  background: var(--BG-3);
}
.nav-label {
  font-size: 10px;
  font-weight: 500;
}
.sidebar-footer {
  margin-top: auto;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--GREEN);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}`;

  // // 绑定事件
  // container.querySelectorAll(".nav-item").forEach((item) => {
  //   item.addEventListener("click", () => {
  //     const view = item.dataset.view;
  //     this.setView(view);
  //     this.onNavigate(view);
  //   });
  // });

  return {
    t: "view",
    render() {
      document.head.appendChild(_style);
      return view$.render();
    },
  };
}
