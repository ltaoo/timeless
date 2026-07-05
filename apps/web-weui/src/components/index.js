export function Section(title, children) {
  return View(
    {
      style: {
        "margin-bottom": "32px",
      },
    },
    [
      View(
        {
          style: {
            "font-size": "var(--weui-FONT-SIZE-SM)",
            "font-weight": "600",
            color: "var(--weui-FG-1)",
            "text-transform": "uppercase",
            "letter-spacing": "0.5px",
            "margin-bottom": "12px",
          },
        },
        [title],
      ),
      View(
        {
          style: {
            "padding-left": "4px",
          },
        },
        children,
      ),
    ],
  );
}

export function Item(label, children) {
  return View(
    {
      style: {
        "margin-bottom": "16px",
      },
    },
    [
      View(
        {
          style: {
            "font-size": "var(--weui-FONT-SIZE-SM)",
            color: "var(--weui-FG-2)",
            "margin-bottom": "8px",
          },
        },
        [label],
      ),
      View(
        {
          style: {
            display: "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
            gap: "12px",
          },
        },
        children,
      ),
    ],
  );
}
