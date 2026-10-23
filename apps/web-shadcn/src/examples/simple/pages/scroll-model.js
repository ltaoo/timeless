import { computed, ref, vm } from "@timeless/timeless";

export function ScrollPageModel() {
  const items = ref(
    Array.from({ length: 10000 }, (_, index) => ({
      id: index + 1,
      title: `列表项目 ${index + 1}`,
    })),
  );
  const position = ref("尚未滚动");
  const scrollPosition = ref("横向 0 · 纵向 0");
  let list;
  const model = {
    items,
    itemHeight: 48,
    count: computed(
      items,
      (value) => `共 ${value.length} 条数据，仅创建可见行`,
    ),
    position,
    scrollPosition,
    attachList(target) {
      list = target;
    },
    onListScroll(event) {
      position.as(
        `滚动位置 ${Math.round(event.scrollTop)} · 视口高度 ${Math.round(event.clientHeight)}`,
      );
    },
    onScroll(event) {
      scrollPosition.as(
        `横向 ${Math.round(event.scrollLeft)} · 纵向 ${Math.round(event.scrollTop)}`,
      );
    },
    toStart() {
      list?.setScrollTop(0);
    },
    toMiddle() {
      list?.setScrollTop(Math.floor(items.value.length / 2) * 48);
    },
    toEnd() {
      list?.setScrollTop(items.value.length * 48);
    },
    toggleCount() {
      const count = items.value.length === 10000 ? 100 : 10000;
      items.as(
        Array.from({ length: count }, (_, index) => ({
          id: index + 1,
          title: `列表项目 ${index + 1}`,
        })),
      );
    },
  };
  return {
    ...model,
    actions: [
      ["start", "回到顶部", model.toStart],
      ["middle", "跳到中间", model.toMiddle],
      ["end", "跳到末尾", model.toEnd],
      ["count", "切换 100 / 10000 条", model.toggleCount],
    ].map(([key, title, onClick]) => ({
      key,
      title,
      store: new vm.ButtonCore({ variant: "outline", onClick }),
    })),
  };
}
