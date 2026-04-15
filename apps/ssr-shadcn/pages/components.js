/**
 * 组件库页 - 复刻 web-vanilla 的 general + form 页面
 * 测试: 各种 shadcn 组件 SSR 渲染
 */
import { View, Show, For, ref, computed } from "@timeless/timeless";
import { Button } from "@timeless/shadcn/src/modules/button";
import { Input } from "@timeless/shadcn/src/modules/input";
import { Textarea } from "@timeless/shadcn/src/modules/textarea";
import { Badge } from "@timeless/shadcn/src/modules/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@timeless/shadcn/src/modules/card";
import { Separator } from "@timeless/shadcn/src/modules/separator";
import { Checkbox } from "@timeless/shadcn/src/modules/checkbox";
import { Switch } from "@timeless/shadcn/src/modules/switch";
import { Progress } from "@timeless/shadcn/src/modules/progress";
import { Label } from "@timeless/shadcn/src/modules/label";
import { Alert, AlertTitle, AlertDescription } from "@timeless/shadcn/src/modules/alert";
import { Select } from "@timeless/shadcn/src/modules/select";
import { Skeleton } from "@timeless/shadcn/src/modules/skeleton";
import { Slider } from "@timeless/shadcn/src/modules/slider";
import {
  ButtonCore,
  InputCore,
  CheckboxCore,
  ProgressCore,
  SelectCore,
} from "@timeless/ui-vm";
import { SwitchCore } from "@timeless/ui-vm";
import { Section, Item, NavBar } from "../components/index.js";
import { client$ } from "../store/index.js";
import { request } from "../biz/request.js";

export async function load({ query }) {
  // 测试服务端数据加载 (模拟 API 请求)
  const mockApiResult = {
    fruits: [
      { id: 1, name: "Apple", price: 3.5 },
      { id: 2, name: "Banana", price: 1.2 },
      { id: 3, name: "Cherry", price: 8.0 },
      { id: 4, name: "Grape", price: 5.5 },
    ],
    loadedAt: new Date().toISOString(),
  };
  return {
    apiData: mockApiResult,
    section: query.section || "all",
  };
}

export function head() {
  return {
    title: "Timeless SSR — Components",
    meta: [
      {
        name: "description",
        content: "Shadcn component library SSR rendering test",
      },
    ],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
  };
}

export default function Page({ data }) {
  const apiResult = ref(JSON.stringify(data.apiData, null, 2));
  const requestStatus = ref("idle");

  // ---- Button ----
  const primaryBtn = new ButtonCore({});
  const secondaryBtn = new ButtonCore({ variant: "secondary" });
  const outlineBtn = new ButtonCore({ variant: "outline" });
  const ghostBtn = new ButtonCore({ variant: "ghost" });
  const destructiveBtn = new ButtonCore({ variant: "destructive" });
  const linkBtn = new ButtonCore({ variant: "link" });
  const disabledBtn = new ButtonCore({ disabled: true });

  // Loading demo
  const loadingBtn = new ButtonCore({
    onClick() {
      loadingBtn.setLoading(true);
      setTimeout(() => loadingBtn.setLoading(false), 2000);
    },
  });

  // ---- Input ----
  const textInput = new InputCore({
    defaultValue: "",
    placeholder: "Type something...",
  });
  const disabledInput = new InputCore({
    defaultValue: "Disabled",
    placeholder: "Disabled input",
    disabled: true,
  });

  // ---- Textarea ----
  const textareaStore = new InputCore({
    defaultValue: "",
    placeholder: "Enter your message...",
  });

  // ---- Checkbox ----
  const checkbox1 = new CheckboxCore({});
  const checkbox2 = new CheckboxCore({ checked: true });

  // ---- Switch ----
  const switch1 = SwitchCore({ defaultValue: false });
  const switch2 = SwitchCore({ defaultValue: true });

  // ---- Progress ----
  const progress1 = new ProgressCore({ value: 33 });
  const progress2 = new ProgressCore({ value: 66 });
  const progress3 = new ProgressCore({ value: 100 });

  // ---- Select ----
  const select1 = new SelectCore({
    defaultValue: "apple",
    options: [
      { value: "apple", label: "苹果" },
      { value: "banana", label: "香蕉" },
      { value: "orange", label: "橙子" },
      { value: "grape", label: "葡萄" },
    ],
  });

  // ---- API Request Test ----
  const fetchBtn = new ButtonCore({
    variant: "outline",
    onClick() {
      requestStatus.as("loading");
      fetchBtn.setLoading(true);
      // 模拟请求 (在 client 端执行)
      setTimeout(() => {
        const result = {
          status: 200,
          data: { message: "Hello from mock API!", timestamp: Date.now() },
        };
        apiResult.as(JSON.stringify(result, null, 2));
        requestStatus.as("success");
        fetchBtn.setLoading(false);
      }, 1000);
    },
  });

  return View({ class: "min-h-screen bg-background" }, [
    NavBar({ current: "components" }),

    View({ as: "main", class: "max-w-4xl mx-auto px-6 py-8 space-y-10" }, [
      // Header
      View({ class: "space-y-2" }, [
        View(
          { as: "h1", class: "text-2xl font-bold tracking-tight text-foreground" },
          ["Component Library"],
        ),
        View({ as: "p", class: "text-muted-foreground" }, [
          "shadcn 组件 SSR 渲染测试 - 所有组件在服务端渲染，客户端水合后可交互",
        ]),
      ]),

      Separator({}),

      // ========== API Request Test ==========
      Section("API Request (接口请求)", [
        Item("Server-side data (from load())", [
          View(
            {
              as: "pre",
              class: "text-xs font-mono bg-muted p-3 rounded-lg overflow-auto max-h-[150px] w-full",
            },
            [apiResult],
          ),
        ]),
        Item("Client-side request", [
          Button({ store: fetchBtn }, ["Fetch Mock API"]),
          Badge(
            { variant: "outline" },
            [computed(requestStatus, (s) => `Status: ${s}`)],
          ),
        ]),
      ]),

      Separator({}),

      // ========== Button ==========
      Section("Button", [
        Item("Variants", [
          Button({ store: primaryBtn }, ["Default"]),
          Button({ store: secondaryBtn }, ["Secondary"]),
          Button({ store: outlineBtn }, ["Outline"]),
          Button({ store: ghostBtn }, ["Ghost"]),
          Button({ store: destructiveBtn }, ["Destructive"]),
          Button({ store: linkBtn }, ["Link"]),
        ]),
        Item("Sizes", [
          Button({ store: new ButtonCore({ size: "xs" }) }, ["XS"]),
          Button({ store: new ButtonCore({ size: "sm" }) }, ["SM"]),
          Button({ store: new ButtonCore({}) }, ["Default"]),
          Button({ store: new ButtonCore({ size: "lg" }) }, ["LG"]),
        ]),
        Item("Loading", [
          Button({ store: loadingBtn }, ["Click to Load"]),
        ]),
        Item("Disabled", [
          Button({ store: disabledBtn }, ["Disabled"]),
          Button(
            { store: new ButtonCore({ variant: "secondary", disabled: true }) },
            ["Disabled"],
          ),
          Button(
            { store: new ButtonCore({ variant: "outline", disabled: true }) },
            ["Disabled"],
          ),
        ]),
      ]),

      Separator({}),

      // ========== Badge ==========
      Section("Badge", [
        Item("Variants", [
          Badge({}, ["Default"]),
          Badge({ variant: "secondary" }, ["Secondary"]),
          Badge({ variant: "outline" }, ["Outline"]),
          Badge({ variant: "destructive" }, ["Destructive"]),
        ]),
      ]),

      Separator({}),

      // ========== Input ==========
      Section("Input", [
        Item("Default", [
          Input({ store: textInput }),
        ]),
        Item("Disabled", [
          Input({ store: disabledInput }),
        ]),
      ]),

      Separator({}),

      // ========== Textarea ==========
      Section("Textarea", [
        Item("Default", [
          Textarea({ store: textareaStore }),
        ]),
      ]),

      Separator({}),

      // ========== Select ==========
      Section("Select", [
        Item("Default", [
          Select({ store: select1 }),
        ]),
      ]),

      Separator({}),

      // ========== Checkbox ==========
      Section("Checkbox", [
        Item("Default", [
          Checkbox({ store: checkbox1 }),
        ]),
        Item("With Label", [
          View({ class: "flex items-center gap-2" }, [
            Checkbox({ id: "ssr_cb1", store: checkbox2 }),
            Label({ for: "ssr_cb1", class: "text-sm" }, [
              "Accept terms and conditions",
            ]),
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Switch ==========
      Section("Switch", [
        Item("Off", [
          View({ class: "flex items-center gap-2" }, [
            Switch({ store: switch1 }),
            Label({}, ["Dark mode"]),
          ]),
        ]),
        Item("On", [
          View({ class: "flex items-center gap-2" }, [
            Switch({ store: switch2 }),
            Label({}, ["Notifications"]),
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Progress ==========
      Section("Progress", [
        Item("33%", [
          Progress({ store: progress1, class: "w-full max-w-sm" }),
        ]),
        Item("66%", [
          Progress({ store: progress2, class: "w-full max-w-sm" }),
        ]),
        Item("100%", [
          Progress({ store: progress3, class: "w-full max-w-sm" }),
        ]),
      ]),

      Separator({}),

      // ========== Card ==========
      Section("Card", [
        Item("Default", [
          Card({ class: "w-[350px]" }, [
            CardHeader({}, [
              CardTitle({}, ["Card Title"]),
              CardDescription({}, ["Card description goes here."]),
            ]),
            CardContent({}, [
              View({ class: "text-sm" }, ["This is the card content area."]),
            ]),
            CardFooter({}, [
              Button({ store: new ButtonCore({ size: "sm" }) }, ["Action"]),
            ]),
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Alert ==========
      Section("Alert", [
        Alert({}, [
          AlertTitle({}, ["Heads up!"]),
          AlertDescription({}, [
            "This alert is server-rendered via SSR.",
          ]),
        ]),
        Alert({ variant: "destructive" }, [
          AlertTitle({}, ["Error"]),
          AlertDescription({}, [
            "This destructive alert is server-rendered.",
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Separator ==========
      Section("Separator", [
        Item("Horizontal", [
          View({ class: "w-full" }, [Separator({})]),
        ]),
        Item("Vertical", [
          View({ class: "flex items-center h-6 gap-3" }, [
            "Left",
            Separator({ orientation: "vertical" }),
            "Right",
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Label ==========
      Section("Label", [
        Item("With Input", [
          View({ class: "space-y-2 w-full max-w-sm" }, [
            Label({}, ["Email"]),
            Input({
              store: new InputCore({
                defaultValue: "",
                placeholder: "email@example.com",
              }),
            }),
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Skeleton ==========
      Section("Skeleton", [
        Item("Loading placeholder", [
          View({ class: "space-y-3 w-full max-w-sm" }, [
            Skeleton({ class: "h-4 w-3/4" }),
            Skeleton({ class: "h-4 w-1/2" }),
            Skeleton({ class: "h-10 w-full rounded-lg" }),
          ]),
        ]),
      ]),

      Separator({}),

      // ========== Slider ==========
      Section("Slider", [
        Item("Default", [
          Slider({ value: 50, max: 100, step: 1, class: "w-full max-w-sm" }),
        ]),
      ]),

      Separator({}),

      // ========== Data Display (from server load) ==========
      Section("Data Display (服务端数据)", [
        Item("Fruits Table (from load())", [
          View({ class: "w-full max-w-md" }, [
            View(
              { class: "grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground border-b border-border pb-2" },
              [
                View({}, ["Name"]),
                View({}, ["Price"]),
                View({}, ["Action"]),
              ],
            ),
            ...data.apiData.fruits.map((fruit) =>
              View(
                { class: "grid grid-cols-3 gap-2 text-sm py-2 border-b border-border/50" },
                [
                  View({ class: "text-foreground" }, [fruit.name]),
                  View({ class: "text-foreground" }, [`$${fruit.price}`]),
                  Button(
                    { store: new ButtonCore({ size: "xs", variant: "ghost" }) },
                    ["Buy"],
                  ),
                ],
              ),
            ),
          ]),
        ]),
      ]),
    ]),

    // Footer
    View({ as: "footer", class: "border-t border-border mt-12" }, [
      View(
        { class: "max-w-4xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground" },
        ["Powered by Timeless Framework — SSR Shadcn Test"],
      ),
    ]),
  ]);
}
