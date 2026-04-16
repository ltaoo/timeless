import { Button, Dialog, ui } from "@timeless/shadcn";
import { View } from "@timeless/timeless";

const viewportDialog$ = new ui.DialogCore({
  title: "Dialog With Viewport",
});

export default function HomeIndexOverlayView(props) {
  return View({}, [
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
    Dialog({ store: viewportDialog$ }, [
      View({ class: "text-sm text-zinc-500" }, [
        "Centered relative to the dashed box via setViewport({ getRect }).",
      ]),
    ]),
  ]);
}
