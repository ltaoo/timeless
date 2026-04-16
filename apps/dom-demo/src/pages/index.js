import {
  View,
  Button,
  Show,
  Fragment,
  DismissableLayer,
  Portal,
  Popper,
  computed,
  ref,
  refobj,
} from "@timeless/timeless";

export default function Page(props, children) {
  const visible_ = ref(false);
  const popper_ = refobj({ x: 0, y: 0, placed: false });
  const dissmissable$ = DismissableLayer();

  const element = View({ style: { padding: "16px" } }, [
    View(
      {
        style: {
          padding: "16px",
        },
      },
      [
        props.title,
        Button(
          {
            onClick(event) {
              console.log("handle click", visible_.value);
              visible_.as((prev) => {
                return !prev;
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
      ok() {
        return Portal(
          {},
          [
            View(
              {
                style: {
                  padding: "4px",
                  "background-color": "#fff",
                },
              },
              [
                View(
                  {},
                  ["first content in body"],
                ),
              ],
            ),
          ],
        );
      },
    }),
    Fragment({}, children),
  ]);

  return element;
}
