import { View, ref } from "@timeless/timeless";
import { Button, Input, ui } from "@timeless/shadcn";

export default function LoginView(props) {
  const loading = ref(false);

  return View(
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "24px",
      },
    },
    [
      View(
        {
          style: {
            fontSize: "24px",
            fontWeight: "bold",
          },
        },
        ["Login"],
      ),
      View(
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "300px",
          },
        },
        [
          Input({
            store: new ui.InputCore({ placeholder: "Username" }),
          }),
          Input({
            store: new ui.InputCore({
              type: "password",
              placeholder: "Password",
            }),
          }),
          Button(
            {
              store: new ui.ButtonCore({
                onClick() {
                  props.history.push("root.home_layout.index.general");
                },
              }),
            },
            ["Login"],
          ),
        ],
      ),
    ],
  );
}
