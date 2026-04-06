import { CanvasGrid } from "./grid";
import { CanvasView } from "./view";
import { CanvasText } from "./text";
import { CanvasImg } from "./img";
import { CanvasShow } from "./show";
import { CanvasFor } from "./for";

export type CanvasHostNode =
  | null
  | CanvasGrid
  | CanvasView
  | CanvasText
  | CanvasImg
  | CanvasShow
  | CanvasFor;
