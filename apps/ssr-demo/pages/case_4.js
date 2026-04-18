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

  const elm = Fragment({}, [
    View(
      {
        onClick() {
          visible_.toggle();
        },
      },
      "Anchor1",
    ),
    Show({
      when: visible_,
      ok() {
        return [
          View(
            {
              onClick() {
                t_.toggle();
              },
            },
            ["Ha"],
          ),
          Portal({}, [
            View(
              {
                onMounted(event) {
                  console.log("hhhh", event.target.getBoundingClientRect());
                },
                onClick() {
                  visible_.toggle();
                },
              },
              [computed(t_, (t) => (t ? "Hello" : "Close"))],
            ),
          ]),
          View({}, "No effect"),
        ];
      },
    }),
  ]);
  console.log(elm);
  return elm;
}
