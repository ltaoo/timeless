import {
  createTuiElement,
  createTuiText,
  createTuiFragment,
  renderToString,
  renderToScreen,
  clearScreen,
  showCursor,
  hideCursor,
  getTerminalSize,
  ESC,
  RESET,
  fgColor,
  bgColor,
  moveTo,
} from "@timeless/timeless-tui";

const BOLD = `${ESC}1m`;
const DIM = `${ESC}2m`;
const UNDERLINE = `${ESC}4m`;
const CYAN = fgColor(51);
const GREEN = fgColor(46);
const YELLOW = fgColor(226);
const MAGENTA = fgColor(201);
const WHITE = fgColor(255);
const GRAY = fgColor(245);

function hr(width) {
  return GRAY + "─".repeat(width) + RESET;
}

function heading(text) {
  return CYAN + BOLD + " " + text + RESET;
}

function label(key, value) {
  return "  " + GRAY + key + ": " + RESET + WHITE + value + RESET;
}

function tag(text, color) {
  return color + BOLD + " " + text + " " + RESET;
}

function buildSidebar(width) {
  const lines = [];
  lines.push(BOLD + UNDERLINE + " Timeless TUI" + RESET);
  lines.push("");
  lines.push(GREEN + "● Online" + RESET + GRAY + "  v0.1.0" + RESET);
  lines.push("");
  lines.push(hr(width));
  lines.push("");
  lines.push(heading("Navigation"));
  lines.push("");
  lines.push(CYAN + " ▸ " + RESET + "Dashboard");
  lines.push(GRAY + "   Components" + RESET);
  lines.push(GRAY + "   Settings" + RESET);
  lines.push(GRAY + "   About" + RESET);
  lines.push("");
  lines.push(hr(width));
  lines.push("");
  lines.push(heading("Status"));
  lines.push("");
  lines.push(label("Host", "tui"));
  lines.push(label("Size", `${width}x${getTerminalSize().height}`));
  lines.push("");
  return lines;
}

function buildContent(width) {
  const lines = [];
  lines.push(BOLD + " TUI Demo" + RESET);
  lines.push("");
  lines.push(" Welcome to " + CYAN + BOLD + "Timeless TUI" + RESET + "!");
  lines.push(" A terminal UI library powered by the");
  lines.push(" Timeless headless host system.");
  lines.push("");
  lines.push(hr(width));
  lines.push("");
  lines.push(heading("Features"));
  lines.push("");
  lines.push(" " + tag("Tree", CYAN) + "  Virtual node tree");
  lines.push(" " + tag("ANSI", GREEN) + "  Terminal rendering");
  lines.push(" " + tag("Host", YELLOW) + "  HeadlessHost impl");
  lines.push(" " + tag("Node", MAGENTA) + "  Element / Text / Fragment");
  lines.push("");
  lines.push(hr(width));
  lines.push("");
  lines.push(heading("Rendering Modes"));
  lines.push("");
  lines.push(
    " " +
      GRAY +
      "1." +
      RESET +
      " renderToString()  " +
      DIM +
      "→ string output" +
      RESET,
  );
  lines.push(
    " " +
      GRAY +
      "2." +
      RESET +
      " renderToScreen()  " +
      DIM +
      "→ direct write" +
      RESET,
  );
  lines.push(
    " " +
      GRAY +
      "3." +
      RESET +
      " Buffer API        " +
      DIM +
      "→ cell buffer" +
      RESET,
  );
  lines.push("");
  lines.push(hr(width));
  lines.push("");
  lines.push(heading("ANSI Escape Codes"));
  lines.push("");
  lines.push(
    " " +
      fgColor(196) +
      "■ red" +
      RESET +
      " " +
      fgColor(46) +
      "■ green" +
      RESET +
      " " +
      fgColor(21) +
      "■ blue" +
      RESET +
      " " +
      fgColor(226) +
      "■ yellow" +
      RESET,
  );
  lines.push(
    " " +
      fgColor(201) +
      "■ magenta" +
      RESET +
      " " +
      CYAN +
      "■ cyan" +
      RESET +
      " " +
      WHITE +
      "■ white" +
      RESET +
      " " +
      GRAY +
      "■ gray" +
      RESET,
  );
  lines.push("");
  lines.push(hr(width));
  lines.push("");
  lines.push(heading("Node Tree (renderToString)"));
  lines.push("");
  lines.push(DIM + " fragment" + RESET);
  lines.push(DIM + " ├─ element(box)" + RESET);
  lines.push(DIM + ' │  ├─ text("hello")' + RESET);
  lines.push(DIM + " │  └─ element(span)" + RESET);
  lines.push(DIM + ' │     └─ text("world")' + RESET);
  lines.push(DIM + " └─ element(box)" + RESET);
  lines.push(DIM + '    └─ text("!")' + RESET);
  lines.push("");

  const frag = buildDemoTree();
  lines.push(heading("renderToString Output"));
  lines.push("");
  lines.push("  " + renderToString(frag));
  lines.push("");

  lines.push(hr(width));
  lines.push("");
  lines.push(GRAY + " Press Ctrl+C to exit" + RESET);
  return lines;
}

function buildDemoTree() {
  const frag = createTuiFragment();

  const box1 = createTuiElement("box");
  box1.setAttribute("prefix", CYAN + "┌─ ");
  box1.setAttribute("suffix", RESET + " ─┐");

  const hello = createTuiText(BOLD + "Hello" + RESET);
  const world = createTuiElement("span");
  world.setAttribute("prefix", GREEN);
  world.setAttribute("suffix", RESET);
  const worldText = createTuiText("World");
  world.appendChild(worldText);

  box1.appendChild(hello);
  box1.appendChild(world);
  frag.appendChild(box1);

  const box2 = createTuiElement("box");
  box2.setAttribute("prefix", YELLOW + "╰─ ");
  box2.setAttribute("suffix", RESET + " ─╯");
  const excl = createTuiText("!");
  box2.appendChild(excl);
  frag.appendChild(box2);

  return frag;
}

function renderApp() {
  const { width } = getTerminalSize();
  const sidebarWidth = 22;
  const contentWidth = width - sidebarWidth - 3;
  const minWidth = 40;

  if (width < minWidth) {
    const lines = buildContent(width);
    process.stdout.write(lines.join("\n") + "\n");
    return;
  }

  const sidebarLines = buildSidebar(sidebarWidth);
  const contentLines = buildContent(contentWidth);

  const maxLines = Math.max(sidebarLines.length, contentLines.length);
  const output = [];

  for (let i = 0; i < maxLines; i++) {
    const left = sidebarLines[i] ?? "";
    const right = contentLines[i] ?? "";
    output.push(
      moveTo(i, 0) +
        left +
        moveTo(i, sidebarWidth) +
        GRAY +
        "│" +
        RESET +
        " " +
        right,
    );
  }

  hideCursor(process.stdout);
  clearScreen(process.stdout);
  process.stdout.write(output.join(""));
  process.stdout.write(moveTo(maxLines, 0));
}

function main() {
  renderApp();

  process.on("SIGINT", () => {
    showCursor(process.stdout);
    clearScreen(process.stdout);
    process.exit(0);
  });

  process.stdout.on("resize", () => {
    renderApp();
  });
}

main();
