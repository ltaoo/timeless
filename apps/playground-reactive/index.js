// console.log(cn);
const { ref, refarr, computed, View, Button, For, Show, Match } = Timeless;

function create_match_example_model() {
  const when_ = ref("loading");

  return {
    when_,
    select(value) {
      when_.as(value);
    },
  };
}

function MatchExample(model) {
  return View(
    {
      class:
        "space-y-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-700",
    },
    [
      View({ class: "font-medium" }, ["Match cases.else 示例"]),
      View({ class: "flex flex-wrap gap-2" }, [
        Button({ onClick: () => model.select("loading") }, ["loading"]),
        Button({ onClick: () => model.select("success") }, ["success"]),
        Button({ onClick: () => model.select("timeout") }, [
          "timeout（未匹配）",
        ]),
      ]),
      Match({
        when: model.when_,
        cases: {
          loading: () => View({}, ["正在加载"]),
          success: () => View({}, ["加载成功"]),
          else: (value) => View({}, [`默认分支，实际 when 值：${value}`]),
        },
      }),
    ],
  );
}

function App(match_example_model) {
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

  return View(
    {
      class: "space-y-4 w-full",
      onMounted() {
        setTimeout(() => {
          commitList.set([]);
        }, 3000);
      },
    },
    [
      MatchExample(match_example_model),
      View({ style: { display: "flex", "flex-wrap": "wrap", gap: "8px" } }, [
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
          ["update percent"],
        ),
        View(
          {
            onClick() {
              const commit = commitList.get(0);
              commit.set("id", Date.now());
            },
          },
          ["Replace at index 0"],
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
          ["Replace All Commits"],
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
          ["refresh with driver"],
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
          ["Update Special commit"],
        ),
        View(
          {
            onClick() {
              commitList.delete(1);
            },
          },
          ["Delete Special commit"],
        ),
        View(
          {
            onClick() {
              commitList.get(2).set("id", Date.now());
            },
          },
          ["Update Special commit id"],
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
          ["push commit"],
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
          ["unshift commit"],
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
          ["insert commit"],
        ),
      ]),
      count,
      For({
        // key: "id",
        each: commitList,
        render(commit, idx) {
          console.log("render commit", commit);
          return View(
            {
              class:
                "p-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm flex justify-between items-center",
              onUnmounted() {
                uncomputed(commit);
              },
            },
            [
              computed(commit, (s) => {
                return `ID: ${s.id}`;
              }),
              computed(commit, (s) => {
                return s.message;
              }),
              Button(
                {
                  onClick() {
                    commitList.remove(commit);
                  },
                },
                ["Delete"],
              ),
              Show({
                when: computed(
                  commit,
                  (s) => s.authors && s.authors.length > 0,
                ),
                // onUnmounted() {
                //   console.log("the show can trigger onUnmounted？");
                // },
                ok() {
                  return [
                    For({
                      each: computed(commit, (s) => s.authors),
                      render(author) {
                        return View(
                          {
                            style: { "margin-left": "10px" },
                            onUnmounted() {
                              console.log("before remove author ");
                              uncomputed(author);
                            },
                          },
                          [
                            computed(author, (s) => {
                              return `${s.name} (${s.latest})`;
                            }),
                            View({
                              style: computed(author, (s) => {
                                return `width: ${s.percent * 100}%; height: 5px; background-color: white;`;
                              }),
                            }),
                          ],
                        );
                      },
                    }),
                  ];
                },
              }),
            ],
          );
        },
      }),
    ],
  );

  // $container.appendChild(view$.render());
}

document.addEventListener("DOMContentLoaded", function () {
  const $root = document.querySelector("#root");
  if (!$root) {
    console.error("[Render] Root element not found");
    return;
  }
  const match_example_model = create_match_example_model();
  Timeless.DOM.render(App(match_example_model), $root);
});
