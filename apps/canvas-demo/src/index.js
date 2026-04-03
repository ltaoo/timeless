import { Grid, View, Txt, VNode, ref, combine } from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-canvas";

const { h } = VNode;

const apps = [
  { icon: "🎬", title: "Movies", subtitle: "Movies & Shows" },
  { icon: "🎵", title: "Music", subtitle: "Your Favorites" },
  { icon: "📷", title: "Photos", subtitle: "Photo Library" },
  { icon: "📡", title: "Live TV", subtitle: "200+ Channels" },
  { icon: "🎮", title: "Games", subtitle: "Play & Compete" },
  { icon: "⚙️", title: "Settings", subtitle: "Preferences" },
  { icon: "⛅", title: "Weather", subtitle: "5-Day Forecast" },
  { icon: "🛒", title: "Store", subtitle: "Discover Apps" },
  { icon: "💪", title: "Fitness", subtitle: "Track Workouts" },
  { icon: "📰", title: "News", subtitle: "Headlines" },
  { icon: "🧸", title: "Kids", subtitle: "Family Friendly" },
  { icon: "🌐", title: "Browser", subtitle: "Surf the Web" },
];

function ApplicationView() {
  const focused_idx = ref(0);

  platform.addEventListener("keydown", handleKeydown);

  function handleKeydown(event) {
    const { key } = event;
    console.log("handleKeydown", key);
    if (key === "ArrowLeft") {
      focused_idx.as((prev) => Math.max(0, prev - 1));
    }
    if (key === "ArrowRight") {
      focused_idx.as((prev) => Math.min(apps.length - 1, prev + 1));
    }
    if (key === "ArrowUp") {
      focused_idx.as((prev) => Math.max(0, prev - 4));
    }
    if (key === "ArrowDown") {
      focused_idx.as((prev) => Math.min(apps.length - 1, prev + 4));
    }
  }

  return h(
    Grid,
    { columns: 4, gap: 16 },
    apps.map((app, idx) =>
      h(
        View,
        {
          style: {
            borderColor: combine({ focused_idx, idx }, (t) =>
              t.focused_idx === t.idx ? "#007bff" : "rgba(255,255,255,0.18)",
            ),
          },
        },
        [
          h(Txt, { style: { fontSize: 22 } }, [app.icon]),
          h(Txt, { style: { fontWeight: "bold", fontSize: 14 } }, [app.title]),
          h(Txt, { style: { fontSize: 12, color: "gray" } }, [app.subtitle]),
        ],
      ),
    ),
  );
}

render(h(ApplicationView, {}), document.getElementById("c"));
