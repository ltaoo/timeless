import {
  classNames,
  combine,
  computed,
  Icon,
  refobj,
  View,
  Show,
  Text,
  ViewProps,
  ViewChildren,
} from "@timeless/timeless";
import { FilePickerPrimitive } from "@timeless/ui-primitive";
import { FilePickerCore } from "@timeless/ui-vm";

export function FileDropZone(
  props: ViewProps & {
    store: FilePickerCore;
    tip?: string;
  },
  children?: ViewChildren,
) {
  const { store, tip, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  const fileNames = computed(state_, (d) => {
    if (!d.value || d.value.length === 0) {
      return "";
    }
    if (d.value.length === 1) {
      return d.value[0].name;
    }
    return `${d.value.length} files selected`;
  });

  return FilePickerPrimitive.Root(
    { store, class: classNames(["t-file-dropzone relative", rest.class]) },
    [
      // Hidden native input for click-to-select
      FilePickerPrimitive.Input({
        store,
        class: "sr-only",
      }),
      FilePickerPrimitive.DropZone(
        {
          store,
          class: classNames([
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-6 py-8 cursor-pointer transition-colors hover:border-ring hover:bg-accent/50 data-[dragging]:border-ring data-[dragging]:bg-accent/50",
            computed(isLoading, (t) =>
              t ? "pointer-events-none opacity-50" : "",
            ),
          ]),
        },
        [
          Show({
            when: combine(
              { hasValue, isLoading },
              (t) => !t.hasValue && !t.isLoading,
            ),
            ok() {
              return [
                View(
                  {
                    class:
                      "flex flex-col items-center justify-center gap-2 text-muted-foreground",
                  },
                  [
                    Icon({
                      name: "upload",
                      size: 24,
                      class: "text-muted-foreground/60",
                    }),
                    View({ class: "text-sm" }, [
                      Text(tip || "Drag & drop files here, or click to select"),
                    ]),
                    ...(store.accept
                      ? [
                          View({ class: "text-xs text-muted-foreground/60" }, [
                            Text(store.accept),
                          ]),
                        ]
                      : []),
                  ],
                ),
              ];
            },
          }),
          Show({
            when: combine(
              { hasValue, isLoading },
              (t) => t.hasValue && !t.isLoading,
            ),
            ok() {
              return [
                View(
                  {
                    class: "flex items-center gap-2 text-sm text-foreground",
                  },
                  [
                    Icon({
                      name: "file",
                      size: 16,
                      class: "text-muted-foreground",
                    }),
                    View({ class: "truncate" }, [Text(fileNames)]),
                    FilePickerPrimitive.Clear(
                      {
                        store,
                        class:
                          "flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
                      },
                      [Icon({ name: "circle-x", size: 16 })],
                    ),
                  ],
                ),
              ];
            },
          }),
          Show({
            when: isLoading,
            ok() {
              return [
                View(
                  {
                    class:
                      "flex items-center gap-2 text-sm text-muted-foreground",
                  },
                  [
                    View({ class: "h-4 w-4 animate-spin" }, [
                      Icon({ name: "loader" }),
                    ]),
                    View({}, [Text("Uploading...")]),
                  ],
                ),
              ];
            },
          }),
        ],
      ),
    ],
  );
}

export function FileInput(
  props: ViewProps & {
    store: FilePickerCore;
    id?: string;
  },
) {
  const { store, id, ...rest } = props;
  const state_ = refobj(store.state);

  store.onStateChange((v) => {
    state_.as(v);
  });

  const hasValue = computed(state_, (d) => d.value && d.value.length > 0);
  const isLoading = computed(state_, (d) => d.loading || false);

  return FilePickerPrimitive.Root(
    { store, class: classNames(["t-file-input relative", props.class]) },
    [
      FilePickerPrimitive.Input({
        ...rest,
        id,
        store,
        class: classNames([
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          combine({ hasValue, isLoading }, (t) => {
            return t.isLoading || t.hasValue ? "pr-8" : "";
          }),
        ]),
      }),
      Show({
        when: combine(
          { hasValue, isLoading },
          (t) => t.hasValue && !t.isLoading,
        ),
        ok() {
          return [
            FilePickerPrimitive.Clear(
              {
                store,
                class:
                  "absolute top-1/2 -translate-y-1/2 right-2 flex items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
              },
              [Icon({ name: "circle-x", size: 16 })],
            ),
          ];
        },
      }),
      FilePickerPrimitive.Loading(
        {
          store,
          class:
            "absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500",
        },
        [View({ class: "h-4 w-4 animate-spin" }, [Icon({ name: "loader" })])],
      ),
    ],
  );
}
