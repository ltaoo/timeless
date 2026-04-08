import { computed, isRef, ref } from "@timeless/reactive";

import { isStyleRef } from "@/style/index";
import { View, ViewProps } from "@/content/view";
import { ViewChildren } from "@/content/type";
import { getHost } from "@/host";

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
  const host = getHost();
  const {
    min: _min = 0,
    max: _max = 100,
    step: _step = 1,
    disabled,
    onChange,
    ...rest
  } = props;

  const valueRef = ref(props.value ?? _min);
  const containerRef: { current: any | null } = { current: null };

  const pct = computed(valueRef, (d) => {
    const v = Math.min(Math.max(d, _min), _max);
    return _max - _min === 0 ? 0 : ((v - _min) / (_max - _min)) * 100;
  });

  const updateValue = (clientX: number) => {
    if (disabled || !containerRef.current) return;
    const rect = host.getBoundingClientRect?.(containerRef.current) as any;
    if (!rect || !rect.width) return;
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
    e.preventDefault();
    updateValue(e.clientX);
    host.setPointerCapture?.(e.target, e.pointerId);
    const onMove = (ev: any) => updateValue(ev.clientX);
    const onUp = (ev: any) => {
      host.releasePointerCapture?.(ev.target, ev.pointerId);
      host.removeDocumentEventListener?.("pointermove", onMove);
      host.removeDocumentEventListener?.("pointerup", onUp);
      cleanupDrag = null;
    };
    host.addDocumentEventListener?.("pointermove", onMove);
    host.addDocumentEventListener?.("pointerup", onUp);
    cleanupDrag = () => {
      host.removeDocumentEventListener?.("pointermove", onMove);
      host.removeDocumentEventListener?.("pointerup", onUp);
    };
  };

  return View(
    {
      ...rest,
      // "data-percentage": pct,
      onMounted(event) {
        const elm = (event as any).target as any;
        containerRef.current = elm;
        host.addEventListener(elm, "pointerdown", onPointerDown);
        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          host.removeEventListener(elm, "pointerdown", onPointerDown);
        };
      },
      onUnmounted() {
        if (cleanupDrag) cleanupDrag();
        if (rest.onUnmounted) rest.onUnmounted();
      },
    },
    children,
  );
}

export function Track(props: ViewProps, children?: ViewChildren) {
  return View(props, children);
}

export function Range(
  props: ViewProps & { percentage: any },
  children?: ViewChildren,
) {
  const { percentage, ...rest } = props;
  const extraStyle =
    rest.style &&
    typeof rest.style === "object" &&
    !isRef(rest.style) &&
    !isStyleRef(rest.style)
      ? rest.style
      : {};
  return View(
    {
      ...rest,
      style: { ...extraStyle, width: computed(percentage, (d) => `${d}%`) },
    },
    children,
  );
}

export function Thumb(
  props: ViewProps & { percentage: any },
  children?: ViewChildren,
) {
  const { percentage, ...rest } = props;
  const extraStyle =
    rest.style &&
    typeof rest.style === "object" &&
    !isRef(rest.style) &&
    !isStyleRef(rest.style)
      ? rest.style
      : {};
  return View(
    {
      ...rest,
      style: {
        ...extraStyle,
        left: computed(percentage, (d) => `${d}%`),
        top: "50%",
        transform: "translate(-50%,-50%)",
      },
    },
    children,
  );
}
