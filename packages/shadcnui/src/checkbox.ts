import { CheckboxPrimitive } from "@timeless/headless";
import { CheckOutlined } from "@timeless/icons";
import { CheckboxCore } from "@timeless/ui";

export function Checkbox(props: { store: CheckboxCore; label?: string }) {
  const { store, label } = props;

  return CheckboxPrimitive.Root(
    {
      store,
      class: "flex items-center gap-2",
    },
    [
      CheckboxPrimitive.Box(
        {
          store,
          class:
            "peer h-4 w-4 shrink-0 rounded-sm border border-zinc-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 flex items-center justify-center cursor-pointer bg-white dark:bg-zinc-950 data-[checked]:bg-zinc-900 data-[checked]:text-zinc-50 dark:data-[checked]:bg-zinc-50 dark:data-[checked]:text-zinc-900 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
        },
        [CheckboxPrimitive.Indicator({ store }, [CheckOutlined()])],
      ),
      label
        ? CheckboxPrimitive.Label(
            {
              class:
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            },
            [
              {
                t: "text",
                $elm: document.createTextNode(label),
                render() {
                  return this.$elm;
                },
                onMounted() {},
                beforeUnmounted() {},
                onUnmounted() {},
              },
            ],
          )
        : null,
    ].filter(Boolean),
  );
}
