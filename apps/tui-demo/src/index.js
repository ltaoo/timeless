import { View, ref } from "@timeless/timeless";
import { render, TUI, GridLayout, GridItem } from "@timeless/timeless-tui";

// ─── Data ───────────────────────────────────────────────────────
const apps = [
  { icon: "\u{1F3AC}", title: "Movies", subtitle: "Movies & Shows" },
  { icon: "\u{1F3B5}", title: "Music", subtitle: "Your Favorites" },
  { icon: "\u{1F4F7}", title: "Photos", subtitle: "Photo Library" },
  { icon: "\u{1F4E1}", title: "Live TV", subtitle: "200+ Channels" },
  { icon: "\u{1F3AE}", title: "Games", subtitle: "Play & Compete" },
  { icon: "\u2699\uFE0F", title: "Settings", subtitle: "Preferences" },
  { icon: "\u26C5", title: "Weather", subtitle: "5-Day Forecast" },
  { icon: "\u{1F6D2}", title: "Store", subtitle: "Discover Apps" },
  { icon: "\u{1F4AA}", title: "Fitness", subtitle: "Track Workouts" },
  { icon: "\u{1F4F0}", title: "News", subtitle: "Headlines" },
  { icon: "\u{1F9F8}", title: "Kids", subtitle: "Family Friendly" },
  { icon: "\u{1F310}", title: "Browser", subtitle: "Surf the Web" },
];

// ─── State ──────────────────────────────────────────────────────
const focus = ref(0);

// ─── App ────────────────────────────────────────────────────────
const app = render(() => {
  TUI.onKeydown((key) => {
    if (key === "q") {
      TUI.exit();
    }
  });
  // Use pre-built GridItem array instead of For
  const gridItems = apps.map((app, idx) =>
    GridItem({ width: 16 }, [
      View({ style: "color: blue; font-weight: bold" }, [app.icon]),
      View({ style: "color: white" }, [app.title]),
      View({ style: "color: gray" }, [app.subtitle]),
    ]),
  );
  return GridLayout({ x: 4, focus }, gridItems);
});

app.start();
