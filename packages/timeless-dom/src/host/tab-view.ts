import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

let _tabSeq = 0;

export type DOMTabView = VNodeView<HTMLDivElement> & {
  t: "tab-view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

function injectTabCSS(id: string, css: string) {
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export function DOMTabView(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMTabView {
  const box$ = HostElement({ $elm: null, t: "tab-view", build: props.build });

  return {
    ...box$.methods,
    t: "tab-view",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      const s = elm.state ?? {};
      const activeIndex = s.activeIndex ?? 0;
      const position = s.position ?? "top";

      const cls = `tl-tabview-${++_tabSeq}`;

      let tabBarStyle = "display:flex;";
      if (position === "top" || position === "bottom") {
        tabBarStyle += "flex-direction:row;";
      } else {
        tabBarStyle += "flex-direction:column;";
      }

      const tabContentStyle = "flex:1;position:relative;overflow:hidden;";
      const tabPaneStyle =
        "position:absolute;top:0;left:0;width:100%;height:100%;display:none;";
      const activeTabPaneStyle = "display:block;";

      const css = `
        .${cls}{display:flex;flex-direction:${position === "top" || position === "bottom" ? "column" : "row"};width:100%;height:100%;}
        .${cls}-bar{${tabBarStyle}border-bottom:1px solid #ddd;flex-shrink:0;}
        .${cls}-tab{padding:8px 16px;cursor:pointer;border:1px solid transparent;background:none;}
        .${cls}-tab.active{border-bottom:2px solid #007AFF;color:#007AFF;font-weight:500;}
        .${cls}-content{${tabContentStyle}}
        .${cls}-pane{${tabPaneStyle}}
        .${cls}-pane.active{${activeTabPaneStyle}}
      `;
      injectTabCSS(`tl-tabview-style-${cls}`, css);
      $elm.classList.add(cls);

      const $bar = document.createElement("div");
      $bar.className = `${cls}-bar`;

      const $content = document.createElement("div");
      $content.className = `${cls}-content`;

      if (elm.children && elm.children.length > 0) {
        elm.children.forEach((child: TimelessElement, i: number) => {
          if (child?.t === "tab-pane") {
            const label = child.state?.label ?? `Tab ${i + 1}`;
            const $tab = document.createElement("button");
            $tab.className = `${cls}-tab${i === activeIndex ? " active" : ""}`;
            $tab.textContent = label;
            $tab.onclick = () => {
              document
                .querySelectorAll(`.${cls}-tab`)
                .forEach((t: any) => t.classList.remove("active"));
              $tab.classList.add("active");
              document
                .querySelectorAll(`.${cls}-pane`)
                .forEach((p: any) => p.classList.remove("active"));
              $panes[i].classList.add("active");
              if (s.onChange) s.onChange(i);
            };
            $bar.appendChild($tab);

            const $pane = document.createElement("div");
            $pane.className = `${cls}-pane${i === activeIndex ? " active" : ""}`;
            const childFragment = box$.methods.render(child.children);
            $pane.appendChild(childFragment);
            $content.appendChild($pane);
          }
        });

        const $panes = Array.from($content.querySelectorAll(`.${cls}-pane`));

        $bar.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          const tabs = Array.from($bar.querySelectorAll(`.${cls}-tab`));
          const idx = tabs.indexOf(target);
          if (idx >= 0) {
            tabs.forEach((t: any) => t.classList.remove("active"));
            target.classList.add("active");
            $panes.forEach((p: any) => p.classList.remove("active"));
            $panes[idx].classList.add("active");
            if (s.onChange) s.onChange(idx);
          }
        });
      }

      $elm.appendChild($bar);
      $elm.appendChild($content);

      box$.methods.setupEventListener(elm.events);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export type DOMTabPane = VNodeView<HTMLDivElement> & {
  t: "tab-pane";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
};

export function DOMTabPane(props: {
  build: (elm: TimelessElement) => VNodeView<HTMLDivElement>;
}): DOMTabPane {
  const box$ = HostElement({ $elm: null, t: "tab-pane", build: props.build });

  return {
    ...box$.methods,
    t: "tab-pane",
    getType() {
      return "view";
    },
    isDocumentFragment() {
      return false;
    },
    render(elm: TimelessElement) {
      const $elm = document.createElement("div");
      box$.methods.set$elm($elm);
      box$.methods.applyState(elm.state, { initial: true });

      const $fragment = box$.methods.render(elm.children);
      box$.methods.setupEventListener(elm.events);
      $elm.appendChild($fragment);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
  };
}

export function isDOMTabView(value: any): value is DOMTabView {
  return value?.t === "tab-view";
}

export function isDOMTabPane(value: any): value is DOMTabPane {
  return value?.t === "tab-pane";
}
