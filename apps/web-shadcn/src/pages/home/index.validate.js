import { PaymentViewModel } from "./index.validate.model.js";

function FormRender(props, children) {
  const field_names = computed(props.store, (t) => {
    if (!t) {
      return [];
    }
    return Object.keys(t.fields);
  });
  return View({ class: Timeless.classNames([props.class, "space-y-6"]) }, [
    For({
      each: field_names,
      render(name) {
        if (!props.store.value.fields) {
          return null;
        }
        const field$ = props.store.value.fields[name];
        if (!field$) {
          return null;
        }
        const fid = `field-${name}`;
        const inline = ["checkbox"].includes(field$.input.shape);
        return View(
          {
            class: Timeless.classNames([
              "t-form-item gap-2",
              inline ? "flex items-center" : "flex flex-col",
            ]),
            // inline: ["checkbox"].includes(field$.input.shape)
          },
          [
            Show({
              when: !inline,
              ok() {
                return [
                  FieldLabel({
                    for: fid,
                    store: field$,
                  }),
                ];
              },
            }),
            Match({
              when: computed(field$, (t) => {
                return t.input.shape;
              }),
              cases: {
                select() {
                  return Select({
                    id: fid,
                    store: field$.input,
                  });
                },
                input() {
                  return Input({
                    id: fid,
                    store: field$.input,
                  });
                },
                checkbox() {
                  return Checkbox({
                    id: fid,
                    store: field$.input,
                  });
                },
              },
            }),
            Show({
              when: inline,
              ok() {
                return [
                  FieldInlineLabel({
                    for: fid,
                    store: field$,
                  }),
                ];
              },
            }),
          ],
        );
      },
    }),
    Fragment({}, children),
  ]);
}

/**
 *
 * @param {{ store: ReturnType<typeof PaymentViewModel>}} props
 * @returns
 */
function PaymentFormView(props) {
  const { store } = props;
  const {
    field_card_name$,
    field_card_number$,
    field_cvv$,
    field_exp_month$,
    field_exp_year$,
    same_as_shipping$,
    field_comments$,
    submit_payment_btn$,
    cancel_btn$,
  } = store.ui;

  return View(
    { class: "w-full max-w-md rounded-xl border border-border p-6" },
    [
      View({ class: "space-y-6" }, [
        View({ class: "space-y-4" }, [
          View({ class: "space-y-1" }, [
            View(
              { class: "text-base font-semibold leading-none tracking-tight" },
              ["Payment Method"],
            ),
            View({ class: "text-sm text-muted-foreground" }, [
              "All transactions are secure and encrypted",
            ]),
          ]),
          View({ class: "space-y-4" }, [
            Field({ store: field_card_name$ }, [
              Input({
                id: field_card_name$.name,
                store: field_card_name$.input,
              }),
            ]),
            View({ class: "grid grid-cols-3 gap-4" }, [
              View({ class: "col-span-2" }, [
                Field({ store: field_card_number$ }, [
                  Input({
                    id: field_card_number$.name,
                    store: field_card_number$.input,
                  }),
                ]),
              ]),
              View({ class: "col-span-1" }, [
                Field({ store: field_cvv$ }, [
                  Input({
                    id: field_cvv$.name,
                    store: field_cvv$.input,
                  }),
                ]),
              ]),
            ]),
            View({ class: "grid grid-cols-2 gap-4" }, [
              Field({ store: field_exp_month$ }, [
                Select({
                  id: field_exp_month$.name,
                  store: field_exp_month$.input,
                }),
              ]),
              Field({ store: field_exp_year$ }, [
                Select({
                  id: field_exp_year$.name,
                  store: field_exp_year$.input,
                }),
              ]),
            ]),
          ]),
        ]),

        Separator({}),

        View({ class: "space-y-4" }, [
          View({ class: "space-y-1" }, [
            View(
              { class: "text-base font-semibold leading-none tracking-tight" },
              ["Billing Address"],
            ),
            View({ class: "text-sm text-muted-foreground" }, [
              "The billing address associated with your payment method",
            ]),
          ]),
          View({ class: "flex items-center gap-2" }, [
            Checkbox({
              id: "same_as_shipping",
              store: same_as_shipping$,
            }),
            FieldInlineLabel({
              for: "same_as_shipping",
              store: store.ui.form$.fields.same_as_shipping,
            }),
          ]),
        ]),

        Separator({}),

        View({ class: "space-y-4" }, [
          Field({ store: field_comments$ }, [
            Textarea({
              id: field_comments$.name,
              store: field_comments$.input,
            }),
          ]),
        ]),

        View({ class: "flex items-center gap-2" }, [
          Button({ store: submit_payment_btn$ }, ["Submit"]),
          Button({ store: cancel_btn$ }, ["Reset"]),
        ]),
      ]),
    ],
  );
}

export default function FormValidateView() {
  const providers_configure = {
    qiniu: new Timeless.vm.ObjectFieldCore({
      fields: {
        access_key: new Timeless.vm.SingleFieldCore({
          label: "Access Key",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Access Key",
          }),
          rules: [
            {
              required: true,
            },
          ],
        }),
        secret_key: new Timeless.vm.SingleFieldCore({
          label: "Secret Key",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Secret Key",
          }),
        }),
        bucket: new Timeless.vm.SingleFieldCore({
          label: "Bucket",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Bucket 名称",
          }),
        }),
        domain: new Timeless.vm.SingleFieldCore({
          label: "Domain",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入外链域名",
          }),
        }),
        zone: new Timeless.vm.SingleFieldCore({
          label: "Zone",
          input: new Timeless.vm.SelectCore({
            defaultValue: "z0",
            placeholder: "请选择存储区域，如 z0, z1",
            options: [
              new Timeless.vm.SelectItemCore({
                label: "z0",
                value: "z0",
              }),
              new Timeless.vm.SelectItemCore({
                label: "z1",
                value: "z1",
              }),
            ],
          }),
        }),
        use_https: new Timeless.vm.SingleFieldCore({
          label: "使用 HTTPS",
          input: new Timeless.vm.CheckboxCore({}),
        }),
      },
    }),
    s3: new Timeless.vm.ObjectFieldCore({
      fields: {
        endpoint: new Timeless.vm.SingleFieldCore({
          label: "Endpoint",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Endpoint",
          }),
        }),
        region: new Timeless.vm.SingleFieldCore({
          label: "Region",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Region",
          }),
        }),
        bucket: new Timeless.vm.SingleFieldCore({
          label: "Bucket",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Bucket 名称",
          }),
        }),
        access_key_id: new Timeless.vm.SingleFieldCore({
          label: "Access Key ID",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Access Key ID",
          }),
        }),
        secret_access_key: new Timeless.vm.SingleFieldCore({
          label: "Secret Access Key",
          input: new Timeless.vm.InputCore({
            defaultValue: "",
            placeholder: "请输入 Secret Access Key",
          }),
        }),
        force_path_style: new Timeless.vm.SingleFieldCore({
          label: "强制路径样式",
          input: new Timeless.vm.CheckboxCore({
            // defaultValue: false,
          }),
        }),
      },
    }),
    webdav: new Timeless.vm.ObjectFieldCore({
      fields: {
        url: new Timeless.vm.SingleFieldCore({
          label: "URL",
          input: new Timeless.vm.InputCore({
            placeholder: "请输入 WebDAV URL",
            defaultValue: "",
          }),
        }),
        username: new Timeless.vm.SingleFieldCore({
          label: "Username",
          input: new Timeless.vm.InputCore({
            placeholder: "请输入用户名",
            defaultValue: "",
          }),
        }),
        password: new Timeless.vm.SingleFieldCore({
          label: "Password",
          input: new Timeless.vm.InputCore({
            placeholder: "请输入密码",
            defaultValue: "",
          }),
        }),
      },
    }),
  };

  const configure$_ = ref(providers_configure["qiniu"]);

  const field_provider$ = new Timeless.vm.SingleFieldCore({
    label: "存储源",
    name: "provider",
    input: new Timeless.vm.SelectCore({
      defaultValue: "qiniu",
      options: [
        new Timeless.vm.SelectItemCore({
          value: "qiniu",
          label: "七牛云",
        }),
        new Timeless.vm.SelectItemCore({
          value: "s3",
          label: "S3",
        }),
        new Timeless.vm.SelectItemCore({
          value: "webdav",
          label: "WebDAV",
        }),
      ],
      onChange(id) {
        const matched_provider_configure = providers_configure[id];
        if (!matched_provider_configure) {
          return;
        }
        configure$_.as(matched_provider_configure);
      },
    }),
  });

  const submit_configure_btn$ = new Timeless.vm.ButtonCore({
    async onClick() {
      const r = await configure$_.value.validate();
      if (r.error) {
        console.log(r.error);
        return;
      }
      const values = r.data;
      console.log(values);
    },
  });
  const payment$ = PaymentViewModel();

  return View({ class: "page--validate h-screen" }, [
    SplitView({
      direction: "vertical",
      panels: [
        {
          size: "auto",
          content() {
            return View({ class: "p-6 overflow-y-auto h-full" }, [
              PaymentFormView({
                store: payment$,
              }),
              Separator({ class: "my-6" }),
              View(
                {
                  class: "w-full max-w-md rounded-xl border border-border p-6",
                },
                [
                  Field({ store: field_provider$ }, [
                    Select({
                      id: field_provider$.name,
                      store: field_provider$.input,
                    }),
                  ]),
                  FormRender({ class: "mt-6", store: configure$_ }, [
                    Button({ store: submit_configure_btn$ }, ["Submit"]),
                  ]),
                ],
              ),
            ]);
          },
        },
        {
          size: 300,
          content() {
            return View({ class: "flex items-center gap-2 p-6" }, [
              Button(
                {
                  store: new Timeless.vm.ButtonCore({
                    onClick() {
                      payment$.ui.form$.fields.card_name.input.focus();
                    },
                  }),
                },
                ["Focus Name on Card"],
              ),
              Button(
                {
                  store: new Timeless.vm.ButtonCore({
                    onClick() {
                      payment$.ui.form$.fields.exp_month.input.show();
                    },
                  }),
                },
                ["Focus Month Select"],
              ),
              Button(
                {
                  store: new Timeless.vm.ButtonCore({
                    variant: "outline",
                    async onClick() {
                      payment$.ui.submit_payment_btn$.setLoading(true);
                      payment$.ui.form$.fields.card_name.input.setLoading(true);
                      payment$.ui.form$.fields.card_number.input.setLoading(
                        true,
                      );
                      payment$.ui.form$.fields.cvv.input.setLoading(true);
                      payment$.ui.form$.fields.comments.input.setLoading(true);
                      payment$.ui.form$.fields.exp_year.input.setLoading(true);
                      try {
                        await new Promise((r) => setTimeout(r, 1200));
                        payment$.ui.form$.setValue({
                          card_name: "John Doe",
                          card_number: "4242 4242 4242 4242",
                          cvv: "123",
                          exp_month: "12",
                          exp_year: "2029",
                          comments: "Some test comments",
                        });
                      } finally {
                        submit_configure_btn$.setLoading(false);
                        payment$.ui.form$.fields.card_name.input.setLoading(
                          false,
                        );
                        payment$.ui.form$.fields.card_number.input.setLoading(
                          false,
                        );
                        payment$.ui.form$.fields.cvv.input.setLoading(false);
                        payment$.ui.form$.fields.comments.input.setLoading(
                          false,
                        );
                      }
                    },
                  }),
                },
                ["Loading data"],
              ),
            ]);
          },
        },
      ],
    }),
  ]);
}
