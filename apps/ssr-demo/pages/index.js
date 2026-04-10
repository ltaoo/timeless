// Use UMD global to ensure same module instance on client and server
const { View, For, Show, Button, styleNames, computed, ref, refarr } = window.Timeless;

/**
 * load() - Server-side data fetching
 * This runs only on the server before rendering
 */
export async function load({ query }) {
  // Simulate async data fetching
  return {
    count: 0,
    fruits: ["Apple", "Banana", "Cherry"],
    showList: true,
    message: "Hello from Timeless SSR!",
    visible: true,
    hoverBox1: false,
    hoverBox2: false,
    selectedFruit: "Apple",
  };
}

/**
 * head() - Page metadata configuration
 */
export function head({ data }) {
  return {
    title: `Timeless SSR Demo - Count: ${data.count}`,
    meta: [
      { name: "description", content: "A demo of Timeless SSR framework" },
    ],
  };
}

/**
 * Page Component
 *
 * On server: data is plain object, renders to static HTML
 * On client: data is reactive, enables interactivity
 */
export default function Page({ data }) {
  const count = ref(data.count);
  const visible = ref(data.visible);
  const content = ref("content");
  const hoverBox1 = ref(data.hoverBox1);
  const hoverBox2 = ref(data.hoverBox2);
  const showList = ref(data.showList);
  const fruits = refarr(data.fruits);
  const selectedFruit = ref(data.selectedFruit);

  return View({ class: "app", style: appStyle }, [
    // Header
    View({ style: titleStyle }, [data.message]),

    View({ style: infoStyle }, [
      "This page is server-rendered and hydrated on the client.",
    ]),

    // Counter Section
    View({ style: sectionStyle }, [
      View({ style: subtitleStyle }, ["Counter"]),
      View({ style: counterStyle }, [
        Button(
          {
            style: buttonStyle,
            onClick() {
              count.as((v) => v - 1);
            },
          },
          ["-"],
        ),
        View({ as: "span", style: countStyle }, [count]),
        Button(
          {
            style: buttonStyle,
            onClick() {
              count.as((v) => v + 2);
            },
          },
          ["+"],
        ),
      ]),
    ]),
    Button(
      {
        onClick() {
          visible.as((v) => !v);
        },
      },
      ["Toggle Content"],
    ),
    Button(
      {
        onClick() {
          content.as((prev) => prev + "_new");
        },
      },
      ["update Content"],
    ),
    Show({
      when: visible,
      ok() {
        return [View({}, [content])];
      },
    }),

    // Mouse Events Section
    View({ as: "section", style: sectionStyle }, [
      View({ as: "h2", style: subtitleStyle }, ["Mouse Events Test"]),
      View({ as: "p", style: infoStyle }, [
        "Hover over the boxes to test mouseenter/mouseleave events:",
      ]),
      View({ style: hoverBoxContainerStyle }, [
        View(
          {
            style: hoverBoxStyle,
            onMouseEnter() {
              console.log("Box 1: mouseenter triggered");
              hoverBox1.as(true);
            },
            onMouseLeave() {
              console.log("Box 1: mouseleave triggered");
              hoverBox1.as(false);
            },
          },
          [
            Show({
              when: hoverBox1,
              ok() {
                return ["Hovering!"];
              },
              else() {
                return ["Hover me"];
              },
            }),
          ],
        ),
        View(
          {
            style: hoverBoxStyle,
            onMouseEnter() {
              console.log("Box 2: mouseenter triggered");
              hoverBox2.as(true);
            },
            onMouseLeave() {
              console.log("Box 2: mouseleave triggered");
              hoverBox2.as(false);
            },
          },
          [
            Show({
              when: hoverBox2,
              ok() {
                return ["Hovering!"];
              },
              else() {
                return ["Hover me"];
              },
            }),
          ],
        ),
      ]),
    ]),

    // List Section
    View({ style: sectionStyle }, [
      View({ style: subtitleStyle }, ["Fruit List"]),
      Button(
        {
          style: toggleButtonStyle,
          onClick() {
            showList.as((v) => !v);
          },
        },
        ["Toggle List"],
      ),

      Show({
        when: showList,
        ok() {
          return [
            View({ style: listStyle }, [
              For({
                each: fruits,
                render(item, idx) {
                  const itemStyle = computed(selectedFruit, (sel) => {
                    // console.log("compare", sel, item);
                    const selected = sel === item;
                    return {
                      cursor: "pointer",
                      background: selected ? "#e0f2fe" : "white",
                      "border-color": selected ? "#38bdf8" : "#e5e7eb",
                    };
                  });
                  // console.log("[]fruit render");
                  return View(
                    {
                      style: styleNames([listItemStyle, itemStyle]),
                      onClick() {
                        selectedFruit.as(item);
                      },
                    },
                    [
                      computed(idx, (t) => `${t + 1}、`),
                      View({ as: "span" }, [item]),
                    ],
                  );
                },
              }),
            ]),

            View({ style: buttonGroupStyle }, [
              Button(
                {
                  style: buttonStyle,
                  onClick: () => {
                    const names = ["Mango", "Grape", "Peach", "Kiwi", "Pear"];
                    const pick =
                      names[Math.floor(Math.random() * names.length)];
                    fruits.push(pick);
                  },
                },
                ["Add Fruit"],
              ),
              Button(
                {
                  style: buttonStyle,
                  onClick: () => {
                    if (fruits.length > 0) {
                      fruits.pop();
                    }
                  },
                },
                ["Remove Last"],
              ),
            ]),

            View(
              {
                style: {
                  margin: "12px 0 8px",
                  color: "#666",
                  "font-size": "14px",
                },
              },
              ["Click an item to select, then reorder:"],
            ),
            View({ style: buttonGroupStyle }, [
              Button(
                {
                  style: buttonStyle,
                  onClick() {
                    const idx = fruits.indexOf(selectedFruit.value);
                    console.log("up", idx);
                    if (idx > 0) {
                      fruits.up(idx);
                    }
                  },
                },
                ["↑ Up"],
              ),
              Button(
                {
                  style: buttonStyle,
                  onClick() {
                    const idx = fruits.indexOf(selectedFruit.value);
                    console.log("down", idx);
                    if (idx < fruits.length - 1) fruits.down(idx);
                  },
                },
                ["↓ Down"],
              ),
              View(
                {
                  style: buttonStyle,
                  onClick() {
                    const idx = fruits.indexOf(selectedFruit.value);
                    fruits.moveToFirst(idx);
                  },
                },
                ["⇤ First"],
              ),
              Button(
                {
                  style: buttonStyle,
                  onClick() {
                    const idx = fruits.indexOf(selectedFruit.value);
                    fruits.moveToLast(idx);
                  },
                },
                ["Last ⇥"],
              ),
            ]),
            View({ style: buttonGroupStyle }, [
              Button(
                {
                  style: buttonStyle,
                  onClick() {
                    const idx = fruits.indexOf(selectedFruit.value);
                    if (idx < fruits.length - 1) {
                      fruits.swap(idx, idx + 1);
                    }
                  },
                },
                ["Swap with Next"],
              ),
              Button(
                {
                  style: buttonStyle,
                  onClick() {
                    fruits.shuffle();
                  },
                },
                ["Shuffle"],
              ),
              Button(
                {
                  style: buttonStyle,
                  onClick() {
                    fruits.reverse();
                  },
                },
                ["Reverse"],
              ),
            ]),
          ];
        },
      }),
    ]),
  ]);
}

// Styles
const appStyle = {
  "max-width": "600px",
  margin: "0 auto",
  padding: "32px",
  "font-family": "system-ui, -apple-system, sans-serif",
};

const titleStyle = {
  "font-size": "28px",
  "font-weight": "600",
  "margin-bottom": "8px",
  color: "#1a1a1a",
};

const infoStyle = {
  color: "#666",
  "margin-bottom": "24px",
};

const sectionStyle = {
  background: "#f9fafb",
  "border-radius": "12px",
  padding: "20px",
  "margin-bottom": "20px",
};

const subtitleStyle = {
  "font-size": "18px",
  "font-weight": "500",
  "margin-bottom": "16px",
  color: "#333",
};

const counterStyle = {
  display: "flex",
  "align-items": "center",
  gap: "16px",
};

const countStyle = {
  "font-size": "32px",
  "font-weight": "600",
  "min-width": "60px",
  "text-align": "center",
};

const buttonStyle = {
  padding: "8px 16px",
  "font-size": "16px",
  border: "1px solid #d1d5db",
  "border-radius": "8px",
  background: "white",
  cursor: "pointer",
  transition: "background 0.2s",
};

const toggleButtonStyle = {
  padding: "8px 16px",
  "font-size": "14px",
  border: "1px solid #d1d5db",
  "border-radius": "8px",
  background: "white",
  cursor: "pointer",
  "margin-bottom": "16px",
};

const listStyle = {
  "list-style": "none",
  padding: "0",
  margin: "0 0 16px 0",
};

const listItemStyle = {
  padding: "12px 16px",
  background: "white",
  border: "1px solid #e5e7eb",
  "border-radius": "8px",
  "margin-bottom": "8px",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "8px",
};

const hoverBoxContainerStyle = {
  display: "flex",
  gap: "16px",
};

const hoverBoxStyle = {
  width: "120px",
  height: "80px",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  background: "white",
  border: "2px solid #d1d5db",
  "border-radius": "8px",
  cursor: "pointer",
  transition: "all 0.2s",
  "font-weight": "500",
};
