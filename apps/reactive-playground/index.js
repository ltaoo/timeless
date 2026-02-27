// console.log(cn);

function render($container) {
  const count = ref(1);
  const commitList = refarr([
    { id: 1, message: "Initial commit" },
    {
      id: 2,
      message: "Add feature A",
      authors: [
        {
          name: "litao",
          latest: "2025/01/01",
          percent: 0.01,
        },
        {
          name: "ltaoo",
          latest: "2025/01/02",
          percent: 0.03,
        },
      ],
    },
    { id: 3, message: "Fix bug B" },
  ]);

  const view$ = View({ class: ref(["space-y-4 w-full"]) }, [
    View({ style: "display: flex; flex-wrap: wrap; gap: 8px;" }, [
      View(
        {
          onClick() {
            const authors = commitList.get(1).get("authors");
            if (authors) {
              authors.get(1).set("percent", (prev) => {
                return prev + 0.02;
              });
            }
          },
        },
        [Txt("update percent")],
      ),
      View(
        {
          onClick() {
            const commit = commitList.get(0);
            commit.set("id", Date.now());
          },
        },
        [Txt("Replace at index 0")],
      ),
      View(
        {
          onClick() {
            commitList.as([
              {
                id: 4,
                message: "Add feature C",
              },
              {
                id: 5,
                message: "Add feature D",
              },
            ]);
          },
        },
        [Txt("Replace All Commits")],
      ),
      View(
        {
          onClick() {
            commitList.as([
              {
                id: 1,
                message: "Initial commit updated",
              },
              {
                id: 4,
                message: "Add feature C",
              },
              {
                id: 5,
                message: "Add feature D",
              },
            ]);
          },
        },
        [Txt("refresh with driver")],
      ),
      View(
        {
          onClick() {
            commitList.set(2, {
              id: Date.now(),
              message: `Refresh ${Date.now()}`,
            });
          },
        },
        [Txt("Update Special commit")],
      ),
      View(
        {
          onClick() {
            commitList.get(2).set("id", Date.now());
          },
        },
        [Txt("Update Special commit id")],
      ),
      View(
        {
          onClick() {
            commitList.push({
              id: Date.now(),
              message: `New Commit ${Date.now()}`,
            });
          },
        },
        [Txt("push commit")],
      ),
      View(
        {
          onClick() {
            commitList.unshift({
              id: Date.now(),
              message: `New Commit ${Date.now()}`,
            });
          },
        },
        [Txt("unshift commit")],
      ),
      View(
        {
          onClick() {
            commitList.insert(1, {
              id: Date.now(),
              message: `New Commit ${Date.now()}`,
            });
          },
        },
        [Txt("insert commit")],
      ),
    ]),
    Txt(count),
    For({
      key: "id",
      each: commitList,
      render(commit) {
        return View(
          {
            class:
              "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm flex justify-between items-center",
            onUnmounted() {
              uncomputed(commit);
            },
          },
          [
            Txt(
              computed(commit, (s) => {
                return `ID: ${s.id}`;
              }),
            ),
            Txt(
              computed(commit, (s) => {
                return s.message;
              }),
            ),
            Show(
              {
                when: computed(
                  commit,
                  (s) => s.authors && s.authors.length > 0,
                ),
                // onUnmounted() {
                //   console.log("the show can trigger onUnmounted？");
                // },
              },
              [
                For({
                  each: computed(commit, (s) => s.authors),
                  render(author) {
                    return View(
                      {
                        style: "margin-left: 10px;",
                        onUnmounted() {
                          console.log("before remove author ");
                          uncomputed(author);
                        },
                      },
                      [
                        Txt(
                          computed(author, (s) => {
                            return `${s.name} (${s.latest})`;
                          }),
                        ),
                        View({
                          style: computed(author, (s) => {
                            return `width: ${s.percent * 100}%; height: 5px; background-color: white;`;
                          }),
                        }),
                      ],
                    );
                  },
                }),
              ],
            ),
          ],
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
