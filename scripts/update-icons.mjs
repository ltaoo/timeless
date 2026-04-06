import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, "..");
const ICONS_DIR = join(rootDir, "packages/icons/src/icons");
const ASN_DIR = join(rootDir, "packages/svg/src/asn");

const iconNameMap = {
  "arrow-down-to-line": "ArrowDownToLine",
  bolt: "Bolt",
  calendar: "Calendar",
  check: "Check",
  "chevron-down": "ChevronDown",
  "chevron-left": "ChevronLeft",
  "chevron-right": "ChevronRight",
  "chevron-up": "ChevronUp",
  "circle-arrow-down": "CircleArrowDown",
  "circle-ellipsis": "CircleEllipsis",
  "circle-x": "CircleX",
  "clock-arrow-down": "ClockArrowDown",
  clock: "Clock",
  "cloud-download": "CloudDownload",
  download: "Download",
  "ellipsis-vertical": "EllipsisVertical",
  ellipsis: "Ellipsis",
  "file-box": "FileBox",
  "file-image": "FileImage",
  "file-lock": "FileLock",
  "file-play": "FilePlay",
  "file-symlink": "FileSymlink",
  "file-video-camera": "FileVideoCamera",
  "file-volume": "FileVolume",
  file: "File",
  "folder-closed": "FolderClosed",
  folder: "Folder",
  "git-fork": "GitFork",
  "grid-3x3": "Grid3x3",
  house: "House",
  "loader-circle": "LoaderCircle",
  loader: "Loader",
  menu: "Menu",
  moon: "Moon",
  pause: "Pause",
  play: "Play",
  plus: "Plus",
  "refresh-ccw": "RefreshCcw",
  rss: "Rss",
  search: "Search",
  "square-arrow-down": "SquareArrowDown",
  sun: "Sun",
  "trash-2": "Trash2",
  trash: "Trash",
  "undo-2": "Undo2",
  x: "X",
};

const files = readdirSync(ICONS_DIR);
for (const file of files) {
  if (!file.endsWith(".ts")) continue;

  const name = file.replace(".ts", "");
  const pascalName = iconNameMap[name];
  if (!pascalName) {
    console.log(`Skipping: ${name}`);
    continue;
  }

  const content = `import { createIcon } from "../util/index";
import ${pascalName}Asn from "@timeless/svg/asn/${name}";

export const ${pascalName}Outlined = createIcon(${pascalName}Asn);
`;

  const filePath = join(ICONS_DIR, file);
  writeFileSync(filePath, content);
  console.log(`Updated: ${file}`);
}
