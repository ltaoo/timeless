import { ref, computed } from "./core.js";
import { View } from "./view.js";
import { For } from "./for.js";

export function RouterSubViews(props) {
  const subViews = ref(props.view.subViews);
  const curSubView = ref(props.view.curView);

  props.view.onCurViewChange((view) => {
    curSubView.value = view;
  });
  props.view.onSubViewAppended((v) => {
    subViews.value.push(v);
  });

  const NotFoundPageView = (() => {
    if (props.NotFound) {
      return props.NotFound;
    }
    return View({ class: "not-found" }, ["Not Found"]);
  })();

  const nodes = [];

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
    render(subView) {
      const PageView = props.views[subView.name];
      if (!PageView) {
        return NotFoundPageView({
          history: props.history,
        });
      }
      const displayed = computed({ curSubView: curSubView }, (draft) => {
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
          style: computed({ displayed }, (draft) => {
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
