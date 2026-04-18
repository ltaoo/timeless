export default function Page({ data }) {
  const isLogin = ref(true);
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
          category_.push({
            label: "物理",
            selected: false,
          });
          category_.get(0).assign({
            label: "Hello",
          });
        },
      },
      ["Click it"],
    ),
    Show({
      when: true,
      ok() {
        return [
          For({
            each: category_,
            render(category) {
              // return View({}, [category.label]);
              return computed(category, (t) => t.label);
            },
          }),
          Portal({}, [
            View(
              {
                onMounted(event) {
                  console.log("hhhh", event.target);
                },
              },
              "HHHHHH",
            ),
          ]),
        ];
      },
    }),
  ]);
  console.log(elm);
  return elm;
}
