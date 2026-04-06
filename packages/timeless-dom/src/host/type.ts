import { DOMGrid } from "./grid";
import { DOMView } from "./view";
import { DOMText } from "./text";
import { DOMFragment } from "./fragment";
import { DOMImg } from "./img";

import { DOMShow } from "./show";
import { DOMFor } from "./for";

export type DOMHostNode =
  | null
  | DOMGrid
  | DOMFragment
  | DOMView
  | DOMText
  | DOMImg
  | DOMShow
  | DOMFor;
