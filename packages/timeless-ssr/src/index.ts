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

function build(elm: TimelessElement): VNodeView<string> {
  if (elm.t === "show") return SSRShow({ build });
  if (elm.t === "match") return SSRMatch({ build });
  if (elm.t === "for") return SSRFor({ build });
  if (elm.t === "fragment") return SSRFragment({ build });
  if (elm.t === "view") return SSRView({ build });
  if (elm.t === "text") return SSRText({ build });
  if (elm.t === "row") return SSRRow({ build });
  if (elm.t === "button") return SSRButton({ build });
  if (elm.t === "link") return SSRLink({ build });
  if (elm.t === "input") return SSRInput({ build });
  if (elm.t === "checkbox") return SSRCheckbox({ build });
  if (elm.t === "img") return SSRImg({ build });
  if (elm.t === "label") return SSRLabel({ build });
  return SSRView({ build });
}

export function renderToString(elm: TimelessElement): string {
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
  return root$.render(elm);
}
