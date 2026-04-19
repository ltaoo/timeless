import {
  View,
  Button,
  Show,
  Row,
  For,
  ref,
  refarr,
  computed,
  getDeps,
  printDepTree,
} from "@timeless/timeless";

export function Test4_RefarrFor() {
  const visible_ = ref(true);
  const status_ = ref("");

  const items_ = refarr([
    { id: 1, text: "Item A" },
    { id: 2, text: "Item B" },
  ]);

  function refresh() {
    status_.as(`items: ${getDeps(items_).length}`);
  }

  return View(
    {
      style: {
        "margin-bottom": "12px",
        "border-bottom": "1px solid rgba(255,255,255,0.2)",
        "padding-bottom": "12px",
      },
    },
    [
      View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
        "Test 4: refarr + For + computed",
      ]),
      View({ style: { "font-size": "12px", color: "gray" } }, [
        "删除 item 后应清除依赖",
      ]),
      View(
        {
          style: {
            "font-size": "11px",
            color: "yellow",
            "margin-bottom": "4px",
          },
        },
        [status_],
      ),
      Row({ gap: 8, style: { "margin-bottom": "8px" } }, [
        Button(
          {
            onClick() {
              visible_.as((v) => !v);
              console.log(visible_.value);
              refresh();
            },
          },
          ["Toggle Show"],
        ),
        Button(
          {
            onClick() {
              items_.push({
                id: Date.now(),
                text: `Item ${items_.value.length + 1}`,
              });
              refresh();
            },
          },
          ["Add"],
        ),
        Button(
          {
            onClick() {
              if (items_.length) {
                items_.pop();
              }
              refresh();
            },
          },
          ["Remove"],
        ),
        Button(
          {
            onClick() {
              items_.as([]);
              refresh();
            },
          },
          ["Clear"],
        ),
        Button(
          {
            onClick() {
              const d = getDeps(items_);
              console.log(`[T4] items_ deps: ${d.length}`);
              d.forEach((x) => console.log(` - ${x.trackId}`));
              printDepTree([items_]);
            },
          },
          ["getDeps + printDepTree"],
        ),
      ]),
      Show({
        when: visible_,
        ok() {
          return For({
            key: "id",
            each: items_,
            render(item, idx) {
              const textC = computed(item, (t) => t.text);
              const gap_ = computed(items_, (t) => {
                console.log("invoke --------", idx.value);
                return t.length * 2 + "px";
              });
              const length_ = computed(items_, (t) => t.length);
              return View(
                {
                  style: {
                    padding: "4px 8px",
                    "background-color": "rgba(255,255,255,0.1)",
                    "margin-bottom": "2px",
                    display: "flex",
                    gap: gap_,
                  },
                  onUnmounted() {
                    gap_.destroy();
                    length_.destroy();
                  },
                },
                [
                  idx,
                  " - ",
                  length_,
                  textC,
                  View(
                    {
                      style: { cursor: "pointer", color: "red" },
                      onClick() {
                        items_.remove(item);
                      },
                    },
                    ["[x]"],
                  ),
                ],
              );
            },
            onMounted() {
              refresh();
              console.log(
                "[T4] For mount, items_ deps:",
                getDeps(items_).length,
              );
              printDepTree([items_]);
            },
          });
        },
      }),
    ],
  );
}
