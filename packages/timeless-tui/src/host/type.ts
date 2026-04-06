import { TuiGrid } from "./grid";
import { TuiView } from "./view";
import { TuiText } from "./text";
import { TuiShow } from "./show";
import { TuiFor } from "./for";

export type TuiHostNode = null | TuiGrid | TuiView | TuiText | TuiShow | TuiFor;
