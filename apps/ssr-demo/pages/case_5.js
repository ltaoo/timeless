/**
 * View 组件中，View 同级有一个 Show 嵌套 Fragment，Fragment 中有一个 View 组件
 * Fragment 的 onMounted 事件中，能正确获取到 Fragment 组件的 $children
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
  return elm;
}
