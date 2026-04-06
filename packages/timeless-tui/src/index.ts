export {
  createBuffer,
  clearBuffer,
  writeToBuffer,
  renderTree,
  renderToScreen,
  renderToString,
  clearScreen,
  showCursor,
  hideCursor,
  getTerminalSize,
  CLEAR_SCREEN,
  CURSOR_HOME,
  HIDE_CURSOR,
  SHOW_CURSOR,
  moveTo,
  type Buffer,
} from "./host/draw";

export {
  createTuiInput,
  parseKey,
  listenKeys,
  type TuiInput,
  type KeyHandler,
  type KeyName,
} from "./modules/input";

export {
  createTuiHost,
  installTuiHost,
  render,
  renderToStringTree,
  platform,
} from "./host";

export { TUI, type TuiGlobal } from "./host/draw";

export {
  createTuiApp,
  useReactive,
  ref,
  type TuiApp,
  type TuiRenderFn,
  type Ref,
} from "./app";

// export { TuiGrid, TuiView, TuiTxt } from "./modules/grid";
