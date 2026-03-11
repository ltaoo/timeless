function ApplicationRootView() {
  return View({}, [
    DropdownMenu(
      {
        store: new Timeless.ui.DropdownMenuCore({
          side: "right",
          align: "start",
          items: [
            new Timeless.ui.MenuItemCore({
              label: "Edit",
              onClick() {
                console.log("edit");
              },
            }),
            new Timeless.ui.MenuItemCore({
              label: "More",
              menu: new Timeless.ui.MenuCore({
                items: [
                  new Timeless.ui.MenuItemCore({
                    label: "Duplicated",
                    onClick() {
                      console.log("duplicated");
                    },
                  }),
                  new Timeless.ui.MenuItemCore({
                    label: "Duplicated2",
                    menu: new Timeless.ui.MenuCore({
                      items: [
                        new Timeless.ui.MenuItemCore({
                          label: "click it",
                          onClick() {
                            console.log("123");
                          },
                        }),
                      ],
                    }),
                    onClick() {
                      console.log("duplicated");
                    },
                  }),
                ],
              }),
              onClick() {
                console.log("more");
              },
            }),
            new Timeless.ui.MenuItemCore({
              label: "Delete",
              onClick() {
                console.log("delete");
              },
            }),
          ],
        }),
      },
      [
        Button(
          {
            variant: "outline",
            style: "margin-top: 120px; margin-left: 48px;",
            store: new Timeless.ui.ButtonCore({
              onClick() {
                console.log("click Open Menu");
              },
            }),
          },
          ["Open Menu"],
        ),
      ],
    ),
  ]);
}

document.addEventListener("DOMContentLoaded", function () {
  Timeless.render(ApplicationRootView(), document.querySelector("#root"));
});
