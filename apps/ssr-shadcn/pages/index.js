import { View, Show, Txt } from "@timeless/timeless";

// Import shadcn components
import { Button } from "@timeless/shadcn/src/modules/button";
import { Badge } from "@timeless/shadcn/src/modules/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@timeless/shadcn/src/modules/card";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@timeless/shadcn/src/modules/alert";
import { Separator } from "@timeless/shadcn/src/modules/separator";
import { Label } from "@timeless/shadcn/src/modules/label";
import { Input } from "@timeless/shadcn/src/modules/input";
import { Checkbox } from "@timeless/shadcn/src/modules/checkbox";
import { Switch } from "@timeless/shadcn/src/modules/switch";
import { Progress } from "@timeless/shadcn/src/modules/progress";

import {
  ButtonCore,
  InputCore,
  CheckboxCore,
  SwitchCore,
  ProgressCore,
} from "@timeless/ui";

/**
 * SSR data loader
 */
export async function load({ query }) {
  return {
    count: 0,
    inputValue: "Hello SSR",
    isChecked: false,
    isSwitchOn: true,
    progress: 45,
    message: "Timeless SSR + Shadcn",
  };
}

/**
 * Page head configuration
 */
export function head({ data }) {
  return {
    title: "Timeless SSR + Shadcn Demo",
    meta: [
      {
        name: "description",
        content: "Testing Shadcn components with SSR rendering",
      },
    ],
    links: [{ rel: "stylesheet", href: "/styles.css" }],
  };
}

/**
 * Main Page Component
 */
export default function Page({ data }) {
  // Create component stores
  const counterBtn = new ButtonCore({
    onClick() {
      data.count.as((v) => v + 1);
    },
  });

  const resetBtn = new ButtonCore({
    variant: "outline",
    onClick() {
      data.count.as(0);
    },
  });

  const loadingBtn = new ButtonCore({
    loading: true,
  });

  const input = new InputCore({
    defaultValue: data.inputValue,
    placeholder: "Enter text...",
    onChange(v) {
      data.inputValue.as(v.value);
    },
  });

  const checkbox = new CheckboxCore({
    checked: data.isChecked,
    onChange(v) {
      data.isChecked.as(v);
    },
  });

  const switchCore = new SwitchCore({
    checked: data.isSwitchOn,
    onChange(v) {
      data.isSwitchOn.as(v);
    },
  });

  const progressCore = new ProgressCore({
    value: data.progress,
  });

  const incrementProgressBtn = new ButtonCore({
    variant: "secondary",
    size: "sm",
    onClick() {
      data.progress.as((v) => Math.min(100, v + 10));
      progressCore.setValue(data.progress.get());
    },
  });

  return View({ class: "min-h-screen bg-background p-8" }, [
    View({ class: "max-w-4xl mx-auto space-y-8" }, [
      // Header
      View({ as: "header", class: "text-center space-y-2" }, [
        View({ as: "h1", class: "text-3xl font-bold text-foreground" }, [
          data.message,
        ]),
        View({ as: "p", class: "text-muted-foreground" }, [
          "Testing Shadcn components with Server-Side Rendering",
        ]),
      ]),

      Separator({}),

      // Alert
      Alert({ variant: "default" }, [
        AlertTitle({}, ["SSR Info"]),
        AlertDescription({}, [
          "This page is server-rendered and hydrated on the client. All components below should be interactive after hydration.",
        ]),
      ]),

      // Grid layout for components
      View({ class: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
        // Counter Card with Button component
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Counter"]),
            CardDescription({}, ["Test button click interactions"]),
          ]),
          CardContent({ class: "space-y-4" }, [
            View({ class: "flex items-center gap-4" }, [
              Button({ store: counterBtn }, ["Increment"]),
              Button({ store: resetBtn }, ["Reset"]),
            ]),
            View({ class: "flex items-center gap-2" }, [
              Txt("Count: "),
              Badge({ variant: "secondary" }, [data.count]),
            ]),
          ]),
        ]),

        // Loading Button Card
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Loading State"]),
            CardDescription({}, ["Button with loading spinner (uses icons)"]),
          ]),
          CardContent({ class: "space-y-4" }, [
            Button({ store: loadingBtn }, ["Loading..."]),
          ]),
        ]),

        // Input Card
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Input"]),
            CardDescription({}, ["Test text input binding"]),
          ]),
          CardContent({ class: "space-y-4" }, [
            View({ class: "space-y-2" }, [
              Label({ for: "test-input" }, ["Enter text"]),
              Input({ store: input, id: "test-input" }),
            ]),
            View({ class: "text-sm text-muted-foreground" }, [
              Txt("Value: "),
              View({ as: "span", class: "font-medium" }, [data.inputValue]),
            ]),
          ]),
        ]),

        // Checkbox & Switch Card
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Checkbox & Switch"]),
            CardDescription({}, ["Test toggle components"]),
          ]),
          CardContent({ class: "space-y-4" }, [
            View({ class: "flex items-center gap-3" }, [
              Checkbox({ store: checkbox }),
              Label({}, ["Accept terms"]),
              Show({
                when: data.isChecked,
                ok() {
                  return [Badge({}, ["Checked"])];
                },
              }),
            ]),
            Separator({}),
            View({ class: "flex items-center gap-3" }, [
              Switch({ store: switchCore }),
              Label({}, ["Enable notifications"]),
              Show({
                when: data.isSwitchOn,
                ok() {
                  return [Badge({ variant: "outline" }, ["ON"])];
                },
              }),
            ]),
          ]),
        ]),

        // Progress Card
        Card({}, [
          CardHeader({}, [
            CardTitle({}, ["Progress"]),
            CardDescription({}, ["Test progress bar updates"]),
          ]),
          CardContent({ class: "space-y-4" }, [
            Progress({ store: progressCore }),
            View({ class: "flex items-center justify-between" }, [
              Button({ store: incrementProgressBtn }, ["+10%"]),
              View({ class: "text-sm text-muted-foreground" }, [
                data.progress,
                Txt("%"),
              ]),
            ]),
          ]),
        ]),
      ]),

      // Footer
      View({ class: "text-center text-sm text-muted-foreground pt-8" }, [
        "Powered by Timeless Framework",
      ]),
    ]),
  ]);
}
