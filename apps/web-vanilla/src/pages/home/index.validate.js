import { Section, Item } from "@/components/index.js";

function ObjectFieldRender(props) {
  const field_names = computed(props, (t) => {
    if (!t) {
      return [];
    }
    return Object.keys(t.fields);
  });

  return For({
    class: "space-y-6",
    each: field_names,
    render(name) {
      if (!props.value.fields) {
        return null;
      }
      const field$ = props.value.fields[name];
      if (!field$) {
        return null;
      }
      return View({ class: "field" }, [
        View(
          {
            class:
              "text-sm font-semibold text-gray-300 uppercase tracking-wider",
          },
          [name],
        ),
        View({ class: "mt-2" }, [
          Switch(
            {
              when: computed(field$, (t) => {
                return t.input.shape;
              }),
            },
            [
              Match({ value: "input" }, [
                Input({
                  store: field$.input,
                }),
              ]),
              Match({ value: "checkbox" }, [
                Checkbox({
                  store: field$.input,
                }),
              ]),
            ],
          ),
        ]),
      ]);
    },
  });
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
          input: new Timeless.ui.InputCore({
            defaultValue: "",
            placeholder: "请输入存储区域，如 z0, z1",
          }),
        }),
        use_https: new Timeless.ui.SingleFieldCore({
          label: "使用 HTTPS",
          input: new Timeless.ui.CheckboxCore({
            // defaultValue: "",
          }),
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

  return View({ class: "space-y-8 max-w-2xl" }, [
    Field({ store: field_provider$ }, [
      Select({ store: field_provider$.input }),
    ]),
    ObjectFieldRender(configure$_),
  ]);
}
