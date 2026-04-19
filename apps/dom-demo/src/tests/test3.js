import {
  Show,
  View,
  Button,
  Row,
  ref,
  refobj,
  computed,
  getDeps,
  printDepTree,
} from "@timeless/timeless";

export function Test3_RefobjComputedInShow() {
  const visible_ = ref(false);
  const theme_ = refobj({ color: "red", size: 14 });
  const status_ = ref("");

  function refresh() {
    status_.as(
      `visible: ${getDeps(visible_).length} | theme: ${getDeps(theme_).length}`,
    );
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
        "Test 3: refobj + computed inside Show",
      ]),
      View({ style: { "font-size": "12px", color: "gray" } }, [
        "Show 隐藏后，computed(theme_) 应 destroy",
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
            },
          },
          ["Toggle Show"],
        ),
        Button(
          {
            onClick() {
              theme_.set(
                "color",
                theme_.value.color === "red" ? "blue" : "red",
              );
            },
          },
          ["Toggle Theme"],
        ),
        Button(
          {
            onClick() {
              const d = getDeps(theme_);
              console.log(`[T3] theme_ deps: ${d.length}`);
              d.forEach((x) => console.log(` - ${x.trackId}`));
              printDepTree([theme_]);
            },
          },
          ["getDeps + printDepTree"],
        ),
      ]),
      Show({
        when: visible_,
        onMounted() {
          refresh();
        },
        ok() {
          const styleC = computed(theme_, (t) => ({
            padding: "8px",
            color: t.color,
            "font-size": t.size + "px",
          }));
          const colorC = computed(theme_, (t) => t.color);
          return View(
            {
              style: styleC,
              onMounted() {
                console.log("[T3] mount, theme_ deps:", getDeps(theme_).length);
                printDepTree([theme_]);
              },
              onUnmounted() {
                console.log(
                  "[T3] unmount, theme_ deps:",
                  getDeps(theme_).length,
                );
                printDepTree([theme_]);
              },
            },
            ["Theme: ", colorC],
          );
        },
      }),
    ],
  );
}
