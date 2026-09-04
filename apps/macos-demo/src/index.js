import {
  View,
  For,
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
  ScrollView,
  TabView,
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
  const active_tab_ = ref("home");

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
          tab: active_tab_,
          panels: [
            {
              tab: "home",
              label: "Home",
              content: [
                View({}, ["Counter: ", count_]),
                View({}, [TimelessNativeVersion]),
              ],
            },
            {
              tab: "documents",
              label: "Documents",
              content: [
                View({}, ["Document list here"]),
                ...Array.from({ length: 10 }, (_, i) =>
                  View({ style: { padding: "8px" } }, [`Document ${i + 1}`]),
                ),
              ],
            },
            {
              tab: "settings",
              label: "Settings",
              content: [
                View({}, ["Settings panel"]),
                Button({}, ["Reset Counter"]),
              ],
            },
          ],
        },
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
      style: { width: "100%", height: "100%" },
      panels: [
        {
          size: 280,
          style: { background: "#fff" },
          content: [ScrollView({}, [SidebarContent()])],
        },
        {
          size: "auto",
          style: {},
          content: [
            SplitView({
              direction: "vertical",
              panels: [
                {
                  size: "auto",
                  style: {},
                  content: [
                    ScrollView(
                      {
                        vertical: "auto",
                        style: { flex: 1 },
                      },
                      [MainContent()],
                    ),
                  ],
                },
                {
                  size: 280,
                  style: {
                    background: "#f9f9f9",
                    "border-top": "1px solid #ddd",
                  },
                  content: [FooterContent()],
                },
              ],
            }),
          ],
        },
      ],
    },
  );
}

render(ApplicationView({}));
