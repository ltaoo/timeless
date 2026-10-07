import { Icon, View, vm } from "@timeless/timeless";
import { Button } from "@timeless/shadcn";

import { navigate } from "@/store/app.js";

export function NotFoundPage() {
  return View(
    {
      class: "flex h-full flex-col items-center justify-center p-8 text-center",
    },
    [
      View(
        {
          class:
            "flex size-14 items-center justify-center rounded-2xl bg-muted",
        },
        [Icon({ name: "map-pin-off", size: 28 })],
      ),
      View({ as: "h1", class: "mt-5 text-2xl font-semibold" }, ["页面不存在"]),
      View({ class: "mt-2 max-w-sm text-sm text-muted-foreground" }, [
        "这个地址没有对应页面，可能已被移动或删除。",
      ]),
      View({ class: "mt-6" }, [
        Button(
          {
            store: new vm.ButtonCore({ onClick: () => navigate("home") }),
            prefix: [Icon({ name: "arrow-left", size: 16 })],
          },
          ["返回内容库"],
        ),
      ]),
    ],
  );
}
