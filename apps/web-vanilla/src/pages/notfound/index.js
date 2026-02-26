export function NotFoundPageView(props) {
  return View({ class: "notfound" }, [
    View({}, [
      View({}, [Head2({}, [Txt("404")]), Txt("页面未找到")]),
      Button(
        {
          class: "notfound-btn",
          onClick() {
            props.history.push("root.home_layout.index");
          },
        },
        [Txt("返回首页")]
      ),
    ]),
  ]);
}
