import { projects } from "./data.js";
import { StackLayout } from "@/components/layout.js";

export default function ProjectLayoutView(props) {
  const curProjectId = ref(props.view.query.id);

  console.log("[]ProjectIndexView", props.view.query);

  // Auto-select first project
  const firstProject = projects[0];
  if (firstProject && !props.view.query.id) {
    curProjectId.as(firstProject.id);
    props.history.replace("root.home_layout.project.workspace", {
      id: firstProject.id,
    });
  }

  props.history.onRouteChange(({ view }) => {
    curProjectId.as(view.query.id);
  });

  // Tab state: "workspace" or "history"
  const curTab = ref(
    props.view.curView ? props.view.curView.name.split(".").pop() : "workspace",
  );
  props.view.onCurViewChange((view) => {
    if (view) {
      curTab.as(view.name.split(".").pop());
    }
  });

  return StackLayout({
    header: [
      TabItem(
        "Workspace",
        "workspace",
        curTab,
        props.history,
        curProjectId,
      ),
      TabItem("History", "history", curTab, props.history, curProjectId),
    ],
    headerClass: "flex items-center gap-1 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800",
  }, [
    StandardSubViews({
      ...props,
    }),
  ]);
}

function TabItem(label, tabName, curTab, history, curProjectId) {
  return View(
    {
      class: cn([
        "px-4 py-1.5 rounded-md text-sm cursor-pointer transition-colors",
        computed(curTab, (t) =>
          t === tabName
            ? "bg-zinc-100 text-zinc-900 font-medium dark:bg-zinc-800 dark:text-zinc-100"
            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-zinc-100 dark:hover:bg-zinc-900",
        ),
      ]),
      onClick() {
        const routeName = `root.home_layout.project.${tabName}`;
        history.push(routeName, { id: curProjectId.value });
      },
    },
    label,
  );
}
