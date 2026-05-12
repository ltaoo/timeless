import {
  ref,
  View,
  Show,
  Portal,
  Fragment,
  For,
  ErrorBoundary,
  refarr,
  refobj,
  computed,
  combine,
  LazyView,
} from "@timeless/timeless";
import { render } from "@timeless/timeless-dom";

import { Test1_RefShow } from "./tests/test1.js";
import { Test2_RefComputedStyle } from "./tests/test2.js";
import { Test3_RefobjComputedInShow } from "./tests/test3.js";
import { Test4_RefarrFor } from "./tests/test4.js";
import { Test5_RefarrForInShow } from "./tests/test5.js";

function SubContent() {
  const data = refarr([
    {
      label: "World",
      value: props.value,
    },
  ]);

  return View({}, [
    For({
      each: data,
      render(data) {
        return View(
          {
            onClick() {
              console.log(data.a.b);
            },
          },
          ["Hello", data.label],
        );
      },
    }),
  ]);
}

function Content(props, children) {
  // console.log("___", _a);
  return Show({
    when: props.visible_,
    ok() {
      return Portal({}, [View({}, [SubContent()])]);
    },
  });
}

function ApplicationView() {
  const visible_ = ref(true);
  const up_ = ref(true);
  const down_ = ref(true);

  const page = refobj({
    page: 1,
    pageSize: 10,
    total: 1231,
  });
  const totalPages = computed(page, (t) => Math.ceil(t.total / t.pageSize));

  return View({ style: { display: "flex", color: "#fff", padding: "20px" } }, [
    View(
      {
        style: {
          padding: "4px 8px",
          background: computed(page, (t) =>
            t.page === 1 ? "#007bff" : "#f0f0f0",
          ),
          "border-radius": "4px",
          cursor: "pointer",
          "font-size": "14px",
          color: computed(page, (t) => (t.page === 1 ? "#fff" : "#333")),
        },
        onClick() {
          if (page.value.page === 1) {
            return;
          }
          page.as((p) => ({ ...p, page: 1 }));
        },
        onWheel() {
          console.log("wheel");
        },
      },
      ["1"],
    ),
    Show({
      when: computed(page, (t) => {
        const totalPages = Math.ceil(t.total / t.pageSize);
        if (t.page > 3) {
          return true;
        }
        return false;
      }),
      ok() {
        return View(
          {
            style: {
              padding: "4px 8px",
              "font-size": "14px",
            },
          },
          ["..."],
        );
      },
    }),
    For({
      each: computed(page, (t) => {
        const totalPages = Math.ceil(t.total / t.pageSize);
        const pages = [];
        const start = Math.max(2, t.page - 1);
        const end = Math.min(totalPages - 1, t.page + 1);
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        return pages;
      }),
      render(p) {
        return View(
          {
            style: {
              padding: "4px 8px",
              background: computed(page, (t) =>
                t.page === p ? "#007bff" : "#f0f0f0",
              ),
              "border-radius": "4px",
              cursor: "pointer",
              "font-size": "14px",
              color: computed(page, (t) => (t.page === p ? "#fff" : "#333")),
            },
            onClick() {
              console.log("[]click page", p, page.value.page);
              if (p === page.value.page) {
                return;
              }
              page.as((pg) => ({ ...pg, page: p }));
            },
          },
          [p],
        );
      },
    }),
    Show({
      when: computed(page, (t) => {
        const totalPages = Math.ceil(t.total / t.pageSize);
        if (t.page < totalPages - 2 && totalPages > 3) {
          return true;
        }
        return false;
      }),
      ok() {
        return View(
          {
            style: {
              padding: "4px 8px",
              "font-size": "14px",
            },
          },
          ["..."],
        );
      },
    }),
    Show({
      when: computed(totalPages, (t) => {
        return t > 1;
      }),
      ok() {
        return View(
          {
            style: {
              padding: "4px 8px",
              background: combine({ page, totalPages }, (t) =>
                t.page.page === t.totalPages ? "#007bff" : "#f0f0f0",
              ),
              "border-radius": "4px",
              cursor: "pointer",
              "font-size": "14px",
              color: combine({ page, totalPages }, (t) =>
                t.page === t.totalPages ? "#fff" : "#333",
              ),
            },
            onClick() {
              const totalPages = Math.ceil(
                page.value.total / page.value.pageSize,
              );
              page.as((p) => ({ ...p, page: totalPages }));
            },
          },
          [computed(page, (t) => Math.ceil(t.total / t.pageSize))],
        );
      },
    }),
    // Fragment({}, [
    //   View(
    //     {
    //       onClick() {
    //         visible_.as((prev) => !prev);
    //       },
    //     },
    //     ["Trigger"],
    //   ),
    //   ErrorBoundary(
    //     {
    //       throwToGlobal: true,
    //       fallback(error) {
    //         const title = error?.name || "Error";
    //         const message = error?.message || String(error);
    //         const stack = error?.stack || `${title}: ${message}`;

    //         return View(
    //           {
    //             style: {
    //               color: "#d93025",
    //               border: "1px solid #f1b7b3",
    //               borderRadius: "8px",
    //               background: "#fff",
    //               padding: "12px 14px",
    //               marginTop: "12px",
    //               fontFamily:
    //                 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    //               boxShadow: "0 1px 2px rgba(60,64,67,0.15)",
    //             },
    //           },
    //           [
    //             View(
    //               {
    //                 style: {
    //                   fontSize: "13px",
    //                   fontWeight: "600",
    //                   marginBottom: "8px",
    //                 },
    //               },
    //               [`${title}: ${message}`],
    //             ),
    //             View(
    //               {
    //                 style: {
    //                   fontSize: "12px",
    //                   lineHeight: "1.5",
    //                   whiteSpace: "pre-wrap",
    //                   color: "#5f6368",
    //                 },
    //               },
    //               [stack],
    //             ),
    //           ],
    //         );
    //       },
    //     },
    //     () => [
    //       For({
    //         each: [{}],
    //         render() {
    //           return LazyView(
    //             {},
    //             () => new Promise((resolve) => {
    //               setTimeout(() => {
    //                 resolve(SubContent);
    //               }, 800);
    //             }),
    //           );
    //         },
    //       }),
    //       // Content({ visible_ }, () => [
    //       //   Show({
    //       //     when: up_,
    //       //     ok() {
    //       //       return View({}, "Up");
    //       //     },
    //       //   }),
    //       //   View({}, ["Content"]),
    //       //   Show({
    //       //     when: down_,
    //       //     ok() {
    //       //       return View({}, "Down");
    //       //     },
    //       //   }),
    //       // ]),
    //     ],
    //   ),
    // ]),

    // View(
    //   {
    //     style: { fontSize: "18px", fontWeight: "bold", marginBottom: "16px" },
    //   },
    //   ["Dep Leak Test - Independent Tests"],
    // ),
    // Test1_RefShow(),
    // Test2_RefComputedStyle(),
    // Test3_RefobjComputedInShow(),
    // Test4_RefarrFor(),
    // Test5_RefarrForInShow(),
  ]);
}

render(ApplicationView({}), document.getElementById("root"));
