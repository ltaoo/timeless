import { isRef, Ref } from "@timeless/reactive";

export function Txt(value: Ref<any> | string) {
  let _local_value = isRef(value) ? value.value : value;
  const $elm = document.createTextNode(_local_value);

  return {
    t: "text",
    $elm,
    render() {
      if (isRef(value)) {
        value._subscribe({
          onPatch(action) {},
          onChange(v: any) {
            if (v === _local_value) {
              return;
            }
            _local_value = v;
            $elm.textContent = _local_value;
          },
        });
      }
      return $elm;
    },
    onMounted() {},
    beforeUnmounted() {},
    onUnmounted() {},
  };
}
