const { View, Text, Fragment, ref, refobj, computed, Show, For } = Timeless;
import { Section, Item } from "../../components/index.js";

export default function Page(props) {
  const keyword_ = ref("");
  const results_ = ref([]);
  const loading_ = ref(false);

  const allFruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape", "Honeydew", "Kiwi", "Lemon"];

  function onSearch(kw) {
    keyword_.as(kw);
    loading_.as(true);
    setTimeout(() => {
      results_.as(
        allFruits.filter((f) => f.toLowerCase().includes(kw.toLowerCase())),
      );
      loading_.as(false);
    }, 300);
  }

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Debug / Search Select"]),

    Section("Search Select", [
      View({ class: "max-w-xs space-y-2" }, [
        View({ class: "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm items-center gap-2" }, [
          View({ as: "input", class: "flex-1 bg-transparent outline-none", placeholder: "Search fruits...", value: keyword_.value }),
          loading_.value ? Text({ class: "text-xs text-muted-foreground" }, ["..."]) : null,
        ]),
        View({ class: "flex gap-1" }, [
          ...allFruits.slice(0, 6).map((f) =>
            View({
              class: "rounded border border-input px-2 py-0.5 text-xs cursor-pointer hover:bg-accent",
              onClick() { onSearch(f); },
            }, [f]),
          ),
        ]),
        Show({ when: computed(keyword_, (k) => k.length > 0), ok() { return [
          View({ class: "rounded-md border border-border bg-white dark:bg-zinc-900 shadow-md max-h-48 overflow-auto p-1" }, [
            results_.value.length > 0
              ? results_.value.map((f) =>
                View({
                  class: "px-3 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent",
                  onClick() { keyword_.as(f); results_.as([]); },
                }, [f]),
              )
              : [Text({ class: "px-3 py-1.5 text-sm text-muted-foreground" }, ["No results"])],
          ]),
        ]; } }),
      ]),
    ]),
  ]);
}
