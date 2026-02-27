import { tp, merge } from "./theme.js";
import { View } from "./view.js";
import { computed, isRef, ref } from "@timeless/reactive";

export function Slider(props: any) {
  const {
    store,
    min: _min = 0,
    max: _max = 100,
    step: _step = 1,
    disabled,
    onChange,
    theme: t,
    class: cn,
    style: st,
  } = props;

  const valueRef = store
    ? ref(store.state?.value ?? 0)
    : isRef(props.value)
      ? props.value
      : ref(props.value ?? _min);

  const events: any[] = [];
  if (store && store.onStateChange) {
    events.push(
      store.onStateChange(() => {
        valueRef.value = store.state.value;
      }),
    );
  }

  const pct = computed(valueRef, (d) => {
    const v = Math.min(Math.max(d, _min), _max);
    return _max - _min === 0 ? 0 : ((v - _min) / (_max - _min)) * 100;
  });

  const containerRef: { current: HTMLElement | null } = { current: null };

  const updateValue = (clientX: number) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    let newVal = _min + (x / rect.width) * (_max - _min);
    if (_step > 0) newVal = _min + Math.round((newVal - _min) / _step) * _step;
    newVal = Math.max(_min, Math.min(newVal, _max));
    if (newVal !== valueRef.value) {
      if (store && store.setValue) store.setValue(newVal);
      else valueRef.value = newVal;
      if (onChange) onChange(newVal);
    }
  };

  let cleanupDrag: any;
  const onPointerDown = (e: any) => {
    if (disabled) return;
    updateValue(e.clientX);
    e.target.setPointerCapture(e.pointerId);
    const onMove = (ev: any) => updateValue(ev.clientX);
    const onUp = (ev: any) => {
      ev.target.releasePointerCapture(ev.pointerId);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      cleanupDrag = null;
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    cleanupDrag = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  };

  return View(
    {
      ...merge(tp(t?.root, { disabled }), cn, st),
      onMounted(elm: HTMLElement) {
        containerRef.current = elm;
        elm.addEventListener("pointerdown", onPointerDown);
      },
      onUnmounted() {
        if (cleanupDrag) cleanupDrag();
        for (const fn of events) if (typeof fn === "function") fn();
        if (props.onUnmounted) props.onUnmounted();
      },
    },
    [
      View({ ...merge(tp(t?.track)) }, [
        View({
          ...merge(tp(t?.fill)),
          style: computed(
            pct,
            (d) => `${merge(tp(t?.fill)).style || ""}width:${d}%`,
          ),
        }),
      ]),
      View({
        ...merge(tp(t?.thumb)),
        style: computed(
          pct,
          (d) =>
            `${merge(tp(t?.thumb)).style || ""}left:${d}%;top:50%;transform:translate(-50%,-50%);`,
        ),
      }),
    ],
  );
}
