import { renderTwoColumns } from "./components/layout.js";
import { renderHome } from "./pages/home/index.js";

function getTerminalWidth() {
  const w = Number(process.stdout.columns);
  return Number.isFinite(w) && w > 0 ? w : 80;
}

function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function renderApp() {
  const totalWidth = getTerminalWidth();
  const minRightWidth = 30;
  const defaultLeftWidth = 24;
  const separatorWidth = 1;
  const gap = 1;

  const leftWidth = Math.min(
    defaultLeftWidth,
    Math.max(18, totalWidth - (minRightWidth + separatorWidth + gap * 2)),
  );
  const rightWidth = totalWidth - (leftWidth + separatorWidth + gap * 2);

  const { sidebar, content } = renderHome({ rightWidth });

  if (rightWidth < minRightWidth) {
    return [...sidebar, "", ...content].join("\n");
  }

  return renderTwoColumns({
    leftWidth,
    rightWidth,
    leftLines: sidebar,
    rightLines: content,
    separator: "│",
    gap,
  });
}

clearScreen();
process.stdout.write(renderApp());
process.stdout.write("\n");

