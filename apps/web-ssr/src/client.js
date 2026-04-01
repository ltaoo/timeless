// Client-side hydration script
// Loaded after UMD bundles: Timeless globals (View, ref, For, Show, render, hydrate) are available

(function () {
  var View = Timeless.View;
  var For = Timeless.For;
  var ref = Timeless.ref;
  var refarr = Timeless.refarr;
  var hydrate = Timeless.hydrate;

  var count_ = ref(0);
  var fruits$ = refarr(["Apple", "Banana", "Cherry"]);

  // App structure must match the server-rendered HTML for proper hydration
  function App() {
    return View({ as: "div", class: "app" }, [
      View({ as: "h1" }, ["Timeless SSR Demo"]),
      View({ as: "p", class: "info" }, [
        "Rendered on server. JavaScript will make it interactive.",
      ]),
      View({ as: "div", class: "counter-section" }, [
        View({ as: "h2" }, ["Counter"]),
        View({ as: "div", class: "counter" }, [
          View(
            {
              as: "button",
              onClick: function () {
                count_.as((prev) => prev - 1);
              },
            },
            ["-"],
          ),
          View({ as: "span" }, [count_]),
          View(
            {
              as: "button",
              onClick: function () {
                count_.as((prev) => prev + 1);
              },
            },
            ["+"],
          ),
        ]),
      ]),
      View({ as: "div", class: "list-section" }, [
        View({ as: "h2" }, ["Fruit List"]),
        View({ as: "ul" }, [
          For({
            each: fruits$,
            render(item) {
              return View({ as: "li" }, [item]);
            },
          }),
        ]),
        View(
          { as: "div", style: "margin-top: 12px; display: flex; gap: 8px;" },
          [
            View(
              {
                as: "button",
                style:
                  "padding:6px 12px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;",
                onClick() {
                  var names = [
                    "Mango",
                    "Grape",
                    "Peach",
                    "Kiwi",
                    "Pear",
                    "Plum",
                  ];
                  var pick = names[Math.floor(Math.random() * names.length)];
                  fruits$.push(pick);
                },
              },
              ["Add Fruit"],
            ),
            View(
              {
                as: "button",
                style:
                  "padding:6px 12px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;",
                onClick() {
                  fruits$.pop();
                },
              },
              ["Remove Last"],
            ),
          ],
        ),
      ]),
    ]);
  }

  // Hydrate: reuse existing SSR DOM nodes, attach event listeners and reactive subscriptions
  var root = document.getElementById("root");
  var originalFirstChild = root.firstChild;

  hydrate(App(), root);

  // Verify DOM was reused (for debugging)
  console.log("[SSR] Hydration complete");
  console.log("[SSR] DOM reused:", root.firstChild === originalFirstChild);
})();
