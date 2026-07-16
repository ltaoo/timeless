const { View, Text, ref, refobj, computed, Show, For, Icon } = Timeless;
import { Section } from "../../components/index.js";

export default function Page(props) {
  const provider_ = ref("openai");
  const model_ = ref("gpt-4");

  const providers = [
    { key: "openai", label: "OpenAI", icon: "O", models: [{ v: "gpt-4", l: "GPT-4" }, { v: "gpt-4o", l: "GPT-4o" }, { v: "gpt-3.5", l: "GPT-3.5" }] },
    { key: "deepseek", label: "DeepSeek", icon: "D", models: [{ v: "deepseek-v3", l: "DeepSeek V3" }, { v: "deepseek-r1", l: "DeepSeek R1" }] },
    { key: "custom", label: "Custom", icon: "C", models: [{ v: "custom-model", l: "Custom Model" }] },
  ];

  const currentProvider = computed(provider_, (k) => providers.find((p) => p.key === k));
  const models = computed(currentProvider, (p) => p?.models || []);

  return View({ class: "p-6" }, [
    Text({ class: "text-2xl font-bold mb-6" }, ["LLM Model Selector"]),

    Section("Provider", [
      View({ class: "flex gap-2" }, [
        ...providers.map((p) =>
          View({
            class: "flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors " +
              (provider_.value === p.key ? "border-primary bg-accent" : "border-border hover:bg-accent"),
            onClick() { provider_.as(p.key); model_.as(p.models[0].v); },
          }, [
            View({ class: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm" }, [p.icon]),
            Text({ class: "text-sm font-medium" }, [p.label]),
          ]),
        ),
      ]),
    ]),

    Section("Model", [
      View({ class: "flex gap-2" }, [
        ...models.value.map((m) =>
          View({
            class: "rounded-lg border px-4 py-2 text-sm cursor-pointer transition-colors " +
              (model_.value === m.v ? "border-primary bg-accent" : "border-border hover:bg-accent"),
            onClick() { model_.as(m.v); },
          }, [m.l]),
        ),
      ]),
    ]),

    Section("Selection", [
      View({ class: "rounded-lg border border-border bg-card p-4" }, [
        Text({ class: "text-sm text-muted-foreground" }, ["Selected:"]),
        Text({ class: "text-sm font-medium" }, [
          (providers.find((p) => p.key === provider_.value)?.label || "") +
          " / " + model_.value,
        ]),
      ]),
    ]),
  ]);
}
