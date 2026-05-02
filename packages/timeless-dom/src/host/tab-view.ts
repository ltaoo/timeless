import { TimelessElement, VNodeView } from "@timeless/timeless";

import { HostElement } from "./box";

let _tabSeq = 0;

export type DOMTabView = VNodeView<HTMLDivElement> & {
  t: "tab-view";
  render(elm: TimelessElement): HTMLDivElement;
  hydrate(elm: TimelessElement, $dom: HTMLDivElement): void;
  switchPanel(children: TimelessElement[], options: { from: number; to: number }): void;
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
  let $contents: any = null;
  let $track: any = null;
  let _animating = false;
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

      $elm.setAttribute("data-tab-view", "");
      $elm.style.height = "100%";

      // let tabBarStyle = "display:flex;";
      // if (position === "top" || position === "bottom") {
      //   tabBarStyle += "flex-direction:row;";
      // } else {
      //   tabBarStyle += "flex-direction:column;";
      // }

      const $tabs = document.createElement("div");
      $tabs.setAttribute("data-tab-view-tabs", "");
      $tabs.style.cssText = "display: flex;";
      if (elm.state.tabs) {
        const $tab_fragment = document.createDocumentFragment();
        for (let i = 0; i < elm.state.tabs.length; i += 1) {
          const t = elm.state.tabs[i];
          const $tab = document.createElement("div");
          $tab.setAttribute("data-tab-view-tab", t.tab);
          $tab.addEventListener("click", function (event) {
            elm.handleClickTab(t);
          });

          $tab.innerText = t.label;
          $tab_fragment.appendChild($tab);
        }
        $tabs.appendChild($tab_fragment);
      }

      $contents = document.createElement("div");
      $contents.setAttribute("data-tab-view-panels", "");
      $contents.style.cssText = "width: 100%; height: 100%; overflow: hidden;";

      $track = document.createElement("div");
      $track.setAttribute("data-tab-view-track", "");
      $track.style.cssText = "display: flex; width: 100%; height: 100%; transition: transform 0.3s ease;";

      const $content = document.createElement("div");
      $content.setAttribute("data-tab-view-panel", "");
      $content.style.cssText = "flex-shrink: 0; width: 100%; height: 100%;";

      const $fragment = box$.methods.render(elm.children);
      $content.appendChild($fragment);

      $track.appendChild($content);
      $contents.appendChild($track);

      //   $bar.addEventListener("click", (e) => {
      //     const target = e.target as HTMLElement;
      //     const tabs = Array.from($bar.querySelectorAll(`.${cls}-tab`));
      //     const idx = tabs.indexOf(target);
      //     if (idx >= 0) {
      //       tabs.forEach((t: any) => t.classList.remove("active"));
      //       target.classList.add("active");
      //       $panes.forEach((p: any) => p.classList.remove("active"));
      //       $panes[idx].classList.add("active");
      //       if (s.onChange) s.onChange(idx);
      //     }
      //   });
      // }

      $elm.appendChild($tabs);
      $elm.appendChild($contents);

      box$.methods.setupEventListener(elm.events);

      return $elm;
    },
    hydrate(elm: TimelessElement, $elm: HTMLDivElement) {
      box$.methods.set$elm($elm);
      box$.methods.setupEventListener(elm.events);
    },
    switchPanel(children: TimelessElement[], options: { from: number; to: number }) {
      if (_animating) {
        return;
      }
      const forward = options.to > options.from;

      const $content = document.createElement("div");
      $content.setAttribute("data-tab-view-panel", "");
      $content.style.cssText = "flex-shrink: 0; width: 100%; height: 100%;";

      const $fragment = box$.methods.render(children);
      $content.appendChild($fragment);

      _animating = true;

      const onTransitionEnd = () => {
        $track.removeEventListener("transitionend", onTransitionEnd);
        if (forward) {
          $track.removeChild($track.firstChild!);
        } else {
          $track.removeChild($track.lastChild!);
        }
        $track.style.transition = "none";
        $track.style.transform = "translateX(0%)";
        $track.offsetWidth;
        $track.style.transition = "transform 0.3s ease";
        _animating = false;
      };

      $track.addEventListener("transitionend", onTransitionEnd);

      if (forward) {
        $track.appendChild($content);
        requestAnimationFrame(() => {
          $track.style.transform = "translateX(-100%)";
        });
      } else {
        $track.insertBefore($content, $track.firstChild);
        $track.style.transition = "none";
        $track.style.transform = "translateX(-100%)";
        $track.offsetWidth;
        $track.style.transition = "transform 0.3s ease";
        requestAnimationFrame(() => {
          $track.style.transform = "translateX(0%)";
        });
      }
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
