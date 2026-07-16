const { View, Text, Fragment, ref, Show, For } = Timeless;
import { Section, Item } from "../../components/index.js";

export default function Page(props) {
  const progress_ = ref(60);
  const currentStep_ = ref(2);

  const columns = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];
  const rows = [
    { name: "Admin", role: "Administrator", status: "Active" },
    { name: "Zhang San", role: "Auditor", status: "Active" },
    { name: "Li Si", role: "Member", status: "Disabled" },
  ];

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Data Display"]),

    Section("Progress", [
      Item("60%", [
        View({ class: "w-64 h-3 rounded-full bg-secondary overflow-hidden" }, [
          View({ class: "h-full rounded-full bg-primary transition-all", style: { width: progress_.value + "%" } }),
        ]),
        View({ class: "flex gap-1 mt-1" }, [
          ...[{ l: "+10", v: 10 }, { l: "-10", v: -10 }].map(({ l, v }) =>
            View({
              class: "inline-flex rounded border border-input px-2 py-0.5 text-xs cursor-pointer hover:bg-accent",
              onClick() { progress_.as(Math.min(100, Math.max(0, progress_.value + v))); },
            }, [l]),
          ),
        ]),
      ]),
    ]),

    Section("Steps", [
      View({ class: "space-y-4" }, [
        View({ class: "flex gap-6" }, [
          ...["Upload", "Process", "Review", "Complete"].map((label, i) =>
            View({ class: "flex items-center gap-2" }, [
              View({
                class: "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium " +
                  (i + 1 <= currentStep_.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
              }, [String(i + 1)]),
              Text({ class: "text-sm " + (i + 1 <= currentStep_.value ? "text-foreground" : "text-muted-foreground") }, [label]),
            ]),
          ),
        ]),
        View({ class: "flex gap-1" }, [
          ...[{ l: "Prev", v: -1 }, { l: "Next", v: 1 }].map(({ l, v }) =>
            View({
              class: "inline-flex rounded border border-input px-3 py-1 text-sm cursor-pointer hover:bg-accent",
              onClick() { currentStep_.as(Math.min(4, Math.max(1, currentStep_.value + v))); },
            }, [l]),
          ),
        ]),
      ]),
    ]),

    Section("Table", [
      View({ class: "border border-border rounded-lg overflow-hidden" }, [
        View({ class: "grid grid-cols-3 bg-muted/50" }, [
          ...columns.map((col) =>
            View({ class: "px-4 py-2 text-sm font-medium" }, [col.label]),
          ),
        ]),
        ...rows.map((row, i) =>
          View({ class: "grid grid-cols-3 border-t border-border" }, [
            View({ class: "px-4 py-2 text-sm" }, [row.name]),
            View({ class: "px-4 py-2 text-sm" }, [row.role]),
            View({ class: "px-4 py-2 text-sm" }, [
              View({
                class: "inline-flex rounded-full px-2 py-0.5 text-xs " +
                  (row.status === "Active" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-zinc-100 text-zinc-500"),
              }, [row.status]),
            ]),
          ]),
        ),
      ]),
    ]),
  ]);
}
