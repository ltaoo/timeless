import { Section, Item } from "@/components/index.js";

export function LogicTestPageView() {
  const commitList = ref([
    { id: 1, message: "Initial commit" },
    { id: 2, message: "Add feature A" },
    { id: 3, message: "Fix bug B" },
  ]);

  return View({ class: classnames(["space-y-8"]) }, [
    Item("Commit List", [
      View({ class: classnames(["space-y-4 w-full"]) }, [
        Button(
          {
            store: new Timeless.ui.ButtonCore({
              onClick() {
                // console.log("before commitList.value.splice", commitList);
                // set(commitList)
                debugger;
                commitList.splice(1, 0, {
                  id: Date.now(),
                  message: `New Commit ${Date.now()}`,
                });
              },
            }),
            size: "sm",
          },
          [Txt("Insert at index 1")],
        ),
        View({ class: classnames(["space-y-2"]) }, [
          For({
            each: commitList.value,
            render(commit) {
              return View(
                {
                  class: classnames([
                    "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm flex justify-between items-center",
                  ]),
                },
                [
                  Txt(commit.message),
                  View({ class: classnames(["text-xs text-zinc-400"]) }, [
                    Txt(`ID: ${commit.id}`),
                  ]),
                ],
              );
            },
          }),
        ]),
      ]),
    ]),
  ]);
}
