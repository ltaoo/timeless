// Use UMD global to ensure same module instance on client and server
const {
  For,
  Show,
  View,
  Label,
  Button,
  Fragment,
  Checkbox,
  Input,
  Portal,
  computed,
  ref,
  refarr,
  refobj,
  combine,
  tryget,
  classNames,
} = window.Timeless;
// const {} = window.Timeless.DOM;

/**
 * load() - Server-side data fetching
 * This runs only on the server before rendering
 */
export async function load({ query }) {
  // Simulate async data fetching
  return {
    count: 0,
    fruits: ["Apple", "Banana", "Cherry"],
    showList: true,
    message: "Hello from Timeless SSR!",
    visible: true,
    hoverBox1: false,
    hoverBox2: false,
    selectedFruit: "Apple",
    keyword: "Hot Keyword",
  };
}

/**
 * head() - Page metadata configuration
 */
export function head({ data }) {
  return {
    title: `Timeless SSR Demo - Count: ${data.count}`,
    meta: [
      { name: "description", content: "A demo of Timeless SSR framework" },
    ],
  };
}

/**
 * Page Component
 *
 * On server: data is plain object, renders to static HTML
 * On client: data is reactive, enables interactivity
 */
export default function Page({ data }) {
  const visible_ = ref(true);
  const t_ = ref(true);
  const background_ = ref("#ccc");
  const category_ = refarr([
    {
      id: 1,
      label: "计算机",
      selected: true,
    },
    {
      id: 2,
      label: "数学",
      selected: false,
    },
  ]);
  const cur_ = ref(null);

  const elm = View({}, [
    View(
      {
        onClick() {
          visible_.toggle();
        },
      },
      ["Hello"],
    ),
    View(
      {
        onClick() {
          t_.toggle();
        },
      },
      ["Test"],
    ),
    cur_,
    Show({
      when: visible_,
      ok() {
        return Portal({}, [
          View({}, [
            For({
              each: category_,
              render(cate) {
                // const cate_ = refobj(cate);
                return View(
                  {
                    class: classNames([
                      computed(cur_, (t) => {
                        return t === cate.id
                          ? "bg-accent text-accent-foreground"
                          : "";
                      }),
                    ]),
                    onMouseEnter() {
                      console.log("hhhhh");
                      cur_.as(cate.id);
                    },
                    onMouseLeave() {
                      cur_.as(null);
                    },
                  },
                  [cate.label],
                );
              },
            }),
          ]),
        ]);
        // return For({
        //   each: category_,
        //   render(cate) {
        //     return View(
        //       {
        //         style: {
        //           "margin-bottom": computed(cate, (t) => {
        //             return t.selected ? "0" : "12px";
        //           }),
        //         },
        //         onMounted() {
        //           console.log("view onMounted");
        //         },
        //         onUnmounted() {
        //           console.log("view onUnmounted");
        //         },
        //       },
        //       [computed(cate, (t) => t.label)],
        //     );
        //   },
        // });
      },
    }),
  ]);
  console.log(elm);
  return elm;
}
