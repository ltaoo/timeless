import { Section, Item } from "@/components/index.js";

export default function DataDisplayView() {
  const progressVal = ref(60);
  const stepIdx = ref(1);

  return View({ class: "space-y-8" }, [
    Section("Progress", [
      Item("60%", [Progress({ value: progressVal, max: 100 })]),
      Item("Controls", [
        Button(
          {
            size: "sm",
            onClick() {
              progressVal.as(Math.max(0, progressVal.value - 10));
            },
          },
          [Txt("-10")],
        ),
        Button(
          {
            size: "sm",
            onClick() {
              progressVal.as(Math.min(100, progressVal.value + 10));
            },
          },
          [Txt("+10")],
        ),
      ]),
    ]),
    Section("Steps", [
      Item("3 Steps", [
        Steps({
          current: stepIdx.value,
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
            size: "sm",
            onClick() {
              stepIdx.as(Math.max(0, stepIdx.value - 1));
            },
          },
          [Txt("Prev")],
        ),
        Button(
          {
            size: "sm",
            onClick() {
              stepIdx.as(Math.min(3, stepIdx.value + 1));
            },
          },
          [Txt("Next")],
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
  ]);
}
