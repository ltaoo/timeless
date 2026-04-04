import { cn, computed, refobj } from "@timeless/primitive";
import {
  For,
  Input,
  SelectPrimitive,
  Show,
  View,
  ViewProps,
} from "@timeless/primitive";
import { SelectCore } from "@timeless/ui";
import { CheckOutlined, ChevronDownOutlined } from "@timeless/icons";

export function SearchSelect<T>(
  props: ViewProps & {
    store: SelectCore<T>;
    fetchOptions: (keyword: string) => Promise<{ value: T; label: string }[]>;
    debounce?: number;
    minLength?: number;
    emptyText?: string;
    loadingText?: string;
  },
) {
  const {
    store,
    fetchOptions,
    debounce = 300,
    minLength = 1,
    emptyText = "暂无数据",
    loadingText = "加载中...",
    ...rest
  } = props;

  const state_ = refobj(store.state);
  store.onStateChange((next) => {
    state_.as(next);
  });

  let inputEl: HTMLInputElement | null = null;
  let lastKeyword = (store.state.searchKeyword || "").trim();
  let lastOpen = !!store.state.open;
  let timer: number | null = null;
  let seq = 0;

  function mergeSelectedOption(options: { value: T; label: string }[]) {
    const selected = store.state.value2;
    if (!selected) {
      return options;
    }
    const list = Array.isArray(options) ? options : [];
    if (list.some((o) => o && o.value === selected.value)) {
      return list;
    }
    return [selected, ...list];
  }

  async function run(keyword: string, currentSeq: number) {
    store.setLoading(true);
    try {
      const options = await fetchOptions(keyword);
      if (currentSeq !== seq) {
        return;
      }
      if ((store.state.searchKeyword || "").trim() !== keyword) {
        return;
      }
      store.setOptions(mergeSelectedOption(options));
    } finally {
      if (currentSeq === seq) {
        store.setLoading(false);
      }
    }
  }

  store.onStateChange((state) => {
    const open = !!state.open;
    const keyword = (state.searchKeyword || "").trim();

    const openChanged = open !== lastOpen;
    const keywordChanged = keyword !== lastKeyword;

    lastOpen = open;
    lastKeyword = keyword;

    if (openChanged && open) {
      setTimeout(() => {
        if (!inputEl || store.disabled) {
          return;
        }
        inputEl.focus();
        const len = inputEl.value.length;
        if (typeof inputEl.setSelectionRange === "function") {
          inputEl.setSelectionRange(len, len);
        }
      }, 1);
    }

    if (!open) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      return;
    }

    if (!openChanged && !keywordChanged) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (keyword.length < minLength) {
      seq += 1;
      store.setLoading(false);
      store.setOptions(state.value2 ? [state.value2] : []);
      return;
    }

    seq += 1;
    const currentSeq = seq;
    timer = window.setTimeout(() => {
      run(keyword, currentSeq);
    }, debounce);
  });

  return SelectPrimitive.Root({ store }, [
    View(
      {
        class: cn([
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
          store.popper.setReference(
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
          if (inputEl) {
            inputEl.focus();
          }
          if (!store.open && !store.disabled) {
            store.show();
          }
        },
      },
      [
        Input({
          class:
            "w-full bg-transparent outline-none placeholder:text-muted-foreground",
          placeholder: computed(
            state_,
            (t) => t.searchPlaceholder || t.placeholder || "",
          ),
          disabled: computed(state_, (t) => t.disabled),
          value: computed(state_, (t) => {
            if (t.open) {
              return t.searchKeyword || "";
            }
            return t.value2?.label || "";
          }),
          onMounted(el) {
            inputEl = el as unknown as HTMLInputElement;
          },
          onPointerDown(e) {
            e.stopPropagation();
          },
          onFocus() {
            if (store.disabled) {
              return;
            }
            store.show();
          },
          onInput(e) {
            const target = e.target as any;
            const value =
              target && typeof target === "object" && "value" in target
                ? target.value
                : "";
            store.setSearchKeyword(String(value));
            if (!store.open) {
              store.show();
            }
          },
          onKeyDown(e) {
            e.stopPropagation();
            switch (e.key) {
              case "ArrowDown":
                e.preventDefault();
                store.focusNextOption();
                break;
              case "ArrowUp":
                e.preventDefault();
                store.focusPrevOption();
                break;
              case "Enter":
                e.preventDefault();
                store.selectFocusedOption();
                break;
              case "Escape":
                e.preventDefault();
                store.hide();
                break;
            }
          },
        }),
        SelectPrimitive.Icon({ store, class: "size-4 text-muted-foreground" }, [
          ChevronDownOutlined({}),
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
          "cn-menu-target cn-menu-translucent select__content relative z-50 max-h-96 min-w-36 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
        style: computed(state_, () => {
          const width = store.reference?.width || 0;
          return width > 0 ? `min-width: ${width}px;` : "";
        }),
      },
      [
        SelectPrimitive.Viewport({ store, class: "p-1" }, [
          Show(
            {
              when: computed(state_, (t) => (t.options || []).length > 0),
              fallback: [
                View(
                  {
                    class:
                      "py-6 text-center text-sm text-muted-foreground select-none",
                  },
                  [
                    computed(state_, (t) =>
                      t.loading ? loadingText : emptyText,
                    ),
                  ],
                ),
              ],
            },
            [
              For({
                key: "value",
                each: computed(state_, (t) => t.options),
                render(option: any) {
                  return SelectPrimitive.Item(
                    {
                      store,
                      value: option.value,
                      class: cn([
                        "relative flex w-full cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
                        computed(state_, (d) => {
                          const opt = d.options.find(
                            (o: any) => o.value === option.value,
                          );
                          const isFocused = Boolean(opt?.focused);
                          const isSelected = Boolean(opt?.selected);
                          return [
                            isSelected ? "font-medium" : "",
                            isFocused ? "bg-accent text-accent-foreground" : "",
                          ]
                            .filter(Boolean)
                            .join(" ");
                        }),
                      ]),
                    },
                    [
                      SelectPrimitive.ItemIndicator(
                        {
                          store,
                          value: option.value,
                          class:
                            "pointer-events-none absolute right-2 flex size-4 items-center justify-center",
                        },
                        [CheckOutlined({})],
                      ),
                      SelectPrimitive.ItemText({}, [option.label]),
                    ],
                  );
                },
              }),
            ],
          ),
        ]),
      ],
    ),
  ]);
}
