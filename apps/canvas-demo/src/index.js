import { View, ref, computed } from "@timeless/timeless";
import { render } from "@timeless/timeless-canvas";

const canvas = document.getElementById("c");

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

const focus = ref(0);

let host = null;

const columns = 4;
const gap = 18;
const itemW = 170;
const itemH = 110;
const startX = 40;
const startY = 46;

function itemStyle(idx) {
  return computed(focus, (cur) => {
    const col = idx % columns;
    const row = Math.floor(idx / columns);
    const x = startX + col * (itemW + gap);
    const y = startY + row * (itemH + gap);
    const active = cur === idx;
    const bg = active ? "rgba(79,70,229,0.92)" : "rgba(255,255,255,0.08)";
    const border = active ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)";
    return [
      `left: ${x}px`,
      `top: ${y}px`,
      `width: ${itemW}px`,
      `height: ${itemH}px`,
      `background: ${bg}`,
      `border-color: ${border}`,
      "border-width: 2px",
    ].join("; ");
  });
}

function lineStyle(x, y, w, h, extra = "") {
  return [
    `left: ${x}px`,
    `top: ${y}px`,
    `width: ${w}px`,
    `height: ${h}px`,
    extra,
  ]
    .filter(Boolean)
    .join("; ");
}

const gridItems = apps.map((app, idx) =>
  View(
    {
      style: itemStyle(idx),
      onClick() {
        focus.value = idx;
        host?.draw();
      },
      onMouseEnter() {
        canvas.style.cursor = "pointer";
      },
      onMouseLeave() {
        canvas.style.cursor = "default";
      },
    },
    [
      View(
        {
          style: lineStyle(
            14,
            12,
            40,
            26,
            "font: 22px sans-serif; color: rgba(255,255,255,0.95)",
          ),
        },
        [app.icon],
      ),
      View(
        {
          style: lineStyle(
            14,
            44,
            itemW - 28,
            20,
            "font: 14px sans-serif; color: rgba(255,255,255,0.95)",
          ),
        },
        [app.title],
      ),
      View(
        {
          style: lineStyle(
            14,
            68,
            itemW - 28,
            18,
            "font: 12px sans-serif; color: rgba(255,255,255,0.72)",
          ),
        },
        [app.subtitle],
      ),
    ],
  ),
);

const root = View(
  {
    style:
      "left: 0px; top: 0px; width: 100%; height: 100%; background: #0b1020;",
  },
  gridItems,
);

host = render(root, canvas);
canvas?.focus?.();
