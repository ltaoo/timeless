import { computed, refobj, classNames } from "@timeless/primitive";
import { For, NativeImg, Show, View, ViewProps } from "@timeless/primitive";
import { ButtonCore, CheckboxCore, InputCore } from "@timeless/ui";

import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Checkbox } from "./checkbox";
import { Input } from "./input";

export type LLMProviderFormProviderModel = {
  id: string;
  name: string;
  enabled: boolean;
  builtin: boolean;
};

export type LLMProviderFormProvider = {
  id: string;
  name: string;
  logo_uri?: string;
  placeholder?: string;
  enabled: boolean;
  apiProxyAddress?: string;
  apiKey?: string;
  models: LLMProviderFormProviderModel[];
};

export type LLMProviderFormStore = {
  state: {
    providers: LLMProviderFormProvider[];
  };
  onStateChange?: (
    handler: (state: LLMProviderFormStore["state"]) => void,
  ) => () => void;
  toggleProviderEnabled?: (payload: {
    provider_id: string;
    enabled: boolean;
  }) => void;
  updateProviderApiProxyAddress?: (payload: {
    provider_id: string;
    apiProxyAddress: string;
  }) => void;
  updateProviderApiKey?: (payload: {
    provider_id: string;
    apiKey: string;
  }) => void;
  toggleModelEnabled?: (payload: {
    provider_id: string;
    model_id: string;
    enabled: boolean;
  }) => void;
  deleteProviderModel?: (payload: {
    provider_id: string;
    model_id: string;
  }) => void;
  addPendingModel?: (payload: {
    provider_id: string;
    model_id?: string;
  }) => void;
};

export function LLMProviderForm(
  props: ViewProps & {
    store: LLMProviderFormStore;
  },
) {
  const { store, class: cls, ...rest } = props;

  const state_ = refobj(store.state);
  store.onStateChange?.((v) => {
    state_.as(v);
  });

  const providers_ = computed(state_, (s) => s.providers || []);

  return View(
    {
      ...rest,
      class: classNames(["space-y-6", cls]),
    },
    [
      For({
        each: providers_,
        key: "id",
        render(provider) {
          const enabled_ = computed(state_, (s) => {
            const p = (s.providers || []).find((x) => x.id === provider.id);
            return p?.enabled ?? false;
          });
          const enabled_checkbox$ = new CheckboxCore({
            checked: provider.enabled,
            onChange: (checked) => {
              store.toggleProviderEnabled?.({
                provider_id: provider.id,
                enabled: checked,
              });
            },
          });
          const api_proxy_input$ = new InputCore({
            defaultValue: provider.apiProxyAddress || "",
            placeholder: provider.placeholder || "",
            onChange: (v) => {
              store.updateProviderApiProxyAddress?.({
                provider_id: provider.id,
                apiProxyAddress: String(v || ""),
              });
            },
          });
          const api_key_input$ = new InputCore({
            defaultValue: provider.apiKey || "",
            placeholder: "请输入 API Key",
            type: "password",
            onChange: (v) => {
              store.updateProviderApiKey?.({
                provider_id: provider.id,
                apiKey: String(v || ""),
              });
            },
          });
          const pending_model_input$ = new InputCore({
            defaultValue: "",
            placeholder: "输入模型名称",
            onEnter: (value) => {
              const v = String(value || "").trim();
              store.addPendingModel?.({
                provider_id: provider.id,
                model_id: v || undefined,
              });
              pending_model_input$.setValue("");
            },
          });
          const add_model_btn$ = new ButtonCore({
            size: "lg",
            onClick: () => {
              const v = String(pending_model_input$.value || "").trim();
              store.addPendingModel?.({
                provider_id: provider.id,
                model_id: v || undefined,
              });
              pending_model_input$.setValue("");
            },
          });

          return Card({}, [
            CardContent({ class: "p-6" }, [
              View({ class: "flex items-center justify-between gap-4" }, [
                View({ class: "flex items-center gap-3 min-w-0" }, [
                  Show({
                    when: computed(
                      state_,
                      (s) =>
                        !!(s.providers || []).find((x) => x.id === provider.id)
                          ?.logo_uri,
                    ),
                    ok() {
                      return [
                        NativeImg({
                          class:
                            "h-10 w-10 shrink-0 rounded-lg object-contain p-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
                          src: computed(state_, (s) => {
                            const p = (s.providers || []).find(
                              (x) => x.id === provider.id,
                            );
                            return p?.logo_uri || "";
                          }),
                          alt: `${provider.name} logo`,
                        }),
                      ];
                    },
                    else() {
                      return [
                        View(
                          {
                            class:
                              "h-10 w-10 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300",
                          },
                          [provider.name.slice(0, 1).toUpperCase()],
                        ),
                      ];
                    },
                  }),
                  View({ class: "min-w-0" }, [
                    View(
                      {
                        class:
                          "truncate text-base font-medium text-zinc-900 dark:text-zinc-50",
                      },
                      [provider.name],
                    ),
                    View(
                      {
                        class:
                          "truncate text-xs text-zinc-500 dark:text-zinc-400",
                      },
                      [provider.id],
                    ),
                  ]),
                ]),
                Checkbox({
                  id: `${provider.id}-enabled`,
                  store: enabled_checkbox$,
                  class: "h-5 w-5",
                }),
              ]),
            Show({
              when: enabled_,
              ok() {
                return [
                  View({ class: "mt-6 space-y-6" }, [
                    View({ class: "grid grid-cols-1 md:grid-cols-2 gap-4" }, [
                      View({ class: "space-y-2" }, [
                        View(
                          {
                            class:
                              "text-sm font-medium text-zinc-700 dark:text-zinc-300",
                          },
                          ["API 代理地址"],
                        ),
                        Input({ store: api_proxy_input$ }),
                      ]),
                      View({ class: "space-y-2" }, [
                        View(
                          {
                            class:
                              "text-sm font-medium text-zinc-700 dark:text-zinc-300",
                          },
                          ["API Key"],
                        ),
                        Input({ store: api_key_input$ }),
                      ]),
                    ]),
                    View({ class: "space-y-3" }, [
                      View(
                        {
                          class:
                            "text-sm font-medium text-zinc-700 dark:text-zinc-300",
                        },
                        ["模型选择"],
                      ),
                      View({ class: "flex flex-wrap gap-2" }, [
                        For({
                          each: computed(state_, (s) => {
                            const p = (s.providers || []).find(
                              (x) => x.id === provider.id,
                            );
                            return p?.models || [];
                          }),
                          key: "id",
                          render(model) {
                            const model_checkbox$ = new CheckboxCore({
                              checked: model.enabled,
                              onChange: (checked) => {
                                store.toggleModelEnabled?.({
                                  provider_id: provider.id,
                                  model_id: model.id,
                                  enabled: checked,
                                });
                              },
                            });
                            const delete_btn$ = new ButtonCore({
                              variant: "link",
                              size: "xs",
                              onClick: () => {
                                store.deleteProviderModel?.({
                                  provider_id: provider.id,
                                  model_id: model.id,
                                });
                              },
                            });
                            return View(
                              {
                                class:
                                  "flex items-center gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2",
                              },
                              [
                                View(
                                  {
                                    class:
                                      "text-sm text-zinc-700 dark:text-zinc-300",
                                  },
                                  [model.name],
                                ),
                                Show({
                                  when: !model.builtin,
                                  ok() {
                                    return [
                                      Button(
                                        {
                                          store: delete_btn$,
                                          class:
                                            "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-0 h-auto",
                                        },
                                        ["删除"],
                                      ),
                                    ];
                                  },
                                }),
                                Checkbox({
                                  id: `${provider.id}-${model.id}`,
                                  store: model_checkbox$,
                                  class: "h-4 w-4",
                                }),
                              ],
                            );
                          },
                        }),
                      ]),
                      View(
                        {
                          class:
                            "pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2",
                        },
                        [
                          View(
                            {
                              class:
                                "text-sm font-medium text-zinc-700 dark:text-zinc-300",
                            },
                            ["添加新模型"],
                          ),
                          View({ class: "flex items-center gap-2" }, [
                            View({ class: "flex-1" }, [
                              Input({ store: pending_model_input$ }),
                            ]),
                            Button({ store: add_model_btn$ }, ["添加"]),
                          ]),
                        ],
                      ),
                    ]),
                  ]),
                ];
              },
            }),
            ]),
          ]);
        },
      }),
    ],
  );
}
