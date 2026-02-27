function render($container) {
  const commitList = ref([
    { id: 1, message: "Initial commit" },
    { id: 2, message: "Add feature A" },
    { id: 3, message: "Fix bug B" },
  ]);

  const view$ = View({ class: classnames(["space-y-4 w-full"]) }, [
    View(
      {
        onClick() {
          // console.log("before commitList.value.splice", commitList);
          // set(commitList)
          commitList.splice(1, 0, {
            id: Date.now(),
            message: `New Commit ${Date.now()}`,
          });
        },
      },
      [Txt("Insert at index 1")],
    ),
    View({ class: classnames(["space-y-2"]) }, [
      For({
        each: commitList,
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
  ]);

  $container.appendChild(view$.$elm);
}

document.addEventListener("DOMContentLoaded", function () {
  const $root = document.querySelector("#root");
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  render($root);
});
