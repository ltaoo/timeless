import { computed, isRef, ref, Ref } from "../core";
import {
  isStyleRef,
  View,
  ViewProps,
  ViewChildren,
  getPlatform,
} from "../core";

export function Root(
  props: ViewProps & {
    value?: number | Ref<number>;
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

  // 外部持有的值：订阅后镜像到本地，这样调用方改值（如「重置」）能推动滑块。
  const rawValue: any = props.value;
  const externalValueRef: Ref<number> | null = isRef(rawValue)
    ? (rawValue as Ref<number>)
    : null;
  const valueRef = ref<number>(
    externalValueRef ? externalValueRef.value : (rawValue ?? _min),
  );
  const containerRef: { current: any | null } = { current: null };

  // 订阅放在 onMounted（而非构造时）：View 的软卸载会清掉挂载期的订阅，
  // 重新挂载时再订阅一次，KeepAlive 场景下外部改值依然能推动滑块。
  const subscribeExternal = () => {
    if (!externalValueRef) return () => {};
    if (externalValueRef.value !== valueRef.value) {
      valueRef.as(externalValueRef.value);
    }
    return externalValueRef.subscribe({
      onChange(v: number) {
        if (v !== valueRef.value) {
          valueRef.as(v);
        }
      },
    });
  };

  const pct = computed(valueRef, (d) => {
    const v = Math.min(Math.max(d, _min), _max);
    return _max - _min === 0 ? 0 : ((v - _min) / (_max - _min)) * 100;
  });

  const updateValue = (clientX: number) => {
    if (disabled || !containerRef.current) return;
    const rect = getPlatform().getBoundingClientRect(containerRef.current);
    if (!rect || !rect.width) return;
    const x = Math.max(0, Math.min(clientX - rect.x, rect.width));
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

  let cleanupDrag: (() => void) | null = null;
  const onPointerDown = (e: any) => {
    if (disabled) return;
    e.preventDefault();
    // 点哪跳哪
    updateValue(e.clientX);
    if (cleanupDrag) cleanupDrag();
    const onMove = (ev: any) => updateValue(ev.clientX);
    const onUp = () => {
      if (cleanupDrag) cleanupDrag();
    };
    // Platform 没有 setPointerCapture，走 document 级监听；
    // addEventListener 返回 unsubscribe，见 resizable-panels 的用法。
    const removeMove = getPlatform().addEventListener("pointermove", onMove);
    const removeUp = getPlatform().addEventListener("pointerup", onUp);
    cleanupDrag = () => {
      removeMove();
      removeUp();
      cleanupDrag = null;
    };
  };

  return View(
    {
      ...rest,
      // "data-percentage": pct,
      onMounted(event) {
        const elm = event.target;
        containerRef.current = elm;
        elm.addEventListener("pointerdown", onPointerDown);
        const unsubscribeValue = subscribeExternal();
        if (rest.onMounted) {
          rest.onMounted(event);
        }
        return () => {
          elm.removeEventListener("pointerdown", onPointerDown);
          unsubscribeValue();
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
