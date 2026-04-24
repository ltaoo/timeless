Icon.register({
  check: {
    tag: "svg",
    attrs: {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      class: "lucide lucide-check-icon lucide-check",
    },
    children: [
      {
        tag: "path",
        attrs: {
          d: "M20 6 9 17l-5-5",
        },
      },
    ],
  },
});

function APageView() {
  const counter = ref(0);
  const a = computed(counter, (t) => {
    console.log("counter changed");
    return t * 2;
  });

  return View(
    {
      onMounted() {
        const timer = setInterval(() => {
          console.log("updater timer");
          counter.as((prev) => prev + 1);
        }, 1000);
        return function () {
          clearInterval(timer);
          // counter.destroy();
        };
      },
    },
    [
      View({ style: { padding: "12px" } }, [
        View({}, ["Hello World", counter]),
        View({}, [Icon({ name: "check" })]),
      ]),
    ],
  );
}

function BPageView() {
  return View({}, ["About"]);
}

function ApplicationRootView() {
  const href = ref("/home");

  return View({}, [
    // Link({ href: "/home" }, "Home"),
    // Link({ href: "/absout" }, "About"),
    View(
      {
        onClick() {
          href.as("/home");
        },
      },
      ["Home"],
    ),
    View(
      {
        onClick() {
          href.as("/absout");
        },
      },
      ["About"],
    ),

    Show({
      when: computed(href, (t) => t === "/home"),
      ok() {
        return APageView();
      },
    }),
    Show({
      when: computed(href, (t) => t === "/about"),
      ok() {
        return BPageView();
      },
    }),
  ]);
}

document.addEventListener("DOMContentLoaded", function () {
  Timeless.DOM.render(ApplicationRootView(), document.querySelector("#root"));
});
