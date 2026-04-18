/**
 * 多个 容器组件 相互嵌套
 * 以及在 Show 上方有额外的节点，依赖 offset，给 Fragment 中的 Button 正确找到 <button> DOM
 * 因为 Button 在 Fragment 是第 0 个，但是 <button> 在 root 中是第 1 个
 */
export default function Page({ data }) {
  const isLogin = ref(true);

  return Fragment({}, [
    View({}, "Anchor1"),
    Show({
      when: true,
      ok() {
        return Fragment({}, [
          Button(
            {
              onClick() {
                isLogin.as((prev) => !prev);
              },
            },
            [
              computed(isLogin, (t) => {
                return t ? "切换账号" : "去登录";
              }),
            ],
          ),
        ]);
      },
    }),
  ]);
}
