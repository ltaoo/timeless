import {
  Show,
  View,
  ViewChildren,
  ViewProps,
  refobj,
  computed,
  Icon,
  ListenerManager,
} from "@timeless/timeless";
import { ButtonPrimitive } from "@timeless/ui-primitive";
import { ButtonCore } from "@timeless/ui-vm";

const VARIANTS = {
  default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
  outline:
    "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  ghost:
    "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
  link: "text-primary underline-offset-4 hover:underline",
} as const;
const SIZES = {
  default:
    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
  lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  icon: "size-8",
  "icon-xs":
    "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
  "icon-sm":
    "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
  "icon-lg": "size-9",
} as const;

type ButtonVariant = keyof typeof VARIANTS;
type ButtonSize = keyof typeof SIZES;

export function Button(
  props: ViewProps & {
    store: ButtonCore;
    prefix?: ViewChildren;
  },
  children: ViewChildren = [],
) {
  const { store, class: cls, style, prefix, ...rest } = props;

  const state_ = refobj(store.state);
  const listener$ = ListenerManager([state_]);
  listener$.add(store.onStateChange(() => state_.as(store.state)));

  const classname_ = computed(state_, (s) => {
    const v = s.variant as ButtonVariant;
    const z = s.size as ButtonSize;
    return [
      "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      VARIANTS[v] || VARIANTS.default,
      SIZES[z] || SIZES.default,
      s.loading ? "opacity-70 pointer-events-none cursor-not-allowed" : "",
      s.disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : "",
      cls,
    ]
      .filter(Boolean)
      .join(" ");
  });

  return ButtonPrimitive.Root(
    {
      ...rest,
      store,
      class: classname_,
      style,
      dataset: {
        "data-slot": "button",
        "data-variant": store.state.variant,
        "data-size": store.state.size,
      },
      onUnmounted() {
        listener$.destroy();
        if (rest.onUnmounted) {
          rest.onUnmounted();
        }
      },
    },
    [
      ButtonPrimitive.Loading({ store }, [
        View(
          {
            class: "inline-block animate-spin",
            style: { "transform-origin": "center" },
          },
          [Icon({ name: "loader-circle", size: 16 })],
        ),
      ]),
      Show({
        when: !!prefix,
        ok() {
          return [ButtonPrimitive.Prefix({}, prefix)];
        },
      }),
      ButtonPrimitive.Content({}, children),
    ],
  );
}
