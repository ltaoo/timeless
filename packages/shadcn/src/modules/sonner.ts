import {
  computed,
  For,
  isElement,
  ref,
  refobj,
  Show,
  TimelessElement,
  View,
} from "@timeless/timeless";
import { ToasterModel, ToastModel } from "@timeless/ui-vm";
// import {
//   CircleCheckIcon,
//   InfoIcon,
//   Loader2Icon,
//   OctagonXIcon,
//   TriangleAlertIcon,
// } from "lucide-react"

type ToasterProps = {
  store: ToasterModel;
};

export function Toaster(props: ToasterProps) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const toasts_ = computed(state_, (t) => t.toasts);

  return View(
    {
      class:
        "fixed z-index-[999999999] border-box p-0 m-0 list-none outline-none transition-transform",
      style: {
        top: 0,
      },
      attributes: {
        "z-index": 999999999,
        "tab-index": -1,
        "aria-live": "polite",
        "aria-relevant": "additions text",
        "aria-atomic": "false",
      },
      onMounted() {
        store.onStateChange((v) => {
          state_.as(v);
        });
      },
    },
    [
      View(
        {
          attributes: {
            "tab-index": -1,
          },
          dataset: {
            "sonner-toaster": "",
          },
        },
        [
          For({
            each: toasts_,
            render(toast, idx) {
              return View(
                {
                  style: {
                    "z-index": idx,
                  },
                },
                [Toast({ store: toast })],
              );
            },
          }),
        ],
      ),
    ],
  );
}

export function Toast(props: { store: ToastModel }) {
  const { store, ...rest } = props;

  const state_ = refobj(store.state);
  const index_ = computed(state_, (t) => t.index);
  const offset_ = computed(state_, (t) => {
    return t.removed ? t.offsetBeforeRemove : t.offset;
  });

  return View(
    {
      style: {
        "--index": index_,
        "--toasts-before": index_,
        "--offset": computed(offset_, (t) => `${t}px`),
        "--y": "translateY(100%)",
        //  '--z-index': toasts.length - index_,
        position: "absolute",
        opacity: 0,
        transform: "var(--y)",
        "touch-action": "none",
        transition:
          "transform 400ms, opacity 400ms, height 400ms, box-shadow 200ms",
        "box-sizing": "border-box",
        outline: "none",
        "overflow-wrap": "anywhere",
      },
    },
    [
      Show({
        when: isElement(store.content),
        ok() {
          return [store.content as TimelessElement];
        },
        else() {
          return [View({ class: "toast-content" }, [store.content as string])];
        },
      }),
    ],
  );
}

// function toast(message: unknown, data?: ExternalToast) {
//   return sonner.toast(message, data)
// }

// function success(message: unknown, data?: ExternalToast) {
//   return sonner.success(message, data)
// }

// function error(message: unknown, data?: ExternalToast) {
//   return sonner.error(message, data)
// }

// function info(message: unknown, data?: ExternalToast) {
//   return sonner.info(message, data)
// }

// function warning(message: unknown, data?: ExternalToast) {
//   return sonner.warning(message, data)
// }

// function loading(message: unknown, data?: ExternalToast) {
//   return sonner.loading(message, data)
// }

// function dismiss(id?: number | string) {
//   return sonner.dismiss(id)
// }

// export { Toaster, toast, success, error, info, warning, loading, dismiss }
