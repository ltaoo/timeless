import { computed, isRef, ref } from "@timeless/reactive";

import { View, ViewProps, ViewChildren } from "./view";

export function Root(
  props: ViewProps & {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    onChange?: (v: number) => void;
  },
  children?: ViewChildren,
) {
  const {
    min: _min = 0,
    max: _max = 100,
    step: _step = 1,
    disabled,
    onChange,
    ...rest
  } = props;

  const valueRef = ref(props.value ?? _min);
  const containerRef: { current: HTMLElement | null } = { current: null };

  const pct = computed(valueRef, (d) => {
    const v = Math.min(Math.max(d, _min), _max);
    return _max - _min === 0 ? 0 : ((v - _min) / (_max - _min)) * 100;
  });

  const updateValue = (clientX: number) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    let newVal = _min + (x / rect.width) * (_max - _min);
    if (_step > 0) newVal = _min + Math.round((newVal - _min) / _step) * _step;
    newVal = Math.max(_min, Math.min(newVal, _max));
    if (newVal !== valueRef.value) {
      valueRef.as(newVal);
      if (onChange) {
        onChange(newVal);
      }
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
      ...rest,
      // "data-percentage": pct,
      onMounted(elm: HTMLElement) {
        containerRef.current = elm;
        elm.addEventListener("pointerdown", onPointerDown);
        if (rest.onMounted) {
          rest.onMounted(elm);
        }
      },
      onUnmounted() {
        if (cleanupDrag) cleanupDrag();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

export function Track(
  props: ViewProps,
  children?: ViewChildren,
) {
  return View(props, children);
}

export function Range(
  props: ViewProps & { percentage: any },
  children?: ViewChildren,
) {
  const { percentage, ...rest } = props;
  return View(
    {
      ...rest,
      style: computed(percentage, (d) => {
        const baseStyle = rest.style || "";
        return `${baseStyle}width:${d}%`;
      }),
    },
    children,
  );
}

export function Thumb(
  props: ViewProps & { percentage: any },
  children?: ViewChildren,
) {
  const { percentage, ...rest } = props;
  return View(
    {
      ...rest,
      style: computed(percentage, (d) => {
        const baseStyle = rest.style || "";
        return `${baseStyle}left:${d}%;top:50%;transform:translate(-50%,-50%);`;
      }),
    },
    children,
  );
}
