export function ToastView(props) {
  return Show({
    when: computed(props.message, (message) => Boolean(message)),
    ok() {
      return View({ class: "app-toast" }, [props.message]);
    },
  });
}
