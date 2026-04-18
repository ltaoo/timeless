// Use UMD global to ensure same module instance on client and server
const {
  For,
  Show,
  View,
  Label,
  Button,
  Fragment,
  Checkbox,
  Input,
  Portal,
  computed,
  ref,
  refarr,
  refobj,
  combine,
} = window.Timeless;

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
    keyword: "Hot Keyword",
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
  const visible_ = ref(true);
  const t_ = ref(true);
  const category_ = refarr([
    {
      label: "计算机",
      selected: true,
    },
    {
      label: "数学",
      selected: false,
    },
  ]);

  const elm = View({}, [
    View({}, ["Hello"]),
    Show({
      when: true,
      ok() {
        return Fragment(
          {
            onMounted(e) {
              console.log(e.target.get$children());
            },
          },
          [
            View(
              {
                onClick() {
                  console.log("click timeless");
                  // visible_.toggle();
                },
              },
              ["Timeless"],
            ),
          ],
        );
      },
    }),
    Show({
      when: visible_,
      ok() {
        return Portal({}, [View({}, ["Content in Portal"])]);
      },
    }),
  ]);
  console.log(elm);
  return elm;
}
