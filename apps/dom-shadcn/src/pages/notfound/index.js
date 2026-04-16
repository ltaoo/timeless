import { View, Icon } from "@timeless/timeless";

export default function NotFoundPageView(props) {
  return View(
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: "16px",
      },
    },
    [
      Icon({ name: "alert-circle", size: 48 }),
      View(
        {
          style: {
            fontSize: "24px",
            fontWeight: "bold",
          },
        },
        ["404"],
      ),
      View(
        {
          style: {
            color: "#71717a",
          },
        },
        ["Page not found"],
      ),
    ],
  );
}
