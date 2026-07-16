import { TimelessElement, VNodeView, isElement } from "@timeless/timeless";

import pkg from "../package.json";

console.log("timeless.ssr version " + pkg.version);

import { SSRView } from "./host/view";
import { SSRText } from "./host/text";
import { SSRFragment } from "./host/fragment";
import { SSRShow } from "./host/show";
import { SSRMatch } from "./host/match";
import { SSRFor } from "./host/for";
import { SSRImg } from "./host/img";
import { SSRLabel } from "./host/label";
import { SSRButton } from "./host/button";
import { SSRInput } from "./host/input";
import { SSRCheckbox } from "./host/checkbox";
import { SSRRow } from "./host/row";
import { SSRLink } from "./host/link";
import { SSRPortal } from "./host/portal";

// Portal collector — SSRPortal pushes rendered HTML here
let _portalContents: string[] = [];

export function _collectPortal(html: string) {
  _portalContents.push(html);
}

export function getPortalContent(): string {
  return _portalContents.map((html, i) => html).join("");
}

function build(elm: TimelessElement): VNodeView<string> {
  if (elm.t === "show") return SSRShow({ build, elm });
  if (elm.t === "match") return SSRMatch({ build, elm });
  if (elm.t === "for") return SSRFor({ build, elm });
  if (elm.t === "fragment") return SSRFragment({ build, elm });
  if (elm.t === "portal") return SSRPortal({ build, elm });
  if (elm.t === "view") return SSRView({ build, elm });
  if (elm.t === "text") return SSRText({ build, elm });
  if (elm.t === "row") return SSRRow({ build, elm });
  if (elm.t === "button") return SSRButton({ build, elm });
  if (elm.t === "link") return SSRLink({ build, elm });
  if (elm.t === "input") return SSRInput({ build, elm });
  if (elm.t === "checkbox") return SSRCheckbox({ build, elm });
  if (elm.t === "img") return SSRImg({ build, elm });
  if (elm.t === "label") return SSRLabel({ build, elm });
  return SSRView({ build, elm });
}

export function renderToString(elm: TimelessElement): string {
  _portalContents = [];
  if (!elm) return "";
  if (!isElement(elm)) {
    console.error("[SSR] Root Element can't be lazy element");
    return "";
  }
  // console.log("render to string");
  function print(elm: TimelessElement) {
    // console.log("elm.t", elm.t, elm.state, elm.children?.length);
    if (elm.children) {
      for (let i = 0; i < elm.children.length; i += 1) {
        const child = elm.children[i];
        if (isElement(child)) {
          print(child);
        }
      }
    }
  }
  // print(elm);
  const root$ = build(elm);
  if (!root$) return "";
  return root$.render();
}
