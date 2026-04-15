import {
  View,
  Button,
  Show,
  Fragment,
  DismissableLayer,
  Portal,
  Popper,
  computed,
  patch,
  ref,
  refobj,
} from "@timeless/timeless";

export default function Page(props, children) {
  const visible_ = ref(false);
  const popper_ = refobj({
    x: 0,
    y: 0,
    placed: false,
  });
  const dissmissable$ = DismissableLayer();

  const element = View({ style: { padding: "24px" } }, [
    View({ style: { fontSize: "24px", color: "#fff", marginBottom: "12px" } }, [
      "Hello Timeless",
    ]),
    Button(
      {
        style: { padding: "8px 16px", color: "blue", backgroundColor: "#333" },
      },
      ["Click it"],
    ),
    View({ style: { color: "#888", "margin-top": "12px" } }, [
      "Edit this file and save to see HMR in action",
    ]),
    Fragment({}, children),
    View(
      {
        style: {
          padding: "20px",
        },
      },
      [
        Button(
          {
            onMounted(event) {
              // console.log(event.target);
              const { x, y, width, height } =
                event.target.getBoundingClientRect();
              dissmissable$.addIgnore({
                x,
                y,
                width,
                height,
              });
              console.log("[Button] onMounted", x, y, width, height);
              popper_.as({
                x: x,
                y: y + height + 2,
                placed: false,
              });
            },
            onClick(event) {
              // event.stopPropagation();
              visible_.as((prev) => {
                return !prev;
              });
              popper_.assign({
                placed: true,
              });
            },
          },
          ["Click it"],
        ),
      ],
    ),
    Show({
      when: visible_,
      onMounted() {
        console.log("[Show] onMounted");
      },
      onUnmounted() {
        console.log("[Show] onUnmounted");
      },
      ok() {
        return Portal(
          {
            onMounted() {
              console.log("[Portal in Show] onMounted");
            },
            onUnmounted() {
              console.log("[Portal in Show] onUnmounted");
            },
          },
          [
            Popper(
              {
                placement: "top",
                strategy: "absolute",
                x: computed(popper_, (t) => t.x),
                y: computed(popper_, (t) => t.y),
                placed: computed(popper_, (t) => t.placed),
                onMounted(event) {
                  const rect = event.target.getBoundingClientRect();
                  console.log("[Popper in Portal] onMounted", rect);
                },
                onUnmounted() {
                  console.log("[Popper in Portal] onUnmounted");
                },
              },
              [
                View(
                  {
                    style: {
                      "background-color": "#fff",
                    },
                    onMounted(event) {
                      const rect = event.target.getBoundingClientRect();
                      console.log("[View in Popper] onMounted", rect);
                      dissmissable$.addIgnore({
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                      });
                    },
                    onUnmounted() {
                      console.log("[View in Popper] onUnmounted");
                    },
                  },
                  [
                    View(
                      {
                        onMounted() {
                          console.log("text1 in View mounted");
                        },
                      },
                      ["first content in body _update it"],
                    ),
                    View(
                      {
                        onMounted(event) {
                          console.log(
                            "text2 in View mounted",
                            event.target.getBoundingClientRect(),
                          );
                        },
                      },
                      ["second content in body"],
                    ),
                  ],
                ),
              ],
            ),
          ],
        );
      },
    }),
  ]);
  if (import.meta.hot) {
    if (!import.meta.hot.data.elements) {
      import.meta.hot.data.elements = [];
    }
    import.meta.hot.data.elements.push(element);
  }
  return element;
}

// Vite HMR
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    const elements = import.meta.hot.data.elements;
    if (!newModule || !elements || !elements.length) return;
    elements.forEach((currentElement) => {
      const newElement = newModule.default();
      const ok = patch(currentElement, newElement);
      console.log("[HMR] patch result:", ok);
    });
    import.meta.hot.data.elements = [];
  });
}
