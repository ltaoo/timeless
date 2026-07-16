const { View, Text, Fragment, ref, Show, For } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const selectedNode_ = ref(null);

  const nodes = [
    { id: "trigger", label: "Trigger", status: "completed", x: 0, y: 20 },
    { id: "input", label: "Input", status: "completed", x: 140, y: 20 },
    { id: "request", label: "Request", status: "running", x: 280, y: 20 },
    { id: "parse", label: "Parse", status: "pending", x: 420, y: -10 },
    { id: "extract1", label: "IMG Extract", status: "pending", x: 420, y: 50 },
    { id: "extract2", label: "CSS Extract", status: "pending", x: 560, y: 0 },
    { id: "req1", label: "IMG Req", status: "pending", x: 560, y: 60 },
    { id: "merge", label: "Merge", status: "pending", x: 700, y: 20 },
    { id: "save", label: "Save", status: "pending", x: 840, y: 20 },
  ];

  const statusColors = {
    completed: "bg-green-500",
    running: "bg-blue-500",
    pending: "bg-zinc-300 dark:bg-zinc-600",
  };

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Flow Pipeline"]),

    View({ class: "flex gap-6" }, [
      // Canvas
      View({ class: "flex-1 border border-border rounded-lg overflow-auto p-8", style: { minHeight: "200px" } }, [
        View({ class: "relative", style: { width: "1000px", height: "120px" } }, [
          ...nodes.map((node) =>
            View({
              class: "absolute flex flex-col items-center",
              style: { left: node.x + "px", top: node.y + "px" },
            }, [
              View({
                class: "flex items-center gap-2 rounded-lg border border-border bg-white dark:bg-zinc-900 px-3 py-2 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all " +
                  (selectedNode_.value === node.id ? "ring-2 ring-primary" : ""),
                onClick() { selectedNode_.as(node.id); },
              }, [
                View({ class: "w-3 h-3 rounded-full " + (statusColors[node.status] || "") }),
                Text({ class: "text-xs font-medium whitespace-nowrap" }, [node.label]),
              ]),
            ]),
          ),
          // SVG lines (simplified)
          View({
            as: "svg",
            class: "absolute inset-0 pointer-events-none",
            style: { width: "1000px", height: "120px" },
          }, [
            ...["M50,40 L130,40", "M190,40 L270,40", "M330,40 L410,20", "M330,40 L410,70", "M470,20 L550,10", "M470,70 L550,70", "M610,30 L690,30", "M750,30 L830,30"].map((d) =>
              View({ as: "path", d, stroke: "currentColor", class: "text-zinc-300 dark:text-zinc-600", "stroke-width": "2", fill: "none" }),
            ),
          ]),
        ]),
      ]),

      // Detail panel
      Show({ when: computed(selectedNode_, (id) => !!id), ok() { return [
        View({ class: "w-64 shrink-0 border border-border rounded-lg p-4" }, [
          Text({ class: "text-sm font-semibold mb-2" }, [nodes.find((n) => n.id === selectedNode_.value)?.label || ""]),
          View({ class: "space-y-1" }, [
            Text({ class: "text-xs text-muted-foreground" }, ["Status: " + (nodes.find((n) => n.id === selectedNode_.value)?.status || "")]),
            Text({ class: "text-xs text-muted-foreground" }, ["Input: data.json"]),
            Text({ class: "text-xs text-muted-foreground" }, ["Output: result.json"]),
          ]),
        ]),
      ]; } }),
    ]),
  ]);
}
