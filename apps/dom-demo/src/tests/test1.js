import {
  Show,
  View,
  Button,
  Row,
  ref,
  getDeps,
  printDepTree,
  Fragment,
  computed,
} from "@timeless/timeless";

export function Test1_RefShow() {
  const visible_ = ref(true);
  const status_ = ref("");

  const t1_ = ref(true);

  function refresh() {
    console.log(t1_._deps);
    status_.as(`t1: ${getDeps(t1_).length}`);
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
        "Test 1: ref + Show",
      ]),
      View({ style: { "font-size": "12px", color: "gray" } }, [
        "Show subscribe visible_。隐藏后 visible_ 的 deps 应减少",
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
              const d = getDeps(t1_);
              console.log(`[T1] t1_ deps: ${d.length}`);
              d.forEach((x) => console.log(` - ${x.trackId}`));
              printDepTree([t1_]);
            },
          },
          ["getDeps + printDepTree"],
        ),
      ]),
      Show({
        when: visible_,
        onMounted() {
          console.log("[T1] mount, visible_ deps:", getDeps(t1_).length);
          printDepTree([t1_]);
        },
        onUnmounted() {
          console.log("[T1] unmount, visible_ deps:", getDeps(t1_).length);
          printDepTree([t1_]);
        },
        ok() {
          return Fragment({}, [
            Show({
              when: t1_,
              onMounted() {
                refresh();
              },
              ok() {
                return View(
                  {
                    style: {
                      padding: "8px",
                      "background-color": "rgba(0,255,0,0.2)",
                    },
                  },
                  [
                    "Show is visible!",
                    computed(t1_, (t) => {
                      return t ? "visible" : "hidden";
                    }),
                  ],
                );
              },
            }),
          ]);
        },
      }),
    ],
  );
}
