import { type TimelessElement, VNodeView } from "@timeless/timeless";

import { DOMView } from "@/host/view";
import { DOMGrid } from "@/host/grid";
import { DOMText } from "@/host/text";
import { DOMShow } from "@/host/show";
import { DOMMatch } from "@/host/match";
import { DOMFor } from "@/host/for";
import { DOMFragment } from "@/host/fragment";
import { DOMLazyView } from "@/host/lazy-view";
import { DOMImg } from "@/host/img";
import { DOMIcon } from "@/host/icon";
import { DOMInput } from "@/host/input";
import { DOMButton } from "@/host/button";
import { DOMPortal } from "@/host/portal";
import { DOMPopper } from "@/host/popper";
import { DOMCheckbox } from "@/host/checkbox";
import { DOMRadio } from "@/host/radio";
import { DOMLabel } from "@/host/label";
import { DOMTextarea } from "@/host/textarea";
import { DOMFilePicker } from "@/host/file-picker";
import { DOMNumberInput } from "@/host/number-input";
import {
  DOMSelect,
  DOMSelectOption,
  DOMSelectOptionGroup,
} from "@/host/select";
import { DOMRow } from "@/host/row";
import { DOMColumn, DOMCol } from "@/host/column";
import { DOMLink } from "@/host/link";
import { DOMWebview } from "@/host/webview";
import { DOMSplitView, DOMSplitPane, DOMSplitHandler } from "@/host/split-view";
import { DOMScrollView } from "@/host/scroll-view";
import { DOMTabView, DOMTabPane } from "@/host/tab-view";
import { DOMStyle } from "@/host/style";
import { DOMListView } from "@/host/list-view";
import { DOMListItemView } from "@/host/list-item-view";
import { DOMSwitch } from "@/host/switch";
import { DOMWindow } from "@/host/window";
import {
  DOMSVG,
  DOMG,
  DOMCircle,
  DOMRect,
  DOMPath,
  DOMLine,
  DOMPolyline,
  DOMPolygon,
  DOMEllipse,
  DOMSVGText,
  DOMDefs,
  DOMSymbol,
  DOMUse,
  DOMLinearGradient,
  DOMRadialGradient,
  DOMStop,
  DOMMask,
  DOMClipPath,
} from "@/host/svg";

export function buildAndRender(elm: TimelessElement): {
  vnode: VNodeView<any>;
  dom: any;
} {
  const vnode = build(elm);
  const dom = vnode.render(elm);
  return { vnode, dom };
}

export function build(elm: TimelessElement): VNodeView<any> {
  if (elm.t === "view") {
    const view$ = DOMView({ build });
    elm.$elm = view$;
    return view$;
  }
  if (elm.t === "text") {
    const text$ = DOMText({ build });
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "label") {
    const label$ = DOMLabel({ build });
    elm.$elm = label$;
    return label$;
  }
  if (elm.t === "fragment") {
    const fragment$ = DOMFragment({ build });
    elm.$elm = fragment$;
    return fragment$;
  }
  if (elm.t === "lazy-view") {
    const lazyView$ = DOMLazyView({ build });
    elm.$elm = lazyView$;
    return lazyView$;
  }
  if (elm.t === "popper") {
    const popper$ = DOMPopper({ build });
    elm.$elm = popper$;
    return popper$;
  }
  if (elm.t === "style") {
    const style$ = DOMStyle({ build });
    elm.$elm = style$;
    return style$;
  }
  if (elm.t === "icon") {
    const icon$ = DOMIcon({ build });
    elm.$elm = icon$;
    return icon$;
  }
  if (elm.t === "img") {
    const img$ = DOMImg({ build });
    elm.$elm = img$;
    return img$;
  }
  if (elm.t === "list-view") {
    const listview$ = DOMListView({ build });
    elm.$elm = listview$;
    return listview$;
  }
  if (elm.t === "list-item-view") {
    const listitemview$ = DOMListItemView({ build });
    elm.$elm = listitemview$;
    return listitemview$;
  }
  if (elm.t === "webview") {
    const webview$ = DOMWebview({ build });
    elm.$elm = webview$;
    return webview$;
  }
  if (elm.t === "grid") {
    const grid$ = DOMGrid({ build });
    elm.$elm = grid$;
    return grid$;
  }
  if (elm.t === "row") {
    const row$ = DOMRow({ build });
    elm.$elm = row$;
    return row$;
  }
  if (elm.t === "window") {
    const window$ = DOMWindow({ build });
    elm.$elm = window$;
    return window$;
  }
  if (elm.t === "column") {
    const column$ = DOMColumn({ build });
    elm.$elm = column$;
    return column$;
  }
  if (elm.t === "col") {
    const col$ = DOMCol({ build });
    elm.$elm = col$;
    return col$;
  }
  if (elm.t === "input") {
    const input$ = DOMInput({ build });
    elm.$elm = input$;
    return input$;
  }
  if (elm.t === "switch") {
    const switch$ = DOMSwitch({ build });
    elm.$elm = switch$;
    return switch$;
  }
  if (elm.t === "file-picker") {
    const file_picker$ = DOMFilePicker({ build });
    elm.$elm = file_picker$;
    return file_picker$;
  }
  if (elm.t === "number-input") {
    const number_input$ = DOMNumberInput({ build });
    elm.$elm = number_input$;
    return number_input$;
  }
  if (elm.t === "textarea") {
    const textarea$ = DOMTextarea({ build });
    elm.$elm = textarea$;
    return textarea$;
  }
  if (elm.t === "checkbox") {
    const checkbox$ = DOMCheckbox({ build });
    elm.$elm = checkbox$;
    return checkbox$;
  }
  if (elm.t === "radio") {
    const radio$ = DOMRadio({ build });
    elm.$elm = radio$;
    return radio$;
  }
  if (elm.t === "select") {
    const select$ = DOMSelect({ build });
    elm.$elm = select$;
    return select$;
  }
  if (elm.t === "select-option") {
    const option$ = DOMSelectOption({ build });
    elm.$elm = option$;
    return option$;
  }
  if (elm.t === "select-option-group") {
    const group$ = DOMSelectOptionGroup({ build });
    elm.$elm = group$;
    return group$;
  }
  if (elm.t === "button") {
    const button$ = DOMButton({ build });
    elm.$elm = button$;
    return button$;
  }
  if (elm.t === "link") {
    const link$ = DOMLink({ build });
    elm.$elm = link$;
    return link$;
  }
  if (elm.t === "portal") {
    const portal$ = DOMPortal({ build });
    elm.$elm = portal$;
    return portal$;
  }
  if (elm.t === "show") {
    const show$ = DOMShow({ build });
    elm.$elm = show$;
    return show$;
  }
  if (elm.t === "match") {
    const match$ = DOMMatch({ build });
    elm.$elm = match$;
    return match$;
  }
  if (elm.t === "for") {
    const for$ = DOMFor({ build });
    elm.$elm = for$;
    return for$;
  }
  if (elm.t === "split-view") {
    const splitView$ = DOMSplitView({ build });
    elm.$elm = splitView$;
    return splitView$;
  }
  if (elm.t === "split-pane") {
    const pane$ = DOMSplitPane({ build });
    elm.$elm = pane$;
    return pane$;
  }
  if (elm.t === "split-handler") {
    const handler$ = DOMSplitHandler({ build });
    elm.$elm = handler$;
    return handler$;
  }
  if (elm.t === "scroll-view") {
    const scrollView$ = DOMScrollView({ build });
    elm.$elm = scrollView$;
    return scrollView$;
  }
  if (elm.t === "tab-view") {
    const tabView$ = DOMTabView({ build });
    elm.$elm = tabView$;
    return tabView$;
  }
  if (elm.t === "tab-pane") {
    const tabPane$ = DOMTabPane({ build });
    elm.$elm = tabPane$;
    return tabPane$;
  }
  if (elm.t === "svg-svg") {
    const svg$ = DOMSVG({ build });
    elm.$elm = svg$;
    return svg$;
  }
  if (elm.t === "svg-g") {
    const g$ = DOMG({ build });
    elm.$elm = g$;
    return g$;
  }
  if (elm.t === "svg-circle") {
    const circle$ = DOMCircle({ build });
    elm.$elm = circle$;
    return circle$;
  }
  if (elm.t === "svg-rect") {
    const rect$ = DOMRect({ build });
    elm.$elm = rect$;
    return rect$;
  }
  if (elm.t === "svg-path") {
    const path$ = DOMPath({ build });
    elm.$elm = path$;
    return path$;
  }
  if (elm.t === "svg-line") {
    const line$ = DOMLine({ build });
    elm.$elm = line$;
    return line$;
  }
  if (elm.t === "svg-polyline") {
    const polyline$ = DOMPolyline({ build });
    elm.$elm = polyline$;
    return polyline$;
  }
  if (elm.t === "svg-polygon") {
    const polygon$ = DOMPolygon({ build });
    elm.$elm = polygon$;
    return polygon$;
  }
  if (elm.t === "svg-ellipse") {
    const ellipse$ = DOMEllipse({ build });
    elm.$elm = ellipse$;
    return ellipse$;
  }
  if (elm.t === "svg-text") {
    const text$ = DOMSVGText({ build });
    elm.$elm = text$;
    return text$;
  }
  if (elm.t === "svg-defs") {
    const defs$ = DOMDefs({ build });
    elm.$elm = defs$;
    return defs$;
  }
  if (elm.t === "svg-symbol") {
    const symbol$ = DOMSymbol({ build });
    elm.$elm = symbol$;
    return symbol$;
  }
  if (elm.t === "svg-use") {
    const use$ = DOMUse({ build });
    elm.$elm = use$;
    return use$;
  }
  if (elm.t === "svg-linear-gradient") {
    const linearGradient$ = DOMLinearGradient({ build });
    elm.$elm = linearGradient$;
    return linearGradient$;
  }
  if (elm.t === "svg-radial-gradient") {
    const radialGradient$ = DOMRadialGradient({ build });
    elm.$elm = radialGradient$;
    return radialGradient$;
  }
  if (elm.t === "svg-stop") {
    const stop$ = DOMStop({ build });
    elm.$elm = stop$;
    return stop$;
  }
  if (elm.t === "svg-mask") {
    const mask$ = DOMMask({ build });
    elm.$elm = mask$;
    return mask$;
  }
  if (elm.t === "svg-clippath") {
    const clipPath$ = DOMClipPath({ build });
    elm.$elm = clipPath$;
    return clipPath$;
  }
  return DOMView({ build });
}
