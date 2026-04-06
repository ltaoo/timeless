import { PageContent, SplitLayout } from "@/components/layout.js";

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
                  h(FieldLabel, {
                    for: fid,
                    store: field$,
                  }),
                ];
              },
            }),
            Match(
              {
                when: computed(field$, (t) => {
                  return t.input.shape;
                }),
              },
              [
                Case("select", [
                  h(Select, {
                    id: fid,
                    store: field$.input,
                  }),
                ]),
                Case("input", [
                  h(Input, {
                    id: fid,
                    store: field$.input,
                  }),
                ]),
                Case("checkbox", [
                  h(Checkbox, {
                    id: fid,
                    store: field$.input,
                  }),
                ]),
              ],
            ),
            Show({
              when: inline,
              ok() {
                return [
                  h(FieldInlineLabel, {
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

  return View({ class: "w-full max-w-md rounded-xl border border-border p-6" }, [
    View({ class: "space-y-6" }, [
      // Payment Method fieldset
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

      // Billing Address fieldset
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

      // Comments fieldset
      View({ class: "space-y-4" }, [
        Field({ store: field_comments$ }, [
          Textarea({
            id: field_comments$.name,
            store: field_comments$.input,
          }),
        ]),
      ]),

      // Buttons
      View({ class: "flex items-center gap-2" }, [
        Button({ store: submit_payment_btn$ }, ["Submit"]),
        Button({ store: cancel_btn$ }, ["Reset"]),
      ]),
    ]),
  ]);
}

function PaymentViewModel() {
  const field_card_name$ = new Timeless.ui.SingleFieldCore({
    label: "Name on Card",
    name: "card_name",
    input: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "John Doe",
    }),
    rules: [{ required: true }],
  });
  const field_card_number$ = new Timeless.ui.SingleFieldCore({
    label: "Card Number",
    name: "card_number",
    help: "Enter your 16-digit number.",
    input: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "1234 5678 9012 3456",
    }),
    rules: [{ required: true }],
  });
  const field_cvv$ = new Timeless.ui.SingleFieldCore({
    label: "CVV",
    name: "cvv",
    input: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "123",
    }),
    rules: [{ required: true }],
  });
  const month_options = Array.from({ length: 12 }, (_, i) => {
    const v = String(i + 1).padStart(2, "0");
    return { label: v, value: v };
  });
  const field_exp_month$ = new Timeless.ui.SingleFieldCore({
    label: "Month",
    name: "exp_month",
    input: new Timeless.ui.SelectCore({
      defaultValue: "",
      placeholder: "MM",
      options: month_options,
    }),
  });
  const year_options = [2024, 2025, 2026, 2027, 2028, 2029].map((y) => ({
    label: String(y),
    value: String(y),
  }));
  const field_exp_year$ = new Timeless.ui.SingleFieldCore({
    label: "Year",
    name: "exp_year",
    input: new Timeless.ui.SelectCore({
      defaultValue: "",
      placeholder: "YYYY",
      options: year_options,
    }),
  });
  const same_as_shipping$ = new Timeless.ui.CheckboxCore({});
  const field_same_as_shipping$ = new Timeless.ui.SingleFieldCore({
    label: "Same as shipping address",
    name: "same_as_shipping",
    input: same_as_shipping$,
  });
  const field_comments$ = new Timeless.ui.SingleFieldCore({
    label: "Comments",
    name: "comments",
    input: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "Add any additional comments",
    }),
  });
  const form$ = new Timeless.ui.ObjectFieldCore({
    fields: {
      card_name: field_card_name$,
      card_number: field_card_number$,
      exp_month: field_exp_month$,
      exp_year: field_exp_year$,
      cvv: field_cvv$,
      same_as_shipping: field_same_as_shipping$,
      comments: field_comments$,
    },
  });

  const submit_payment_btn$ = new Timeless.ui.ButtonCore({
    async onClick() {
      const r = await form$.validate();
      if (r.error) {
        const keys = Object.keys(form$.fields);
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          const field$ = form$.fields[key];
          const rr = await field$.validate();
          if (rr.error) {
            if (
              field$.input &&
              field$.input.shape === "select" &&
              typeof field$.input.show === "function"
            ) {
              field$.input.show();
            } else if (
              field$.input &&
              typeof field$.input.focus === "function"
            ) {
              field$.input.focus();
            }
            const id1 = field$.name;
            const id2 = `field-${field$.name}`;
            const $elm =
              typeof document !== "undefined"
                ? document.getElementById(id1) || document.getElementById(id2)
                : null;
            if ($elm && typeof $elm.scrollIntoView === "function") {
              $elm.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            break;
          }
        }
        return;
      }
      const values = r.data;
      console.log(values);
    },
  });
  const cancel_btn$ = new Timeless.ui.ButtonCore({
    variant: "outline",
    async onClick() {
      form$.reset();
    },
  });

  const ui = {
    field_card_name$,
    field_card_number$,
    field_cvv$,
    field_exp_month$,
    field_exp_year$,
    same_as_shipping$,
    field_comments$,
    submit_payment_btn$,
    cancel_btn$,
    form$,
  };
  return { ui };
}

export default function FormValidateView() {
  const providers_configure = {
    qiniu: new Timeless.ui.ObjectFieldCore({
      fields: {
        access_key: new Timeless.ui.SingleFieldCore({
          label: "Access Key",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Access Key",
          }),
          rules: [
            {
              required: true,
            },
          ],
        }),
        secret_key: new Timeless.ui.SingleFieldCore({
          label: "Secret Key",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Secret Key",
          }),
        }),
        bucket: new Timeless.ui.SingleFieldCore({
          label: "Bucket",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Bucket 名称",
          }),
        }),
        domain: new Timeless.ui.SingleFieldCore({
          label: "Domain",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入外链域名",
          }),
        }),
        zone: new Timeless.ui.SingleFieldCore({
          label: "Zone",
          input: new Timeless.ui.SelectCore({
            defaultValue: "z0",
            placeholder: "请选择存储区域，如 z0, z1",
            options: [
              {
                label: "z0",
                value: "z0",
              },
              {
                label: "z1",
                value: "z1",
              },
            ],
          }),
        }),
        use_https: new Timeless.ui.SingleFieldCore({
          label: "使用 HTTPS",
          input: new Timeless.ui.CheckboxCore({}),
        }),
      },
    }),
    s3: new Timeless.ui.ObjectFieldCore({
      fields: {
        endpoint: new Timeless.ui.SingleFieldCore({
          label: "Endpoint",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Endpoint",
          }),
        }),
        region: new Timeless.ui.SingleFieldCore({
          label: "Region",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Region",
          }),
        }),
        bucket: new Timeless.ui.SingleFieldCore({
          label: "Bucket",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Bucket 名称",
          }),
        }),
        access_key_id: new Timeless.ui.SingleFieldCore({
          label: "Access Key ID",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Access Key ID",
          }),
        }),
        secret_access_key: new Timeless.ui.SingleFieldCore({
          label: "Secret Access Key",
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入 Secret Access Key",
          }),
        }),
        force_path_style: new Timeless.ui.SingleFieldCore({
          label: "强制路径样式",
          input: new Timeless.ui.CheckboxCore({
            // defaultValue: false,
          }),
        }),
      },
    }),
    webdav: new Timeless.ui.ObjectFieldCore({
      fields: {
        url: new Timeless.ui.SingleFieldCore({
          label: "URL",
          input: new Timeless.ui.InputCore({
            placeholder: "请输入 WebDAV URL",
            defaultValue: "",
          }),
        }),
        username: new Timeless.ui.SingleFieldCore({
          label: "Username",
          input: new Timeless.ui.InputCore({
            placeholder: "请输入用户名",
            defaultValue: "",
          }),
        }),
        password: new Timeless.ui.SingleFieldCore({
          label: "Password",
          input: new Timeless.ui.InputCore({
            placeholder: "请输入密码",
            defaultValue: "",
          }),
        }),
      },
    }),
  };

  const configure$_ = ref(providers_configure["qiniu"]);

  const field_provider$ = new Timeless.ui.SingleFieldCore({
    label: "存储源",
    name: "provider",
    input: new Timeless.ui.SelectCore({
      defaultValue: "qiniu",
      options: [
        { value: "qiniu", label: "七牛云" },
        { value: "s3", label: "S3" },
        { value: "webdav", label: "WebDAV" },
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

  const submit_configure_btn$ = new Timeless.ui.ButtonCore({
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

  return PageContent({ class: "page--validate overflow-x-hidden" }, [
    SplitLayout({
      direction: "vertical",
      items: [
        {
          defaultSize: 75,
          minSize: 50,
          maxSize: 90,
          class: "p-6",
          children: [
            PaymentFormView({
              store: payment$,
            }),
            Separator({ class: "my-6" }),
            View({ class: "w-full max-w-md rounded-xl border border-border p-6" }, [
              Field({ store: field_provider$ }, [
                Select({
                  id: field_provider$.name,
                  store: field_provider$.input,
                }),
              ]),
              FormRender({ class: "mt-6", store: configure$_ }, [
                Button({ store: submit_configure_btn$ }, ["Submit"]),
              ]),
            ]),
          ],
        },
        {
          defaultSize: 25,
          minSize: 10,
          maxSize: 50,
          children: [
            View({ class: "flex items-center gap-2 p-6" }, [
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      payment$.ui.form$.fields.card_name.input.focus();
                    },
                  }),
                },
                ["Focus Name on Card"],
              ),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      payment$.ui.form$.fields.exp_month.input.show();
                    },
                  }),
                },
                ["Focus Month Select"],
              ),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
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
            ]),
          ],
        },
      ],
    }),
  ]);
}
