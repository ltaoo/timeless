import { computed, ListViewV2, ScrollView, View } from "@timeless/timeless";
import { Button } from "@timeless/shadcn";

export function ScrollPageView(model) {
  return View(
    { class: "flex w-full flex-col gap-4", attributes: { n: "scroll-page" } },
    [
      View(
        {
          class: "text-xl font-semibold",
          attributes: { n: "scroll-example-title" },
        },
        ["ScrollView / 双向滚动"],
      ),
      ScrollView(
        {
          style: { height: 120, flexShrink: 0 },
          attributes: { n: "scroll-example", "aria-label": "双向滚动示例" },
          onScroll: model.onScroll,
        },
        [
          View(
            {
              style: { width: 1000, height: 220, flexShrink: 0 },
              class: "tt-bg-muted p-4",
              attributes: { n: "scroll-example-content" },
            },
            ["拖动滚动条，或使用触控板查看右侧和下方内容。"],
          ),
        ],
      ),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "scroll-position" },
        },
        [model.scrollPosition],
      ),
      View(
        {
          class: "text-xl font-semibold",
          attributes: { n: "virtual-list-title" },
        },
        ["VirtualList / ListViewV2"],
      ),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "virtual-list-total" },
        },
        [model.count],
      ),
      View(
        {
          class: "flex flex-row flex-wrap gap-2",
          attributes: { n: "virtual-list-actions" },
        },
        [
          ...model.actions.map((action) =>
            Button(
              {
                store: action.store,
                attributes: { n: `virtual-list-${action.key}` },
              },
              [action.title],
            ),
          ),
        ],
      ),
      ListViewV2({
        each: model.items,
        key: "id",
        itemHeight: model.itemHeight,
        size: 6,
        buffer: 2,
        style: { height: 288, flexShrink: 0 },
        attributes: { n: "virtual-list", "aria-label": "一万条项目" },
        onMounted: (event) => model.attachList(event.target),
        onScroll: model.onListScroll,
        render: (item) =>
          View(
            {
              style: { height: model.itemHeight },
              class:
                "flex flex-row items-center border-b tt-border-border px-4",
              attributes: { n: "virtual-list-item" },
            },
            [computed(item, (value) => value.title)],
          ),
      }),
      View(
        {
          class: "text-sm tt-text-muted-foreground",
          attributes: { n: "virtual-list-position" },
        },
        [model.position],
      ),
    ],
  );
}
