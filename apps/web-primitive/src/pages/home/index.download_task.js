const { View, Text, Fragment, ref, For, Show } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const tasks_ = ref([
    { id: 1, name: "project-v2.zip", size: "4.2 MB", progress: 75, status: "downloading", speed: "1.2 MB/s" },
    { id: 2, name: "images-pack.tar.gz", size: "12.8 MB", progress: 45, status: "downloading", speed: "2.1 MB/s" },
    { id: 3, name: "database-backup.sql", size: "850 KB", progress: 100, status: "completed", speed: "" },
    { id: 4, name: "assets-bundle.zip", size: "3.1 MB", progress: 0, status: "paused", speed: "" },
    { id: 5, name: "logs-archive.zip", size: "220 KB", progress: 100, status: "completed", speed: "" },
  ]);

  function togglePause(task) {
    tasks_.as(tasks_.value.map((t) =>
      t.id === task.id ? { ...t, status: t.status === "downloading" ? "paused" : "downloading" } : t,
    ));
  }

  function removeTask(task) {
    tasks_.as(tasks_.value.filter((t) => t.id !== task.id));
  }

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Download Manager"]),

    Section("Tasks", [
      View({ class: "space-y-2 max-w-xl" }, [
        ...tasks_.value.map((task) =>
          View({ class: "flex items-center gap-4 rounded-lg border border-border p-3" }, [
            // File info
            View({ class: "flex-1 min-w-0" }, [
              View({ class: "flex items-center gap-2 mb-1" }, [
                Text({ class: "text-sm font-medium truncate" }, [task.name]),
                Text({ class: "text-xs text-muted-foreground" }, [task.size]),
              ]),
              View({ class: "h-2 rounded-full bg-secondary overflow-hidden" }, [
                View({
                  class: "h-full rounded-full transition-all " +
                    (task.status === "completed" ? "bg-green-500" : task.status === "paused" ? "bg-yellow-500" : "bg-blue-500"),
                  style: { width: task.progress + "%" },
                }),
              ]),
              View({ class: "flex justify-between mt-1" }, [
                Text({ class: "text-xs text-muted-foreground" }, [task.progress + "%"]),
                Text({ class: "text-xs text-muted-foreground" }, [task.speed || task.status]),
              ]),
            ]),
            // Actions
            View({ class: "flex gap-1 shrink-0" }, [
              task.status !== "completed" ? View({
                class: "rounded border border-input px-2 py-1 text-xs cursor-pointer hover:bg-accent",
                onClick() { togglePause(task); },
              }, [task.status === "paused" ? "Resume" : "Pause"]) : null,
              View({
                class: "rounded border border-input px-2 py-1 text-xs cursor-pointer hover:bg-accent text-red-500",
                onClick() { removeTask(task); },
              }, ["Delete"]),
            ]),
          ]),
        ),
      ]),
    ]),
  ]);
}
