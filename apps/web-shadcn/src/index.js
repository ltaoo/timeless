function ApplicationRootView() {
  return View({}, [
    // DropdownMenu(
    //   {
    //     store: new Timeless.ui.DropdownMenuCore({
    //       side: "right",
    //       align: "start",
    //       items: [
    //         new Timeless.ui.MenuItemCore({
    //           label: "Edit",
    //           onClick() {
    //             console.log("edit");
    //           },
    //         }),
    //         new Timeless.ui.MenuItemCore({
    //           label: "More",
    //           menu: new Timeless.ui.MenuCore({
    //             items: [
    //               new Timeless.ui.MenuItemCore({
    //                 label: "Duplicated",
    //                 onClick() {
    //                   console.log("duplicated");
    //                 },
    //               }),
    //               new Timeless.ui.MenuItemCore({
    //                 label: "Duplicated2",
    //                 menu: new Timeless.ui.MenuCore({
    //                   items: [
    //                     new Timeless.ui.MenuItemCore({
    //                       label: "click it",
    //                       onClick() {
    //                         console.log("123");
    //                       },
    //                     }),
    //                   ],
    //                 }),
    //                 onClick() {
    //                   console.log("duplicated");
    //                 },
    //               }),
    //             ],
    //           }),
    //           onClick() {
    //             console.log("more");
    //           },
    //         }),
    //         new Timeless.ui.MenuItemCore({
    //           label: "Delete",
    //           onClick() {
    //             console.log("delete");
    //           },
    //         }),
    //       ],
    //     }),
    //   },
    //   [
    //     Button(
    //       {
    //         variant: "outline",
    //         style: "margin-top: 120px; margin-left: 48px;",
    //         store: new Timeless.ui.ButtonCore({
    //           onClick() {
    //             console.log("click Open Menu");
    //           },
    //         }),
    //       },
    //       ["Open Menu"],
    //     ),
    //   ],
    // ),
    (() => {
      const menu$ = new Timeless.ui.ContextMenuCore({
        items: [
          new Timeless.ui.MenuItemCore({
            label: "Cut",
            onClick() {
              console.log("cut");
            },
          }),
          new Timeless.ui.MenuItemCore({
            label: "Copy",
            onClick() {
              console.log("copy");
            },
          }),
          new Timeless.ui.MenuItemCore({
            label: "Paste",
            onClick() {
              console.log("paste");
            },
          }),
          new Timeless.ui.MenuItemCore({
            label: "Delete",
            onClick() {
              console.log("delete");
            },
          }),
          new Timeless.ui.MenuItemCore({
            label: "More",
            menu: new Timeless.ui.MenuCore({
              items: [
                new Timeless.ui.MenuItemCore({
                  label: "Edit",
                  onClick() {
                    console.log("edit");
                  },
                }),
                new Timeless.ui.MenuItemCore({
                  label: "Duplicate",
                  onClick() {
                    console.log("duplicate");
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
            onClick() {
              console.log("delete");
            },
          }),
        ],
      });
      return ContextMenu({ store: menu$ }, [
        View(
          {
            class:
              "flex items-center justify-center w-[300px] h-[150px] rounded-md border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 select-none",
          },
          [Txt("Right click here")],
        ),
      ]);
    })(),
  ]);
}

document.addEventListener("DOMContentLoaded", function () {
  Timeless.render(ApplicationRootView(), document.querySelector("#root"));
});
