import { Section, Item } from "@/components/index.js";

function LLMStoreModel() {
  let providers = [
    {
      id: "openai",
      name: "OpenAI",
      logo_uri: "",
      placeholder: "https://api.openai.com",
      enabled: true,
      apiProxyAddress: "",
      apiKey: "",
      models: [
        {
          id: "gpt-4o-mini",
          name: "gpt-4o-mini",
          enabled: true,
          builtin: true,
        },
        {
          id: "gpt-4.1-mini",
          name: "gpt-4.1-mini",
          enabled: false,
          builtin: true,
        },
      ],
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      logo_uri: "",
      placeholder: "https://api.deepseek.com",
      enabled: true,
      apiProxyAddress: "",
      apiKey: "",
      models: [
        {
          id: "deepseek-chat",
          name: "deepseek-chat",
          enabled: true,
          builtin: true,
        },
        {
          id: "deepseek-reasoner",
          name: "deepseek-reasoner",
          enabled: false,
          builtin: true,
        },
      ],
    },
    {
      id: "custom",
      name: "Custom",
      logo_uri: "",
      placeholder: "https://example.com/v1",
      enabled: false,
      apiProxyAddress: "",
      apiKey: "",
      models: [
        { id: "my-model", name: "my-model", enabled: true, builtin: false },
      ],
    },
  ];

  const bus = Timeless.base();

  const methods = {
    emitState() {
      bus.emit("StateChange", { providers });
    },
    toggleProviderEnabled(payload) {
      providers = providers.map((p) => {
        if (p.id !== payload.provider_id) return p;
        return { ...p, enabled: !!payload.enabled };
      });
      methods.emitState();
    },
    updateProviderApiProxyAddress(payload) {
      providers = providers.map((p) => {
        if (p.id !== payload.provider_id) return p;
        return { ...p, apiProxyAddress: payload.apiProxyAddress || "" };
      });
      methods.emitState();
    },
    updateProviderApiKey(payload) {
      providers = providers.map((p) => {
        if (p.id !== payload.provider_id) return p;
        return { ...p, apiKey: payload.apiKey || "" };
      });
      methods.emitState();
    },
    toggleModelEnabled(payload) {
      providers = providers.map((p) => {
        if (p.id !== payload.provider_id) return p;
        return {
          ...p,
          models: (p.models || []).map((m) => {
            if (m.id !== payload.model_id) return m;
            return { ...m, enabled: !!payload.enabled };
          }),
        };
      });
      methods.emitState();
    },
    deleteProviderModel(payload) {
      providers = providers.map((p) => {
        if (p.id !== payload.provider_id) return p;
        return {
          ...p,
          models: (p.models || []).filter((m) => {
            if (m.id !== payload.model_id) return true;
            return !!m.builtin;
          }),
        };
      });
      methods.emitState();
    },
    addPendingModel(payload) {
      const model_id = (payload.model_id || "").trim();
      if (!model_id) return;
      providers = providers.map((p) => {
        if (p.id !== payload.provider_id) return p;
        const exists = (p.models || []).some((m) => m.id === model_id);
        if (exists) return p;
        return {
          ...p,
          models: [
            ...(p.models || []),
            { id: model_id, name: model_id, enabled: true, builtin: false },
          ],
        };
      });
      methods.emitState();
    },
  };

  const api = {
    get state() {
      return { providers };
    },
    methods,
    onStateChange(handler) {
      return bus.on("StateChange", handler);
    },
  };
  return api;
}

/**
 *
 * @param {object} props
 * @param {ReturnType<typeof LLMStoreModel>} props.store
 * @returns
 */
function ModelSelect(props) {
  const state_ = refobj(props.store.state);

  const methods = {
    buildSelectOptions(providers = []) {
      const groups = providers.filter((p) => p.enabled).map((p) => {
        const label = () =>
          View({ class: "flex items-center gap-2" }, [
            ProviderIcon(p),
            View(
              {
                class: classNames([
                  "truncate",
                  !p.enabled ? "opacity-50" : "",
                ]),
              },
              [p.name],
            ),
          ]);
        return new Timeless.ui.SelectGroupCore({
          label,
          options: (p.models || []).map((m) => {
            return new Timeless.ui.SelectItemCore({
              value: `${p.id}/${m.id}`,
              label: m.name,
              disabled: !p.enabled || !m.enabled,
            });
          }),
        });
      });
      return groups;
    },
  };

  const select$ = new Timeless.ui.SelectCore({
    defaultValue: null,
    placeholder: "选择模型",
    options: methods.buildSelectOptions(props.store.state.providers),
    search: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "搜索模型...",
    }),
  });

  props.store.onStateChange((v) => {
    state_.as(v);
    select$.setOptions(methods.buildSelectOptions(v.providers));
  });

  return View({ class: "space-y-2 w-[280px]" }, [Select({ store: select$ })]);
}

export default function LLMPageView() {
  const view$ = new Timeless.ui.ScrollViewCore({});

  const llm_provider_store$ = LLMStoreModel();

  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      Section("LLM Provider", [
        Item("ModelSelect", [ModelSelect({ store: llm_provider_store$ })]),
        Item("Manager", [LLMProviderForm({ store: llm_provider_store$ })]),
      ]),
    ]),
  ]);
}

function ProviderIcon(provider) {
  const name = String(provider?.name || "");
  const initial = name ? name.slice(0, 1).toUpperCase() : "?";
  const uri = String(provider?.logo_uri || "");
  const disabled = !provider?.enabled;
  if (uri) {
    return Img({
      class: classNames([
        "size-4 rounded-sm object-cover shrink-0",
        disabled ? "opacity-50" : "",
      ]),
      src: uri,
      alt: name || "provider",
    });
  }
  return View(
    {
      class: classNames([
        "size-4 rounded-sm bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
        "flex items-center justify-center text-[10px] font-semibold shrink-0",
        disabled ? "opacity-50" : "",
      ]),
    },
    [initial],
  );
}
