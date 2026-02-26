import { ref, computed } from "@timeless/reactive";
import { View } from "./view.js";
import { For } from "./for.js";

export function RouterSubViews(props: any) {
  const subViews = ref(props.view.subViews);
  const curSubView = ref(props.view.curView);

  props.view.onCurViewChange((view: any) => {
    curSubView.value = view;
  });
  props.view.onSubViewAppended((v: any) => {
    subViews.value.push(v);
  });

  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound;
    }
    return View({ class: "not-found" }, ["Not Found"]);
  })();

  const nodes: any[] = [];

  return For({
    class: props.class,
    each: subViews,
    onMounted() {
      // console.log("router sub views mounted", nodes);
      if (props.onMounted) {
        props.onMounted();
      }
      for (const node of nodes) {
        if (typeof node.onMounted === "function") {
          node.onMounted();
        }
      }
    },
    render(subView: any) {
      const PageView = props.views[subView.name];
      if (!PageView) {
        return NotFoundPageView({
          history: props.history,
        });
      }
      const displayed = computed({ curSubView: curSubView }, (draft: any) => {
        return [
          "page__wrap absolute inset-0",
          (() => {
            if (!draft.curSubView || !draft.curSubView.name) {
              return "hidden";
            }
            return draft.curSubView.name === subView.name
              ? "display"
              : "hidden";
          })(),
        ].join(" ");
      });

      return View(
        {
          class: displayed,
          style: computed({ displayed }, (draft: any) => {
            return draft.displayed.includes("hidden")
              ? "display: none;"
              : "display: block;";
          }),
        },
        [
          PageView({
            view: subView,
            history: props.history,
            onMounted() {
              nodes.push(this);
            },
          }),
        ],
      );
    },
  });
}
