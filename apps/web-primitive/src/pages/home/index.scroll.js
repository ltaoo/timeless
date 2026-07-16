const { View, Text, Fragment, For, ref, computed } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const items_ = ref(Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: "Item " + (i + 1),
    desc: "Description for item " + (i + 1),
  })));

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Scroll View"]),

    Section("Virtual Scroll Demo", [
      View({ class: "border border-border rounded-lg overflow-auto max-h-[400px]" }, [
        ...items_.value.map((item) =>
          View({ class: "flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-accent" }, [
            View({ class: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold" }, [String(item.id)]),
            View({}, [
              Text({ class: "text-sm font-medium" }, [item.title]),
              Text({ class: "text-xs text-muted-foreground" }, [item.desc]),
            ]),
          ]),
        ),
      ]),
    ]),
  ]);
}
