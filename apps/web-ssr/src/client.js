// Client-side hydration script
// Loaded after UMD bundles: Timeless globals (View, ref, For, Show, Txt, render) are available

(function () {
  var View = Timeless.View;
  var Txt = Timeless.Txt;
  var For = Timeless.For;
  var ref = Timeless.ref;
  var refarr = Timeless.refarr;
  var render = Timeless.render;

  var count$ = ref(0);
  var fruits$ = refarr(["Apple", "Banana", "Cherry"]);

  function App() {
    return View({ type: "div", class: "app" }, [
      View({ type: "h1" }, ["Timeless SSR Demo"]),
      View({ type: "p", class: "info" }, [
        "Client hydrated. The page is now interactive!",
      ]),
      View({ type: "span", class: "ssr-badge client" }, ["Client Rendered"]),
      View({ type: "div", class: "counter-section" }, [
        View({ type: "h2" }, ["Counter"]),
        View({ type: "div", class: "counter" }, [
          View(
            {
              type: "button",
              onClick: function () {
                count$.value--;
              },
            },
            ["-"]
          ),
          View({ type: "span" }, [Txt(count$)]),
          View(
            {
              type: "button",
              onClick: function () {
                count$.value++;
              },
            },
            ["+"]),
        ]),
      ]),
      View({ type: "div", class: "list-section" }, [
        View({ type: "h2" }, ["Fruit List"]),
        For({
          each: fruits$,
          render: function (item) {
            return View({ type: "li", style: "padding:8px 12px;margin-bottom:4px;background:#fff;border-radius:6px;border:1px solid #e0e0e0;" }, [item]);
          },
        }),
        View({ type: "div", style: "margin-top: 12px; display: flex; gap: 8px;" }, [
          View(
            {
              type: "button",
              style: "padding:6px 12px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;",
              onClick: function () {
                var names = ["Mango", "Grape", "Peach", "Kiwi", "Pear", "Plum"];
                var pick = names[Math.floor(Math.random() * names.length)];
                fruits$.push(pick);
              },
            },
            ["Add Fruit"]
          ),
          View(
            {
              type: "button",
              style: "padding:6px 12px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;",
              onClick: function () {
                if (fruits$.value.length > 0) {
                  fruits$.splice(fruits$.value.length - 1, 1);
                }
              },
            },
            ["Remove Last"]
          ),
        ]),
      ]),
    ]);
  }

  // Replace SSR content with interactive client version
  var root = document.getElementById("root");
  root.innerHTML = "";
  render(App(), root);

  console.log("[SSR Demo] Client hydration complete");
})();
