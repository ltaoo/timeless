import { View, For, ref, combine } from "@timeless/timeless";
import { render, TUI, GridLayout, GridItem } from "@timeless/timeless-tui";

// ─── Data ───────────────────────────────────────────────────────
const APPS = [
  GridItem({ width: 16 }, [
    View({ style: "color: red; font-weight: bold" }, ["\u{1F3AC}"]),
    View({ style: "color: white" }, ["Movies"]),
    View({ style: "color: gray" }, ["Movies & Shows"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: magenta; font-weight: bold" }, ["\u{1F3B5}"]),
    View({ style: "color: white" }, ["Music"]),
    View({ style: "color: gray" }, ["Your Favorites"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: green; font-weight: bold" }, ["\u{1F4F7}"]),
    View({ style: "color: white" }, ["Photos"]),
    View({ style: "color: gray" }, ["Photo Library"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: orange; font-weight: bold" }, ["\u{1F4E1}"]),
    View({ style: "color: white" }, ["Live TV"]),
    View({ style: "color: gray" }, ["200+ Channels"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: blue; font-weight: bold" }, ["\u{1F3AE}"]),
    View({ style: "color: white" }, ["Games"]),
    View({ style: "color: gray" }, ["Play & Compete"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: gray; font-weight: bold" }, ["\u2699\uFE0F"]),
    View({ style: "color: white" }, ["Settings"]),
    View({ style: "color: gray" }, ["Preferences"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: cyan; font-weight: bold" }, ["\u26C5"]),
    View({ style: "color: white" }, ["Weather"]),
    View({ style: "color: gray" }, ["5-Day Forecast"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: yellow; font-weight: bold" }, ["\u{1F6D2}"]),
    View({ style: "color: white" }, ["Store"]),
    View({ style: "color: gray" }, ["Discover Apps"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: green; font-weight: bold" }, ["\u{1F4AA}"]),
    View({ style: "color: white" }, ["Fitness"]),
    View({ style: "color: gray" }, ["Track Workouts"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: white; font-weight: bold" }, ["\u{1F4F0}"]),
    View({ style: "color: white" }, ["News"]),
    View({ style: "color: gray" }, ["Headlines"]),
  ]),
  GridItem({ width: 16 }, [
    View({ style: "color: magenta; font-weight: bold" }, ["\u{1F9F8}"]),
    View({ style: "color: white" }, ["Kids"]),
    View({ style: "color: gray" }, ["Family Friendly"]),
  ]),
  ,
];

const apps = [
  {
    icon: "\u{1F3AC}",
    title: "Movies",
    subtitle: "Movies & Shows",
  },
  {
    icon: "\u{1F3B5}",
    title: "Music",
    subtitle: "Your Favorites",
  },
  {
    icon: "\u{1F310}",
    title: "Browser",
    subtitle: "Surf the Web",
  },
];

// ─── State ──────────────────────────────────────────────────────
const focus = ref(0);

// ─── App ────────────────────────────────────────────────────────
const app = render(() => {
  TUI.onKeydown((key) => {
    if (key === "q") {
      TUI.exit();
    }
    if (key === "left") {
      focus.as((prev) => {
        return Math.max(0, prev - 1);
      });
    }
    if (key === "right") {
      focus.as((prev) => {
        return Math.min(apps.length - 1, prev + 1);
      });
    }
  });
  return GridLayout({ x: 4 }, [
    For({
      each: apps,
      render(app, idx) {
        return GridItem(
          {
            width: 16,
            style: combine({ focus, idx }, (t) => {
              return t.idx === t.focus ? "color: red" : "";
            }),
          },
          [
            View({ style: "color: blue; font-weight: bold" }, [app.icon]),
            View({ style: "color: white" }, [app.title]),
            View({ style: "color: gray" }, [app.subtitle]),
          ],
        );
      },
    }),
  ]);
});

app.start();
