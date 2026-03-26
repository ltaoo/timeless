function FormRender(props) {
  const field_names = computed(props, (t) => {
    if (!t) {
      return [];
    }
    return Object.keys(t.fields);
  });
  return View({ class: "space-y-8" }, [
    For({
      each: field_names,
      render(name) {
        if (!props.value.fields) {
          return null;
        }
        const field$ = props.value.fields[name];
        if (!field$) {
          return null;
        }
        const fid = `field-${name}`;
        const inline = ["checkbox"].includes(field$.input.shape);
        return View(
          {
            class: cn([
              "t-form-item gap-2",
              inline ? "flex items-center" : "flex flex-col",
            ]),
            // inline: ["checkbox"].includes(field$.input.shape)
          },
          [
            Show({ when: !inline }, [
              h(FieldLabel, {
                for: fid,
                store: field$,
              }),
            ]),
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
            Show({ when: inline }, [
              h(FieldLabel, {
                for: fid,
                store: field$,
              }),
            ]),
          ],
        );
      },
    }),
  ]);
}

function FieldDemoView(stores) {
  const {
    field_card_name$,
    field_card_number$,
    field_cvv$,
    field_exp_month$,
    field_exp_year$,
    same_as_shipping$,
    field_comments$,
    submit_configure_btn$,
    cancel_btn$,
    form$,
  } = stores;

  return View({ class: "w-full max-w-md rounded-xl border p-6" }, [
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
            id: "same-as-shipping",
            store: same_as_shipping$,
          }),
          View(
            {
              as: "label",
              attributes: {
                for: "same-as-shipping",
              },
              class: "text-sm font-normal select-none",
            },
            ["Same as shipping address"],
          ),
        ]),
      ]),

      Separator({}),

      // Comments fieldset
      View({ class: "space-y-4" }, [
        Field({ store: field_comments$ }, [
          Textarea({
            id: `field-${field_comments$.name}`,
            store: field_comments$.input,
          }),
        ]),
      ]),

      // Buttons
      View({ class: "flex items-center gap-2" }, [
        Button({ store: submit_configure_btn$ }, ["Submit"]),
        Button({ store: cancel_btn$ }, ["Reset"]),
      ]),
    ]),
  ]);
}

export default function FormValidateView() {
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

  const panelsGroup = new Timeless.ui.ResizablePanelsCore({
    direction: "vertical",
  });
  const topPanel = new Timeless.ui.ResizablePanelCore({
    defaultSize: 75,
    minSize: 50,
    maxSize: 90,
  });
  const bottomPanel = new Timeless.ui.ResizablePanelCore({
    defaultSize: 25,
    minSize: 10,
    maxSize: 50,
  });
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
  const cancel_btn$ = new Timeless.ui.ButtonCore({
    variant: "outline",
    async onClick() {
      form$.reset();
    },
  });

  return View({ class: "w-full h-full min-w-0 min-h-0 overflow-hidden" }, [
    ResizablePanels(
      {
        store: panelsGroup,
        direction: "vertical",
        class: "w-full h-full",
      },
      [
        ResizablePanel(
          {
            store: topPanel,
            group: panelsGroup,
            class: "min-h-0",
          },
          [
            View({ class: "space-y-8 p-6 overflow-y-auto h-full min-h-0" }, [
              FieldDemoView({
                field_card_name$,
                field_card_number$,
                field_cvv$,
                field_exp_month$,
                field_exp_year$,
                same_as_shipping$,
                field_comments$,
                submit_configure_btn$,
                cancel_btn$,
                form$,
              }),
              Separator({}),
              Field({ store: field_provider$ }, [
                Select({
                  id: `field-${field_provider$.name}`,
                  store: field_provider$.input,
                }),
              ]),
              FormRender(configure$_),
              Button({ store: submit_configure_btn$ }, ["Submit"]),
            ]),
          ],
        ),
        ResizableHandle({
          store: panelsGroup,
          panelBefore: topPanel,
          panelAfter: bottomPanel,
          withHandle: true,
        }),
        ResizablePanel(
          {
            store: bottomPanel,
            group: panelsGroup,
            class: "min-h-0",
          },
          [
            View({ class: "p-3 flex items-center gap-2" }, [
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      field_card_name$.input.focus();
                    },
                  }),
                },
                ["Focus Name on Card"],
              ),
              Button(
                {
                  store: new Timeless.ui.ButtonCore({
                    onClick() {
                      field_exp_month$.input.show();
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
                      submit_configure_btn$.setLoading(true);
                      field_card_name$.input.setLoading(true);
                      field_card_number$.input.setLoading(true);
                      field_cvv$.input.setLoading(true);
                      field_comments$.input.setLoading(true);
                      try {
                        await new Promise((r) => setTimeout(r, 1200));
                        field_card_name$.input.setValue("John Doe");
                        field_card_number$.input.setValue(
                          "4242 4242 4242 4242",
                        );
                        field_cvv$.input.setValue("123");
                        field_exp_month$.input.setValue("12");
                        field_exp_year$.input.setValue("2029");
                        field_comments$.input.setValue("Some test comments");
                      } finally {
                        submit_configure_btn$.setLoading(false);
                        field_card_name$.input.setLoading(false);
                        field_card_number$.input.setLoading(false);
                        field_cvv$.input.setLoading(false);
                        field_comments$.input.setLoading(false);
                      }
                    },
                  }),
                },
                ["Loading data"],
              ),
            ]),
          ],
        ),
      ],
    ),
  ]);
}
