var platform = getPlatform();

var FIELD_TYPE_OPTIONS = [
  new Timeless.ui.SelectItemCore({ value: "int", label: "int" }),
  new Timeless.ui.SelectItemCore({ value: "varchar", label: "varchar" }),
  new Timeless.ui.SelectItemCore({ value: "text", label: "text" }),
  new Timeless.ui.SelectItemCore({ value: "datetime", label: "datetime" }),
  new Timeless.ui.SelectItemCore({ value: "decimal", label: "decimal" }),
  new Timeless.ui.SelectItemCore({ value: "boolean", label: "boolean" }),
];

function makeTypeOptions() {
  return [
    new Timeless.ui.SelectItemCore({ value: "int", label: "int" }),
    new Timeless.ui.SelectItemCore({ value: "varchar", label: "varchar" }),
    new Timeless.ui.SelectItemCore({ value: "text", label: "text" }),
    new Timeless.ui.SelectItemCore({ value: "datetime", label: "datetime" }),
    new Timeless.ui.SelectItemCore({ value: "decimal", label: "decimal" }),
    new Timeless.ui.SelectItemCore({ value: "boolean", label: "boolean" }),
  ];
}

/**
 * FormRender - 根据 ObjectFieldCore 动态渲染表单字段
 */
function FormRender(props, children) {
  var field_names = computed(props.store, function (t) {
    if (!t) return [];
    return Object.keys(t.fields);
  });
  return View({ class: Timeless.classNames([props.class, "space-y-3"]) }, [
    For({
      each: field_names,
      render: function (name) {
        if (!props.store.value || !props.store.value.fields) return null;
        var field$ = props.store.value.fields[name];
        if (!field$) return null;
        var fid = "field-" + name;
        var inline = ["checkbox"].includes(field$.input.shape);
        return View(
          {
            class: Timeless.classNames([
              "t-form-item gap-2 text-neutral-800 dark:text-neutral-300",
              inline ? "flex items-center" : "flex flex-col",
            ]),
          },
          [
            Show({
              when: !inline,
              ok: function () {
                return [FieldLabel({ for: fid, store: field$ })];
              },
            }),
            Match({
              when: computed(field$, function (t) {
                return t.input.shape;
              }),
              cases: {
                select: function () {
                  return Select({ id: fid, store: field$.input });
                },
                input: function () {
                  return Input({ id: fid, store: field$.input });
                },
                checkbox: function () {
                  return Checkbox({ id: fid, store: field$.input });
                },
              },
            }),
            Show({
              when: inline,
              ok: function () {
                return [FieldInlineLabel({ for: fid, store: field$ })];
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
 * 根据字段类型创建类型相关的配置表单
 */
function createTypeConfigs(fieldData) {
  var configs = {
    int: new Timeless.ui.ObjectFieldCore({
      fields: {
        length: new Timeless.ui.SingleFieldCore({
          label: "长度",
          name: "length",
          input: new Timeless.ui.InputCore({
            defaultValue: String(
              fieldData.type === "int" && fieldData.length
                ? fieldData.length
                : 11,
            ),
            placeholder: "如 11",
          }),
        }),
      },
    }),
    varchar: new Timeless.ui.ObjectFieldCore({
      fields: {
        length: new Timeless.ui.SingleFieldCore({
          label: "长度",
          name: "length",
          input: new Timeless.ui.InputCore({
            defaultValue: String(
              fieldData.type === "varchar" && fieldData.length
                ? fieldData.length
                : 255,
            ),
            placeholder: "如 255",
          }),
        }),
      },
    }),
    text: new Timeless.ui.ObjectFieldCore({ fields: {} }),
    datetime: new Timeless.ui.ObjectFieldCore({ fields: {} }),
    decimal: new Timeless.ui.ObjectFieldCore({
      fields: {
        precision: new Timeless.ui.SingleFieldCore({
          label: "精度",
          name: "precision",
          input: new Timeless.ui.InputCore({
            defaultValue: String(fieldData.precision || 10),
            placeholder: "如 10",
          }),
        }),
        scale: new Timeless.ui.SingleFieldCore({
          label: "小数位",
          name: "scale",
          input: new Timeless.ui.InputCore({
            defaultValue: String(fieldData.scale || 2),
            placeholder: "如 2",
          }),
        }),
      },
    }),
    boolean: new Timeless.ui.ObjectFieldCore({ fields: {} }),
  };
  return configs;
}

/**
 * 创建单个字段的编辑器
 */
function createFieldEditor(fieldData) {
  var configs = createTypeConfigs(fieldData);
  var currentType = fieldData.type || "varchar";
  var currentConfig_ = ref(configs[currentType] || configs["varchar"]);

  var name$ = new Timeless.ui.SingleFieldCore({
    label: "名称",
    name: "name",
    input: new Timeless.ui.InputCore({
      defaultValue: fieldData.name || "",
      placeholder: "字段名称",
    }),
  });
  var type$ = new Timeless.ui.SingleFieldCore({
    label: "类型",
    name: "type",
    input: new Timeless.ui.SelectCore({
      defaultValue: currentType,
      platform: platform,
      options: makeTypeOptions(),
      onChange: function (val) {
        if (configs[val]) {
          currentConfig_.as(configs[val]);
        }
      },
    }),
  });
  var primaryKey$ = new Timeless.ui.SingleFieldCore({
    label: "主键",
    name: "primaryKey",
    input: new Timeless.ui.CheckboxCore({}),
  });
  var nullable$ = new Timeless.ui.SingleFieldCore({
    label: "允许为空",
    name: "nullable",
    input: new Timeless.ui.CheckboxCore({}),
  });
  var foreignKey$ = new Timeless.ui.SingleFieldCore({
    label: "外键",
    name: "foreignKey",
    input: new Timeless.ui.InputCore({
      defaultValue: fieldData.foreignKey || "",
      placeholder: "如 users.id",
    }),
  });

  if (fieldData.primaryKey) primaryKey$.input.check();
  if (fieldData.nullable !== false) nullable$.input.check();

  var displayName_ = ref(fieldData.name || "(未命名)");
  name$.input.onStateChange(function () {
    displayName_.as(name$.input.value || "(未命名)");
  });

  return {
    id: String(Math.random()).slice(2, 10),
    name$: name$,
    type$: type$,
    primaryKey$: primaryKey$,
    nullable$: nullable$,
    foreignKey$: foreignKey$,
    configs: configs,
    currentConfig_: currentConfig_,
    displayName_: displayName_,
  };
}

/**
 * 从编辑器收集字段数据
 */
function collectFieldData(editor) {
  var field = {
    name: editor.name$.input.value,
    type: editor.type$.input.value || "varchar",
    primaryKey: editor.primaryKey$.input.checked,
    nullable: editor.nullable$.input.checked,
  };
  var fk = editor.foreignKey$.input.value;
  if (fk) field.foreignKey = fk;

  var typeVal = field.type;
  var config = editor.configs[typeVal];
  if (config && config.fields) {
    var keys = Object.keys(config.fields);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var raw = config.fields[k].input.value;
      if (raw !== undefined && raw !== "") {
        field[k] = isNaN(Number(raw)) ? raw : Number(raw);
      }
    }
  }
  return field;
}

/**
 * 字段详情编辑面板（右侧）
 */
function FieldDetailView(props) {
  var editor = props.editor;

  return View({ class: "space-y-3" }, [
    View({ class: "grid grid-cols-2 gap-2" }, [
      Field({ store: editor.name$ }, [
        Input({ id: editor.name$.name, store: editor.name$.input }),
      ]),
      Field({ store: editor.type$ }, [
        Select({ id: editor.type$.name, store: editor.type$.input }),
      ]),
    ]),
    FormRender({ store: editor.currentConfig_ }, []),
    View({ class: "flex items-center gap-4" }, [
      View({ class: "flex items-center gap-1.5" }, [
        Checkbox({ id: "pk-" + editor.id, store: editor.primaryKey$.input }),
        FieldInlineLabel({ for: "pk-" + editor.id, store: editor.primaryKey$ }),
      ]),
      View({ class: "flex items-center gap-1.5" }, [
        Checkbox({ id: "null-" + editor.id, store: editor.nullable$.input }),
        FieldInlineLabel({ for: "null-" + editor.id, store: editor.nullable$ }),
      ]),
    ]),
    Field({ store: editor.foreignKey$ }, [
      Input({ id: editor.foreignKey$.name, store: editor.foreignKey$.input }),
    ]),
  ]);
}

/**
 * @param {ViewComponentProps} props
 */
export default function HomePageView(props) {
  var view$ = new Timeless.ui.ScrollViewCore({});

  // === 节点数据响应式引用（用于渲染后更新视图） ===
  var nodeDataRefs = {};

  var flow$ = new Timeless.ui.FlowCanvasModel({
    nodes: [
      new Timeless.ui.FlowNodeModel({
        id: "users",
        type: "table",
        position: { x: 0, y: 160 },
        data: {
          name: "users",
          description: "用户表",
          fields: [
            { name: "id", type: "int", length: 11, primaryKey: true },
            { name: "username", type: "varchar", length: 50, nullable: false },
            { name: "email", type: "varchar", length: 100, nullable: false },
            { name: "password", type: "varchar", length: 255, nullable: false },
            { name: "avatar", type: "varchar", length: 255, nullable: true },
            { name: "created_at", type: "datetime", nullable: false },
          ],
        },
      }),
      new Timeless.ui.FlowNodeModel({
        id: "posts",
        type: "table",
        position: { x: 420, y: 0 },
        data: {
          name: "posts",
          description: "文章表",
          fields: [
            { name: "id", type: "int", length: 11, primaryKey: true },
            { name: "title", type: "varchar", length: 200, nullable: false },
            { name: "content", type: "text", nullable: true },
            {
              name: "user_id",
              type: "int",
              length: 11,
              nullable: false,
              foreignKey: "users.id",
            },
            { name: "status", type: "varchar", length: 20, nullable: true },
            { name: "created_at", type: "datetime", nullable: false },
          ],
        },
      }),
      new Timeless.ui.FlowNodeModel({
        id: "comments",
        type: "table",
        position: { x: 420, y: 400 },
        data: {
          name: "comments",
          description: "评论表",
          fields: [
            { name: "id", type: "int", length: 11, primaryKey: true },
            { name: "content", type: "text", nullable: false },
            {
              name: "user_id",
              type: "int",
              length: 11,
              nullable: false,
              foreignKey: "users.id",
            },
            {
              name: "post_id",
              type: "int",
              length: 11,
              nullable: false,
              foreignKey: "posts.id",
            },
            { name: "created_at", type: "datetime", nullable: false },
          ],
        },
      }),
      new Timeless.ui.FlowNodeModel({
        id: "tags",
        type: "table",
        position: { x: 840, y: 0 },
        data: {
          name: "tags",
          description: "标签表",
          fields: [
            { name: "id", type: "int", length: 11, primaryKey: true },
            { name: "name", type: "varchar", length: 50, nullable: false },
          ],
        },
      }),
      new Timeless.ui.FlowNodeModel({
        id: "post_tags",
        type: "table",
        position: { x: 840, y: 280 },
        data: {
          name: "post_tags",
          description: "文章标签关联表（多对多）",
          fields: [
            { name: "id", type: "int", length: 11, primaryKey: true },
            {
              name: "post_id",
              type: "int",
              length: 11,
              nullable: false,
              foreignKey: "posts.id",
            },
            {
              name: "tag_id",
              type: "int",
              length: 11,
              nullable: false,
              foreignKey: "tags.id",
            },
          ],
        },
      }),
    ],
    edges: [
      { id: "e-users-posts", source: "users", target: "posts", type: "bezier" },
      {
        id: "e-users-comments",
        source: "users",
        target: "comments",
        type: "bezier",
      },
      {
        id: "e-posts-comments",
        source: "posts",
        target: "comments",
        sourcePosition: "bottom",
        targetPosition: "top",
        type: "bezier",
      },
      {
        id: "e-posts-post_tags",
        source: "posts",
        target: "post_tags",
        type: "bezier",
      },
      {
        id: "e-tags-post_tags",
        source: "tags",
        target: "post_tags",
        sourcePosition: "bottom",
        targetPosition: "top",
        type: "bezier",
      },
    ],
    isValidConnection: function (conn) {
      return conn.source !== conn.target;
    },
  });

  // === Dialog 状态 ===
  var editingNode_ = ref(null);
  var tableName$ = new Timeless.ui.SingleFieldCore({
    label: "表名",
    name: "tableName",
    input: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "表名",
    }),
  });
  var tableDesc$ = new Timeless.ui.SingleFieldCore({
    label: "描述",
    name: "tableDesc",
    input: new Timeless.ui.InputCore({
      defaultValue: "",
      placeholder: "表描述",
    }),
  });
  var field_editors = refarr([]);
  var selected_id_ = ref("");

  var dialog$ = new Timeless.ui.DialogCore({
    title: "编辑表结构",
    footer: true,
    onOk: function () {
      saveChanges();
    },
  });

  var addFieldBtn$ = new Timeless.ui.ButtonCore({
    variant: "outline",
    size: "sm",
    onClick: function () {
      var newEditor = createFieldEditor({
        name: "",
        type: "varchar",
        length: 255,
        nullable: true,
      });
      field_editors.push(newEditor);
      selected_id_.as(newEditor.id);
      setTimeout(function () {
        newEditor.name$.input.focus();
      }, 100);
    },
  });

  // === 初始化节点数据引用 + 双击事件 ===
  flow$.nodes.forEach(function (node) {
    nodeDataRefs[node.id] = refobj({
      name: node.data.name,
      description: node.data.description,
      fields: node.data.fields,
    });
    node.onDoubleClick(function () {
      openEditDialog(node);
    });
  });

  function openEditDialog(node) {
    editingNode_.as(node);
    tableName$.input.setValue(node.data.name || "");
    tableDesc$.input.setValue(node.data.description || "");
    var editors = (node.data.fields || []).map(function (f) {
      return createFieldEditor(f);
    });
    field_editors.as(editors);
    selected_id_.as(editors.length > 0 ? editors[0].id : "");
    dialog$.show();
  }

  function saveChanges() {
    var node = editingNode_.value;
    if (!node) return;
    var newFields = field_editors.value.map(collectFieldData);
    var newData = {
      name: tableName$.input.value || node.data.name,
      description: tableDesc$.input.value || "",
      fields: newFields,
    };
    node.data = newData;
    if (nodeDataRefs[node.id]) {
      nodeDataRefs[node.id].as({
        name: newData.name,
        description: newData.description,
        fields: newData.fields,
      });
    }
    dialog$.hide();
  }

  function removeFieldEditor(editor) {
    var idx = field_editors.value.indexOf(editor);
    var list = field_editors.value.filter(function (e) {
      return e.id !== editor.id;
    });
    if (editor.id === selected_id_.value) {
      if (list.length === 0) {
        selected_id_.as("");
      } else {
        var nextIdx = idx >= list.length ? list.length - 1 : idx;
        selected_id_.as(list[nextIdx].id);
      }
    }
    field_editors.as(list);
  }

  // === 渲染 ===
  return ScrollView({ class: "p-6 h-screen", store: view$ }, [
    View({ class: "space-y-8" }, [
      View(
        {
          class:
            "relative w-full h-[700px] border border-border rounded-lg overflow-hidden",
        },
        [
          FlowCanvasView({
            store: flow$,
            showBackground: true,
            showControls: true,
            showMinimap: false,
            backgroundVariant: "dots",
            nodeTypes: {
              table: function (nodeProps) {
                var node = nodeProps.node;
                var data_ = nodeDataRefs[node.id];
                if (!data_) return [View({}, [node.id])];
                return [
                  View({ class: "min-w-[260px]" }, [
                    View(
                      {
                        class:
                          "px-3 py-2 border-b border-gray-100 dark:border-gray-700",
                      },
                      [
                        View(
                          {
                            class:
                              "font-semibold text-sm text-blue-600 dark:text-blue-400",
                          },
                          [
                            computed(data_, function (d) {
                              return d.name;
                            }),
                          ],
                        ),
                        Show({
                          when: computed(data_, function (d) {
                            return !!d.description;
                          }),
                          ok: function () {
                            return View(
                              {
                                class:
                                  "text-xs text-gray-400 dark:text-gray-500 mt-0.5",
                              },
                              [
                                computed(data_, function (d) {
                                  return d.description;
                                }),
                              ],
                            );
                          },
                        }),
                      ],
                    ),
                    View({ class: "py-1" }, [
                      For({
                        each: computed(data_, function (d) {
                          return d.fields || [];
                        }),
                        render: function (field) {
                          var typeStr = field.type;
                          if (field.length) typeStr += "(" + field.length + ")";
                          if (field.precision)
                            typeStr +=
                              "(" +
                              field.precision +
                              "," +
                              (field.scale || 0) +
                              ")";
                          return View(
                            {
                              class:
                                "px-3 py-1 flex items-center gap-2 text-xs",
                            },
                            [
                              field.primaryKey
                                ? View(
                                    {
                                      class:
                                        "w-5 text-center text-yellow-600 dark:text-yellow-400 font-bold text-[10px] shrink-0",
                                    },
                                    ["PK"],
                                  )
                                : field.foreignKey
                                  ? View(
                                      {
                                        class:
                                          "w-5 text-center text-blue-500 dark:text-blue-400 font-bold text-[10px] shrink-0",
                                      },
                                      ["FK"],
                                    )
                                  : View({ class: "w-5 shrink-0" }, []),
                              View(
                                {
                                  class:
                                    "flex-1 font-mono" +
                                    (field.nullable === false
                                      ? " font-medium text-gray-800 dark:text-gray-200"
                                      : " text-gray-500 dark:text-gray-400"),
                                },
                                [field.name],
                              ),
                              View(
                                {
                                  class:
                                    "text-gray-400 dark:text-gray-500 font-mono shrink-0",
                                },
                                [typeStr],
                              ),
                            ],
                          );
                        },
                      }),
                    ]),
                  ]),
                ];
              },
            },
          }),
        ],
      ),
      Dialog({ store: dialog$, class: "w-[640px] max-h-[80vh]" }, function () {
        return [
          View({ class: "flex flex-col min-h-0 overflow-hidden" }, [
            View({ class: "grid grid-cols-2 gap-2 p-4 shrink-0" }, [
              Field({ store: tableName$ }, [
                Input({ id: tableName$.name, store: tableName$.input }),
              ]),
              Field({ store: tableDesc$ }, [
                Input({ id: tableDesc$.name, store: tableDesc$.input }),
              ]),
            ]),
            Separator({}),
            SplitView({
              resizable: true,
              class: "flex-1 min-h-0",
              panels: [
                {
                  size: 160,
                  minSize: 120,
                  style: { overflow: "hidden" },
                  content: function () {
                    return View({ class: "flex flex-col h-full" }, [
                      View(
                        {
                          class:
                            "flex items-center justify-between mb-1 shrink-0 py-2 px-4",
                        },
                        [
                          View(
                            {
                              class:
                                "text-xs font-medium text-muted-foreground",
                            },
                            ["字段"],
                          ),
                          Button({ store: addFieldBtn$ }, ["+"]),
                        ],
                      ),
                      View({ class: "flex-1 min-h-0 overflow-y-auto px-2 pb-4" }, [
                        For({
                          each: field_editors,
                          render: function (editor) {
                            var isSelected = computed(
                              selected_id_,
                              function (sid) {
                                return sid === editor.id;
                              },
                            );
                            return View(
                              {
                                class: Timeless.classNames([
                                  "flex items-center gap-1 px-2 py-1.5 rounded text-xs cursor-pointer select-none group",
                                  computed(isSelected, function (s) {
                                    return s
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-muted";
                                  }),
                                ]),
                                onClick: function () {
                                  selected_id_.as(editor.id);
                                  setTimeout(function () {
                                    editor.name$.input.focus();
                                  }, 100);
                                },
                              },
                              [
                                Show({
                                  when: computed(
                                    editor.primaryKey$.input,
                                    function (v) {
                                      return v.checked;
                                    },
                                  ),
                                  ok: function () {
                                    return View(
                                      {
                                        class:
                                          "text-yellow-600 dark:text-yellow-400 font-bold text-[10px] shrink-0",
                                      },
                                      ["PK"],
                                    );
                                  },
                                  else: function () {
                                    return Show({
                                      when: computed(
                                        editor.foreignKey$.input,
                                        function (v) {
                                          return !!v.value;
                                        },
                                      ),
                                      ok: function () {
                                        return View(
                                          {
                                            class:
                                              "text-blue-500 dark:text-blue-400 font-bold text-[10px] shrink-0",
                                          },
                                          ["FK"],
                                        );
                                      },
                                    });
                                  },
                                }),
                                View({ class: "flex-1 truncate font-mono" }, [
                                  editor.displayName_,
                                ]),
                                View(
                                  {
                                    class:
                                      "text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0",
                                    onClick: function (e) {
                                      e.stopPropagation();
                                      removeFieldEditor(editor);
                                    },
                                  },
                                  [Icon({ name: "x", size: 12 })],
                                ),
                              ],
                            );
                          },
                        }),
                      ]),
                    ]);
                  },
                },
                {
                  size: "auto",
                  style: { overflow: "auto" },
                  content: function () {
                    return View({ class: "py-4 px-4" }, [
                      Show({
                        when: computed(selected_id_, function (sid) {
                          return !!sid;
                        }),
                        ok: function () {
                          return For({
                            each: field_editors,
                            render: function (editor) {
                              return Show({
                                when: computed(selected_id_, function (sid) {
                                  return sid === editor.id;
                                }),
                                ok: function () {
                                  return FieldDetailView({ editor: editor });
                                },
                              });
                            },
                          });
                        },
                        else: function () {
                          return View(
                            {
                              class:
                                "flex items-center justify-center h-full text-sm text-muted-foreground",
                            },
                            ["点击左侧字段进行编辑"],
                          );
                        },
                      }),
                    ]);
                  },
                },
              ],
            }),
          ]),
        ];
      }),
    ]),
  ]);
}
