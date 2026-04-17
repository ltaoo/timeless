import {
  View,
  ref,
  computed,
  Img,
  Button,
  Input,
  Checkbox,
  Row,
  Column,
  Textarea,
  NumberInput,
  Radio,
  Select,
  Icon,
  AspectRatio,
  Text,
  SplitView,
  SplitPane,
  ScrollView,
  TabView,
  TabPane,
} from "@timeless/timeless";
import { render, TimelessNativeVersion } from "@timeless/timeless-native";

function SidebarContent() {
  const menuItems = [
    { icon: "house.fill", label: "Home" },
    { icon: "doc.text.fill", label: "Documents" },
    { icon: "photo.fill", label: "Photos" },
    { icon: "gear", label: "Settings" },
  ];

  return View(
    {
      style: { padding: "16px" },
    },
    [
      View(
        {
          style: {
            "font-size": "18px",
            "font-weight": "bold",
            "margin-bottom": "16px",
          },
        },
        ["Sidebar"],
      ),
      For({
        each: menuItems,
        render(item, idx) {
          return Row(
            { gap: 12, style: { padding: "8px", cursor: "pointer" } },
            [
              Icon({ name: item.icon, size: 18, color: "#666" }),
              Text(item.label),
            ],
          );
        },
      }),
    ],
  );
}

function MainContent() {
  const count_ = ref(0);
  const activeTab = ref(0);

  return View(
    {
      style: { padding: "20px" },
      onMounted() {
        console.log("[Main Content] onMounted");
        const timer = setInterval(() => {
          count_.as((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
      },
    },
    [
      View(
        {
          style: {
            "font-size": "24px",
            "font-weight": "bold",
            "margin-bottom": "16px",
          },
        },
        ["Main Content"],
      ),
      TabView(
        {
          activeIndex: activeTab,
          onChange(idx) {
            activeTab.set(idx);
          },
        },
        [
          TabPane({ label: "Home" }, [
            View({}, ["Counter: ", count_]),
            View({}, [TimelessNativeVersion]),
          ]),
          TabPane({ label: "Documents" }, [
            View({}, ["Document list here"]),
            ...Array.from({ length: 10 }, (_, i) =>
              View({ style: { padding: "8px" } }, [`Document ${i + 1}`]),
            ),
          ]),
          TabPane({ label: "Settings" }, [
            View({}, ["Settings panel"]),
            Button({}, ["Reset Counter"]),
          ]),
        ],
      ),
    ],
  );
}

function FooterContent() {
  return View(
    {
      style: { padding: "16px" },
    },
    [
      View(
        {
          style: {
            "font-size": "16px",
            "font-weight": "bold",
            "margin-bottom": "8px",
          },
        },
        ["Footer Panel"],
      ),
      Row({ gap: 12 }, [Button({}, ["Action 1"]), Button({}, ["Action 2"])]),
      View(
        { style: { "margin-top": "12px", color: "#666", "font-size": "13px" } },
        ["Fixed height panel at the bottom"],
      ),
    ],
  );
}

function ApplicationView() {
  return SplitView(
    {
      direction: "horizontal",
      defaultSizes: [280, "flex"],
      style: { width: "100%", height: "100%" },
    },
    [
      SplitPane(
        {
          size: 280,
          style: { background: "#fff" },
        },
        [ScrollView({}, [SidebarContent()])],
      ),
      SplitView(
        {
          direction: "vertical",
          defaultSizes: ["flex", 280],
          style: { flex: 1 },
        },
        [
          ScrollView(
            {
              vertical: "auto",
              style: { flex: 1 },
            },
            [MainContent()],
          ),
          SplitPane(
            {
              size: 280,
              style: { background: "#f9f9f9", "border-top": "1px solid #ddd" },
            },
            [FooterContent()],
          ),
        ],
      ),
    ],
  );
}

render(ApplicationView({}));
