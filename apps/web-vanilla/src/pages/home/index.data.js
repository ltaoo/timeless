import { Section, Item } from "@/components/index.js";

export default function DataDisplayView() {
  const view$ = new Timeless.ui.ScrollViewCore({});
  const progressVal = ref(60);
  const stepIdx = ref(1);

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("Affix", [
        Item("Offset Top 20px", [
          View({ class: cn(["h-[600px] space-y-4"]) }, [
            View({ class: cn(["text-sm text-zinc-400"]) }, [
              Txt("Scroll down to see the affix effect"),
            ]),
            Affix(
              {
                store: new Timeless.ui.AffixCore({ top: 20 }),
                offsetTop: 20,
                class:
                  "inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white shadow-md",
              },
              ["Affix — Fixed at 20px from top"],
            ),
            For({
              each: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
              render(i) {
                return View(
                  {
                    class:
                      "rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 text-sm",
                  },
                  [`Content item ${i} — Keep scrolling...`],
                );
              },
            }),
          ]),
        ]),
      ]),
      Section("Progress", [
        Item("60%", [Progress({ value: progressVal, max: 100 })]),
        Item("Controls", [
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                size: "sm",
                onClick() {
                  progressVal.as(Math.max(0, progressVal.value - 10));
                },
              }),
            },
            ["-10"],
          ),
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                size: "sm",
                onClick() {
                  progressVal.as(Math.min(100, progressVal.value + 10));
                },
              }),
            },
            ["+10"],
          ),
        ]),
      ]),
      Section("Steps", [
        Item("3 Steps", [
          Steps({
            store: new Timeless.ui.StepCore({
              value: stepIdx.value,
            }),
            items: [
              { title: "Account" },
              { title: "Profile" },
              { title: "Complete" },
            ],
          }),
        ]),
        Item("Controls", [
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                size: "sm",
                onClick() {
                  stepIdx.as(Math.max(0, stepIdx.value - 1));
                },
              }),
            },
            ["Prev"],
          ),
          Button(
            {
              store: new Timeless.ui.ButtonCore({
                size: "sm",
                onClick() {
                  stepIdx.as(Math.min(3, stepIdx.value + 1));
                },
              }),
            },
            ["Next"],
          ),
        ]),
      ]),
      Section("Skeleton", [
        Item("Default", [
          View({ class: cn(["space-y-3 w-[250px]"]) }, [
            Skeleton({
              class: cn(["h-[125px] w-full rounded-xl"]),
            }),
            View({ class: cn(["space-y-2"]) }, [
              Skeleton({ class: cn(["h-4 w-full"]) }),
              Skeleton({ class: cn(["h-4 w-[200px]"]) }),
            ]),
          ]),
        ]),
      ]),
      Section("ScrollArea", [
        Item("Default", [
          ScrollArea(
            {
              class: cn([
                "h-[200px] w-[250px] rounded-md border border-zinc-200 p-4 dark:border-zinc-800",
              ]).toString(),
            },
            [
              View({ class: cn(["space-y-4"]) }, [
                ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) =>
                  View({ class: cn(["text-sm"]) }, [
                    Txt(`Item ${i} — Scrollable content area`),
                  ]),
                ),
              ]),
            ],
          ),
        ]),
      ]),
      Section("AspectRatio", [
        Item("16:9", [
          View({ class: cn(["w-[300px]"]) }, [
            AspectRatio({ ratio: 16 / 9 }, [
              View(
                {
                  class: cn([
                    "flex items-center justify-center w-full h-full rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500",
                  ]),
                },
                [Txt("16 : 9")],
              ),
            ]),
          ]),
        ]),
      ]),
      Section("Table", [
        Item("Default", [
          Table({}, [
            TableHeader({}, [
              TableRow({}, [
                TableHead({}, [Txt("Name")]),
                TableHead({}, [Txt("Status")]),
                TableHead({}, [Txt("Role")]),
              ]),
            ]),
            TableBody({}, [
              TableRow({}, [
                TableCell({}, [Txt("Alice")]),
                TableCell({}, [Txt("Active")]),
                TableCell({}, [Txt("Admin")]),
              ]),
              TableRow({}, [
                TableCell({}, [Txt("Bob")]),
                TableCell({}, [Txt("Inactive")]),
                TableCell({}, [Txt("User")]),
              ]),
              TableRow({}, [
                TableCell({}, [Txt("Charlie")]),
                TableCell({}, [Txt("Active")]),
                TableCell({}, [Txt("Editor")]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
}
