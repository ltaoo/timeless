const { View, Text, Fragment, ref, refobj, computed, Show } = Timeless;

export default function Page(props) {
  const current_ = ref("A");
  const logs_ = ref([]);

  function addLog(msg) {
    logs_.as([...logs_.value, { time: new Date().toLocaleTimeString(), msg }]);
  }

  const pages = ["A", "B", "C", "D", "E"];

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Lifecycle Demo"]),

    View({ class: "flex gap-2 mb-4" }, [
      ...pages.map((p) =>
        View({
          class: "inline-flex rounded-md border px-3 py-1 text-sm cursor-pointer transition-colors " +
            (current_.value === p ? "border-primary bg-accent font-medium" : "border-input hover:bg-accent"),
          onClick() { current_.as(p); addLog("Navigate to: " + p); },
        }, [p]),
      ),
    ]),

    View({ class: "border border-border rounded-lg p-6 mb-4" }, [
      Text({ class: "text-lg font-semibold mb-2" }, ["Page " + current_.value]),
      Text({ class: "text-sm text-muted-foreground" }, ["This is the content for page " + current_.value + "."]),
    ]),

    // Logs
    View({ class: "border border-border rounded-lg" }, [
      View({ class: "px-4 py-2 border-b border-border bg-muted/50" }, [
        Text({ class: "text-sm font-medium" }, ["Event Log"]),
      ]),
      View({ class: "max-h-48 overflow-auto p-2" }, [
        ...logs_.value.slice(-10).map((log) =>
          View({ class: "flex gap-2 text-xs py-1" }, [
            Text({ class: "text-muted-foreground shrink-0" }, [log.time]),
            Text({}, [log.msg]),
          ]),
        ),
      ]),
      View({
        class: "px-4 py-2 border-t border-border text-xs text-muted-foreground cursor-pointer hover:bg-accent",
        onClick() { logs_.as([]); },
      }, ["Clear logs"]),
    ]),
  ]);
}
