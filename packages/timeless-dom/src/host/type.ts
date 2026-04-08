import { DOMGrid } from "./grid";
import { DOMView } from "./view";
import { DOMText } from "./text";
import { DOMFragment } from "./fragment";
import { DOMLazyView } from "./lazy-view";
import { DOMImg } from "./img";
import { DOMIcon } from "./icon";

import { DOMInput } from "./input";
import { DOMCheckbox } from "./checkbox";

import { DOMButton } from "./button";
import { DOMPortal } from "./portal";
import { DOMPopper } from "./popper";

import { DOMShow } from "./show";
import { DOMFor } from "./for";

export type DOMHostNode =
  | null
  | DOMGrid
  | DOMFragment
  | DOMLazyView
  | DOMView
  | DOMText
  | DOMImg
  | DOMIcon
  | DOMInput
  | DOMCheckbox
  | DOMButton
  | DOMPortal
  | DOMShow
  | DOMFor;
