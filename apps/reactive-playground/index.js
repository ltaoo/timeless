// console.log(cn);

function render($container) {
  const commitList = ref([
    { id: 1, message: "Initial commit" },
    { id: 2, message: "Add feature A" },
    { id: 3, message: "Fix bug B" },
  ]);

  const view$ = View({ class: ref(["space-y-4 w-full"]) }, [
    View(
      {
        onClick() {
          //   commitList.to([
          //     { id: 4, message: "Add feature C" },
          //     { id: 5, message: "Fix feature C" },
          //     { id: 6, message: "Release 1.0.0" },
          //   ]);
          commitList.splice(1, 0, {
            id: Date.now(),
            message: `New Commit ${Date.now()}`,
          });
          //   commitList.set(2, {
          //     id: Date.now(),
          //     message: `Refresh ${Date.now()}`,
          //   });
          setTimeout(() => {
            commitList.set(2, {
              id: Date.now(),
              message: `Refresh ${Date.now()}`,
            });
          }, 3000);
          //   commitList.push({
          //     id: Date.now(),
          //     message: `New Commit ${Date.now()}`,
          //   });
        },
      },
      [Txt("Insert at index 1")],
    ),
    For({
      each: commitList,
      render(commit) {
        return View(
          {
            class: ref([
              "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm flex justify-between items-center",
            ]),
          },
          [Txt(`ID: ${commit.id}`), Txt(commit.message)],
        );
      },
    }),
  ]);

  $container.appendChild(view$.render());
}

document.addEventListener("DOMContentLoaded", function () {
  const $root = document.querySelector("#root");
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  render($root);
});
