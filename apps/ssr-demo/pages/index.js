// Use UMD global to ensure same module instance on client and server
const { View, For, Show, h } = window.Timeless;

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
  return View({ as: "div", class: "app", style: appStyle }, [
    // Header
    View({ as: "h1", style: titleStyle }, [data.message]),

    View({ as: "p", style: infoStyle }, [
      "This page is server-rendered and hydrated on the client.",
    ]),

    // Counter Section
    View({ as: "section", style: sectionStyle }, [
      View({ as: "h2", style: subtitleStyle }, ["Counter"]),
      View({ as: "div", style: counterStyle }, [
        View(
          {
            as: "button",
            style: buttonStyle,
            onClick: () => data.count.as((v) => v - 1),
          },
          ["-"],
        ),
        View({ as: "span", style: countStyle }, [data.count]),
        View(
          {
            as: "button",
            style: buttonStyle,
            onClick: () => data.count.as((v) => v + 2),
          },
          ["+"],
        ),
      ]),
    ]),

    // Mouse Events Section
    View({ as: "section", style: sectionStyle }, [
      View({ as: "h2", style: subtitleStyle }, ["Mouse Events Test"]),
      View({ as: "p", style: infoStyle }, [
        "Hover over the boxes to test mouseenter/mouseleave events:",
      ]),
      View({ as: "div", style: hoverBoxContainerStyle }, [
        View(
          {
            as: "div",
            style: hoverBoxStyle,
            onMouseEnter: () => {
              console.log("Box 1: mouseenter triggered");
              data.hoverBox1.as(true);
            },
            onMouseLeave: () => {
              console.log("Box 1: mouseleave triggered");
              data.hoverBox1.as(false);
            },
          },
          [
            Show({ when: data.hoverBox1, fallback: ["Hover me"] }, ["Hovering!"]),
          ],
        ),
        View(
          {
            as: "div",
            style: hoverBoxStyle,
            onMouseEnter: () => {
              console.log("Box 2: mouseenter triggered");
              data.hoverBox2.as(true);
            },
            onMouseLeave: () => {
              console.log("Box 2: mouseleave triggered");
              data.hoverBox2.as(false);
            },
          },
          [
            Show({ when: data.hoverBox2, fallback: ["Hover me"] }, ["Hovering!"]),
          ],
        ),
      ]),
    ]),

    // List Section
    View({ as: "section", style: sectionStyle }, [
      View({ as: "h2", style: subtitleStyle }, ["Fruit List"]),

      View(
        {
          as: "button",
          style: toggleButtonStyle,
          onClick: () => data.showList.as((v) => !v),
        },
        ["Toggle List"],
      ),

      Show({ when: data.showList }, [
        h(View, { as: "ul", style: listStyle }, [
          h(For, {
            each: data.fruits,
            render: (item) => View({ as: "li", style: listItemStyle }, [item]),
          }),
        ]),

        h(View, { as: "div", style: buttonGroupStyle }, [
          h(
            View,
            {
              as: "button",
              style: buttonStyle,
              onClick: () => {
                const names = ["Mango", "Grape", "Peach", "Kiwi", "Pear"];
                const pick = names[Math.floor(Math.random() * names.length)];
                data.fruits.push(pick);
              },
            },
            ["Add Fruit"],
          ),
          h(
            View,
            {
              as: "button",
              style: buttonStyle,
              onClick: () => {
                if (data.fruits.length > 0) {
                  data.fruits.pop();
                }
              },
            },
            ["Remove Last"],
          ),
        ]),
      ]),
    ]),
  ]);
}

// Styles
const appStyle = `
  max-width: 600px;
  margin: 0 auto;
  padding: 32px;
  font-family: system-ui, -apple-system, sans-serif;
`;

const titleStyle = `
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1a1a1a;
`;

const infoStyle = `
  color: #666;
  margin-bottom: 24px;
`;

const sectionStyle = `
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const subtitleStyle = `
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
`;

const counterStyle = `
  display: flex;
  align-items: center;
  gap: 16px;
`;

const countStyle = `
  font-size: 32px;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
`;

const buttonStyle = `
  padding: 8px 16px;
  font-size: 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
`;

const toggleButtonStyle = `
  padding: 8px 16px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  margin-bottom: 16px;
`;

const listStyle = `
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const listItemStyle = `
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const buttonGroupStyle = `
  display: flex;
  gap: 8px;
`;

const hoverBoxContainerStyle = `
  display: flex;
  gap: 16px;
`;

const hoverBoxStyle = `
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
`;
