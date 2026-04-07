import { DOMGrid } from "./grid";
import { DOMView } from "./view";
import { DOMText } from "./text";
import { DOMFragment } from "./fragment";
import { DOMImg } from "./img";
import { DOMIcon } from "./icon";

import { DOMInput } from "./input";

import { DOMButton } from "./button";
import { DOMPortal } from "./portal";

import { DOMShow } from "./show";
import { DOMFor } from "./for";

export type DOMHostNode =
  | null
  | DOMGrid
  | DOMFragment
  | DOMView
  | DOMText
  | DOMImg
  | DOMIcon
  | DOMInput
  | DOMButton
  | DOMPortal
  | DOMShow
  | DOMFor;
