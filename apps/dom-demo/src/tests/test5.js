import {
  Show,
  View,
  Button,
  Row,
  Column,
  For,
  ref,
  refarr,
  computed,
  getDeps,
  printDepTree,
} from "@timeless/timeless";

export function Test5_RefarrForInShow() {
  const visible_ = ref(false);
  const items_ = refarr([
    { id: 1, text: "Item A" },
    { id: 2, text: "Item B" },
  ]);
  const status_ = ref("");

  function refresh() {
    status_.as(
      `visible: ${getDeps(visible_).length} | items: ${getDeps(items_).length}`,
    );
  }

  return View({ style: { "margin-bottom": "12px" } }, [
    View({ style: { "font-weight": "bold", "margin-bottom": "4px" } }, [
      "Test 5: refarr + For inside Show",
    ]),
    View({ style: { "font-size": "12px", color: "gray" } }, [
      "Show 隐藏后: For + 所有依赖都应清除",
    ]),
    View(
      {
        style: { "font-size": "11px", color: "yellow", "margin-bottom": "4px" },
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
            items_.push({
              id: Date.now(),
              text: `Item ${items_.value.length + 1}`,
            });
          },
        },
        ["Add"],
      ),
      Button(
        {
          onClick() {
            const vd = getDeps(visible_);
            const id = getDeps(items_);
            console.log(`[T5] visible_: ${vd.length}, items_: ${id.length}`);
            vd.forEach((x) => console.log(` - visible_: ${x.trackId}`));
            id.forEach((x) => console.log(` - items_: ${x.trackId}`));
            printDepTree([visible_, items_]);
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
        return Column({ gap: 2 }, [
          For({
            key: "id",
            each: items_,
            render(item, idx) {
              const textC = computed(item, (t) => t.text);
              return View(
                {
                  style: {
                    padding: "4px 8px",
                    "background-color": "rgba(0,255,255,0.2)",
                  },
                },
                ["(in Show) ", idx, " - ", textC],
              );
            },
            onMounted() {
              console.log(
                "[T5] For mount, items_ deps:",
                getDeps(items_).length,
              );
              printDepTree([items_]);
            },
            onUnmounted() {
              console.log(
                "[T5] For unmount, items_ deps:",
                getDeps(items_).length,
              );
              setTimeout(() => {
                console.log(
                  "[T5] after tick, items_ deps:",
                  getDeps(items_).length,
                );
                printDepTree([items_]);
              }, 100);
            },
          }),
        ]);
      },
    }),
  ]);
}
