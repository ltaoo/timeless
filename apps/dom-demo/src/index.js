import { VNode, Grid, View, Txt, ref, combine } from "@timeless/timeless";
import { render, platform } from "@timeless/timeless-dom";

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
    if (key === "ArrowLeft") {
      focused_idx.as((prev) => Math.max(0, prev - 1));
    }
    if (key === "ArrowRight") {
      focused_idx.as((prev) => Math.min(apps.length - 1, prev + 1));
    }
    if (key === "ArrowUp") {
      focused_idx.as((prev) => Math.max(0, prev - 1));
    }
    if (key === "ArrowDown") {
      focused_idx.as((prev) => Math.min(apps.length - 1, prev + 1));
    }
    if (key === "Enter") {
      console.log("Enter pressed");
    }
    if (key === "Escape") {
      console.log("Escape pressed");
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
            border: combine({ focused_idx, idx }, (t) => {
              console.log("focused indx update", t.focused_idx, idx);
              if (t.focused_idx === t.idx) {
                return "2px solid #007bff";
              }
              return "2px solid #ccc";
            }),
          },
        },
        [
          h(Txt, { style: {} }, [idx]),
          h(Txt, { style: { fontSize: 22 } }, [app.icon]),
          h(Txt, { style: { fontWeight: "bold", fontSize: 14 } }, [app.title]),
          h(Txt, { style: { fontSize: 12, color: "gray" } }, [app.subtitle]),
        ],
      ),
    ),
  );
}

render(h(ApplicationView, {}), document.getElementById("root"));
