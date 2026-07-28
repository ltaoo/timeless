import {
  Icon,
  View,
  ViewProps,
  classNames,
  computed,
  refobj,
} from "@timeless/timeless";
import { SelectPrimitive } from "@timeless/ui-primitive";
import { SelectCore } from "@timeless/inner-vm";

export function SearchSelect<T>(
  props: ViewProps & {
    store: SelectCore<T>;
    // debounce?: number;
    // minLength?: number;
    // emptyText?: string;
    // loadingText?: string;
  },
) {
  const {
    store,
    // debounce = 300,
    // minLength = 1,
    // emptyText = "暂无数据",
    // loadingText = "加载中...",
    ...rest
  } = props;

  const state_ = refobj(store.state);
  store.onStateChange((next) => {
    state_.as(next);
  });

  // let inputEl: HTMLInputElement | null = null;
  // let lastKeyword = (store.state.searchKeyword || "").trim();
  // let lastOpen = !!store.state.open;
  // let timer: number | null = null;
  // let seq = 0;

  // function mergeSelectedOption(options: { value: T; label: string }[]) {
  //   const selected = store.state.value2;
  //   if (!selected) {
  //     return options;
  //   }
  //   const list = Array.isArray(options) ? options : [];
  //   if (list.some((o) => o && o.value === selected.value)) {
  //     return list;
  //   }
  //   return [selected, ...list];
  // }

  async function run(keyword: string, currentSeq: number) {
    store.setLoading(true);
    // try {
    //   const options = await fetchOptions(keyword);
    //   if (currentSeq !== seq) {
    //     return;
    //   }
    //   if ((store.state.searchKeyword || "").trim() !== keyword) {
    //     return;
    //   }
    //   store.setOptions(mergeSelectedOption(options));
    // } finally {
    //   if (currentSeq === seq) {
    //     store.setLoading(false);
    //   }
    // }
  }

  return SelectPrimitive.Root({ store }, [
    View(
      {
        class: classNames([
          "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          computed(state_, (t) => {
            return t.open
              ? "border-ring ring-3 ring-ring/50"
              : "dark:hover:bg-input/50";
          }),
        ]),
        onMounted(el) {
          if (
            !el ||
            typeof el !== "object" ||
            !("getBoundingClientRect" in el)
          ) {
            return;
          }
          const elm = el as unknown as HTMLElement;
          store.popper$.setReference(
            {
              $el: elm,
              getRect() {
                return elm.getBoundingClientRect();
              },
            },
            { force: true },
          );
        },
        onPointerDown(e) {
          const target = e.target as any;
          if (target && target.tagName === "INPUT") {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          if (!store.open && !store.disabled) {
            store.show();
          }
        },
      },
      [
        SelectPrimitive.Search({
          store,
          class:
            "w-full bg-transparent outline-none placeholder:text-muted-foreground",
        }),
        SelectPrimitive.Icon({ store, class: "size-4 text-muted-foreground" }, [
          Icon({ name: "chevron-down", size: 16 }),
        ]),
      ],
    ),
    SelectPrimitive.Content(
      {
        ...rest,
        store,
        animation: {
          in: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          out: "animate-out fill-mode-both fade-out-0 zoom-out-95 slide-out-to-top-2",
        },
        class:
          "cn-menu-target cn-menu-translucent select__content relative max-h-96 min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0
            ? {
                "min-width": `${width}px;`,
              }
            : {};
        }),
      },
      [],
    ),
  ]);
}
