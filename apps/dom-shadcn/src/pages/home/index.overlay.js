import { Button, Dialog, DropdownMenu, ui } from "@timeless/shadcn";
import { View } from "@timeless/timeless";

const viewportDialog$ = new ui.DialogCore({
  title: "Dialog With Viewport",
});

const bottomDropdown$ = new ui.DropdownMenuCore({
  trigger: "click",
  side: "bottom",
  align: "end",
  offsetY: 4,
  items: [
    new ui.MenuItemCore({ label: "Profile" }),
    new ui.MenuItemCore({ label: "Billing" }),
    new ui.MenuItemCore({ label: "Notifications" }),
    new ui.MenuItemCore({ label: "Team" }),
    new ui.MenuItemCore({ label: "Integrations" }),
    new ui.MenuItemCore({ label: "Settings" }),
    new ui.MenuItemCore({ label: "Support" }),
    new ui.MenuItemCore({ label: "Logout" }),
  ],
});

export default function HomeIndexOverlayView(props) {
  return View({ class: "relative h-full p-6" }, [
    View(
      {
        class:
          "relative w-full h-[320px] max-w-md rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4",
        onMounted(event) {
          viewportDialog$.setViewport({
            getRect() {
              return event.target.getBoundingClientRect();
            },
          });
        },
      },
      [
        View({ class: "text-xs text-zinc-500 mb-3" }, [
          "Dialog will be centered relative to this box.",
        ]),
        Button(
          {
            store: new ui.ButtonCore({
              onClick() {
                viewportDialog$.show();
              },
            }),
          },
          ["Open Viewport Dialog"],
        ),
      ],
    ),
    View(
      {
        class: "fixed bottom-6 right-6 z-40",
      },
      [
        DropdownMenu({ store: bottomDropdown$ }, [
          Button({ store: new ui.ButtonCore({ variant: "outline" }) }, [
            "Bottom Dropdown",
          ]),
        ]),
      ],
    ),
    Dialog({ store: viewportDialog$ }, [
      View({ class: "text-sm text-zinc-500" }, [
        "Centered relative to the dashed box via setViewport({ getRect }).",
      ]),
    ]),
  ]);
}
