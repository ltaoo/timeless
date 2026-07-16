const { View, Text, Fragment, ref, Show } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const activeTab_ = ref("tab1");
  const accOpen_ = ref(null);

  const tabs = [
    { key: "tab1", label: "Account" },
    { key: "tab2", label: "Password" },
    { key: "tab3", label: "Settings" },
  ];

  const accordionItems = [
    { key: "a1", label: "Getting Started", content: "Installation guide and quick start tutorial." },
    { key: "a2", label: "Configuration", content: "Configure your project settings and environment." },
    { key: "a3", label: "Deployment", content: "Deploy your application to production." },
  ];

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["Navigation Components"]),

    Section("Tabs", [
      View({ class: "space-y-4" }, [
        View({ class: "flex gap-0 border-b border-border" }, [
          ...tabs.map((tab) =>
            View({
              class: "px-4 py-2 text-sm cursor-pointer border-b-2 transition-colors " +
                (activeTab_.value === tab.key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"),
              onClick() { activeTab_.as(tab.key); },
            }, [tab.label]),
          ),
        ]),
        Show({
          when: true,
          ok() { return View({ class: "p-4 text-sm" }, ["Content for " + tabs.find((t) => t.key === activeTab_.value)?.label]); },
        }),
      ]),
    ]),

    Section("Accordion", [
      View({ class: "max-w-md space-y-1" }, [
        ...accordionItems.map((item) =>
          View({ class: "border border-border rounded-lg overflow-hidden" }, [
            View({
              class: "flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer hover:bg-accent",
              onClick() { accOpen_.as(accOpen_.value === item.key ? null : item.key); },
            }, [
              Text({}, [item.label]),
              Text({ class: "text-muted-foreground" }, [accOpen_.value === item.key ? "-" : "+"]),
            ]),
            Show({ when: ref(accOpen_.value === item.key), ok() { return [
              View({ class: "px-4 pb-3 text-sm text-muted-foreground border-t border-border" }, [item.content || ""]),
            ]; } }),
          ]),
        ),
      ]),
    ]),
  ]);
}
