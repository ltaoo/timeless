import { DOMGrid } from "./grid";
import { DOMView } from "./view";
import { DOMText } from "./text";
import { DOMShow } from "./show";
import { DOMFor } from "./for";

export type DOMHostNode = null | DOMGrid | DOMView | DOMText | DOMShow | DOMFor;
