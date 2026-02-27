import { isRef, Ref } from "@timeless/reactive";

export function Txt(value: Ref<any> | string) {
  let _local_value = isRef(value) ? value.value : value;
  if (isRef(value)) {
    value._subscribe({
      onPatch(action) {

      },
      onChange(v: any) {
        console.log("compare", v, _local_value);
        if (v === _local_value) {
          return;
        }
        _local_value = v;
        $elm.textContent = _local_value;
      },
    });
  }
  const $elm = document.createTextNode(_local_value);
  return {
    t: "text",
    $elm,
    render() {
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {
      // console.log("the text unmounted", _local_value);
    },
  };
}
