import {
  render,
  ref,
  GridLayout,
  GridItem,
  View,
  BOLD,
  WHITE,
  RED,
  GREEN,
  BLUE,
  YELLOW,
  CYAN,
  MAGENTA,
  ORANGE,
  GRAY,
  DGRAY,
} from "@timeless/timeless-tui";

// ─── Data ───────────────────────────────────────────────────────
const APPS = [
  GridItem({ width: 16 }, [
    View({ color: RED, style: BOLD }, ["\u{1F3AC}"]),
    View({ color: WHITE }, ["Movies"]),
    View({ color: DGRAY }, ["Movies & Shows"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: MAGENTA, style: BOLD }, ["\u{1F3B5}"]),
    View({ color: WHITE }, ["Music"]),
    View({ color: DGRAY }, ["Your Favorites"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: GREEN, style: BOLD }, ["\u{1F4F7}"]),
    View({ color: WHITE }, ["Photos"]),
    View({ color: DGRAY }, ["Photo Library"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: ORANGE, style: BOLD }, ["\u{1F4E1}"]),
    View({ color: WHITE }, ["Live TV"]),
    View({ color: DGRAY }, ["200+ Channels"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: BLUE, style: BOLD }, ["\u{1F3AE}"]),
    View({ color: WHITE }, ["Games"]),
    View({ color: DGRAY }, ["Play & Compete"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: GRAY, style: BOLD }, ["\u2699\uFE0F"]),
    View({ color: WHITE }, ["Settings"]),
    View({ color: DGRAY }, ["Preferences"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: CYAN, style: BOLD }, ["\u26C5"]),
    View({ color: WHITE }, ["Weather"]),
    View({ color: DGRAY }, ["5-Day Forecast"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: YELLOW, style: BOLD }, ["\u{1F6D2}"]),
    View({ color: WHITE }, ["Store"]),
    View({ color: DGRAY }, ["Discover Apps"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: GREEN, style: BOLD }, ["\u{1F4AA}"]),
    View({ color: WHITE }, ["Fitness"]),
    View({ color: DGRAY }, ["Track Workouts"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: WHITE, style: BOLD }, ["\u{1F4F0}"]),
    View({ color: WHITE }, ["News"]),
    View({ color: DGRAY }, ["Headlines"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: MAGENTA, style: BOLD }, ["\u{1F9F8}"]),
    View({ color: WHITE }, ["Kids"]),
    View({ color: DGRAY }, ["Family Friendly"]),
  ]),
  GridItem({ width: 16 }, [
    View({ color: BLUE, style: BOLD }, ["\u{1F310}"]),
    View({ color: WHITE }, ["Browser"]),
    View({ color: DGRAY }, ["Surf the Web"]),
  ]),
];

const COLS = 4;

// ─── State ──────────────────────────────────────────────────────
const focR = ref(0);
const focC = ref(0);

// ─── App ────────────────────────────────────────────────────────
const app = render((reactive) => {
  reactive(focR, focC);
  const focIdx = focR.value * COLS + focC.value;
  return GridLayout({ x: COLS, focus: focIdx }, APPS);
});

// ─── Keys ───────────────────────────────────────────────────────
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const maxR = () => Math.ceil(APPS.length / COLS) - 1;

app.onKey((key) => {
  switch (key) {
    case "left":
      focC.value = clamp(focC.value - 1, 0, COLS - 1);
      break;
    case "right":
      focC.value = clamp(focC.value + 1, 0, COLS - 1);
      break;
    case "up":
      focR.value = clamp(focR.value - 1, 0, maxR());
      break;
    case "down":
      focR.value = clamp(focR.value + 1, 0, maxR());
      break;
  }
});

// ─── Start ──────────────────────────────────────────────────────
app.start();
