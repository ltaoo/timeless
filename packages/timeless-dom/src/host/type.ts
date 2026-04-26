import { DOMGrid } from "./grid";
import { DOMView } from "./view";
import { DOMText } from "./text";
import { DOMLabel } from "./label";
import { DOMFragment } from "./fragment";
import { DOMLazyView } from "./lazy-view";
import { DOMImg } from "./img";
import { DOMIcon } from "./icon";

import { DOMInput } from "./input";
import { DOMFilePicker } from "./file-picker";
import { DOMTextarea } from "./textarea";
import { DOMCheckbox } from "./checkbox";
import { DOMRadio } from "./radio";
import { DOMNumberInput } from "./number-input";

import { DOMButton } from "./button";
import { DOMPortal } from "./portal";
import { DOMPopper } from "./popper";

import { DOMShow } from "./show";
import { DOMMatch } from "./match";
import { DOMFor } from "./for";
import { DOMSelect } from "./select";
import { DOMLink } from "./link";
import { DOMWebview } from "./webview";
import { DOMListView } from "./list-view";
import { DOMListItemView } from "./list-item-view";

export type DOMHostNode =
  | null
  | DOMGrid
  | DOMFragment
  | DOMLazyView
  | DOMView
  | DOMText
  | DOMLabel
  | DOMImg
  | DOMIcon
  | DOMWebview
  | DOMInput
  | DOMTextarea
  | DOMFilePicker
  | DOMListView
  | DOMListItemView
  | DOMNumberInput
  | DOMCheckbox
  | DOMRadio
  | DOMSelect
  | DOMButton
  | DOMLink
  | DOMPortal
  | DOMShow
  | DOMMatch
  | DOMFor;
