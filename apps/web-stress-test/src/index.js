const {
  ref,
  View,
  Input,
  Switch,
  Select,
  Show,
  For,
  computed,
  combine,
  refarr,
  release_all,
} = window.Timeless;
const { render } = window.Timeless.DOM;

const TABLE_ROWS = 1000;
const COLS = 5;
function generate_user(i) {
  return {
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: {
      text: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
    },
    age: Math.floor(Math.random() * 50) + 18,
    status: Math.floor(Math.random() * 100) % 4 === 0 ? "Inactive" : "Active",
    score: Math.floor(Math.random() * 100),
    department: ["Sales", "Engineering", "Marketing", "HR", "Finance"][
      Math.floor(Math.random() * 100) % 5
    ],
    location: ["NY", "LA", "SF", "Chicago", "Boston"][i % 5],
    // skills: [
    //   {
    //     id: `${i}_1`,
    //     name: "computer",
    //     level: Math.floor(Math.random() * 50) + 18,
    //     histories: [
    //       {
    //         id: `${i}_1_1`,
    //         text: "first time",
    //         time: "2020/12/01",
    //         value: Math.floor(Math.random() * 50) + 18,
    //       },
    //     ],
    //   },
    //   {
    //     id: `${i}_2`,
    //     name: "draw",
    //     level: Math.floor(Math.random() * 50) + 0,
    //     histories: [
    //       {
    //         id: `${i}_2_1`,
    //         text: "first time",
    //         time: "2022/12/01",
    //         value: Math.floor(Math.random() * 50) + 18,
    //       },
    //       {
    //         id: `${i}_2_2`,
    //         text: "f",
    //         time: "2024/12/01",
    //         value: Math.floor(Math.random() * 50) + 18,
    //       },
    //     ],
    //   },
    // ],
  };
}

function generateData(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
    status: i % 4 === 0 ? "Inactive" : "Active",
    score: Math.floor(Math.random() * 100),
    age: Math.floor(Math.random() * 50) + 18,
  }));
}

function SearchTablePage() {
  const page = refobj({
    page: 1,
    pageSize: 500,
    total: 1231,
  });
  const totalPages = computed(page, (t) => Math.ceil(t.total / t.pageSize));
  const searchInput = ref("");
  // const searchQuery = ref("");
  const data = refarr(
    Array.from({ length: page.value.pageSize }, (_, i) => {
      return generate_user((page.value.page - 1) * page.value.pageSize + i, {});
    }),
  );
  const visible_ = ref(true);
  const checked_ = ref(false);
  const switch_loading_ = ref(false);
  const fruit_ = ref("melon");
  const options_ = [
    {
      label: "热带水果",
      options: [
        {
          label: "芒果",
          value: "mango",
        },
      ],
    },
    {
      label: "浆果",
      options: [
        {
          label: "草莓",
          value: "strawberry",
        },
      ],
    },
    {
      label: "瓜类",
      options: [
        {
          label: "甜瓜",
          value: "melon",
        },
        {
          label: "西瓜",
          value: "watermelon",
          disabled: true,
        },
      ],
    },
  ];

  const filteredData = combine({ data, searchInput }, (t) => {
    return filter_with_keyword(t.data, t.searchInput);
  });

  function filter_with_keyword(arr, keyword) {
    // console.log("filter_with_keyword", keyword);
    if (!keyword) {
      return arr;
    }
    const q = keyword.toLowerCase();
    const r = arr
      .filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.department.toLowerCase().includes(q) ||
          row.location.toLowerCase().includes(q),
      )
      .sort((a, b) => a.id - b.id);
    // console.log("before return filtered data", r);
    return r;
  }
  const handleSearch = debounce(800, function (keyword) {
    const r = data.value;
    const filtered = filter_with_keyword(r, keyword);
    data.as(filtered);
  });

  const totalScore = computed(filteredData, (rows) => {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((sum, row) => sum + row.score, 0);
  });
  let timer = null;

  return View(
    {
      style: {
        display: "flex",
        "flex-direction": "column",
        padding: "16px",
        "border-radius": "8px",
        "box-sizing": "border-box",
        height: "100%",
      },
    },
    [
      View(
        {
          style: {
            "margin-bottom": "12px",
            gap: "8px",
            "align-items": "center",
            "flex-shrink": 0,
          },
        },
        [
          View({}, [
            View({}, ["Search (5000 rows, 300ms debounce):"]),
            View(
              {
                style: {
                  display: "flex",
                },
              },
              [
                Input({
                  value: searchInput,
                  placeholder: "Search name, email, department, location...",
                  style: {
                    padding: "6px 10px",
                    border: "1px solid #ddd",
                    "border-radius": "4px",
                    "font-size": "14px",
                  },
                  onInput(event) {
                    searchInput.as(event.target.value);
                    // handleSearch(event.target.value);
                  },
                }),
                View(
                  {
                    style: {
                      padding: "6px 12px",
                      background: "#007bff",
                      "border-radius": "4px",
                      cursor: "pointer",
                      "font-size": "14px",
                    },
                    onClick() {
                      // const next_data = Array.from(
                      //   { length: page.value.pageSize },
                      //   (_, i) => {
                      //     return generate_user(i, {});
                      //   },
                      // );
                      // data.as(next_data);
                      // data.as((d) => {
                      // const newData = [...d];
                      // const user = newData.find((u) => u.id === 2);
                      // if (user) {
                      //   user.age = (user.age || 0) + 1;
                      // }
                      // return newData;
                      // });
                      // if (timer) return;
                      // timer = setInterval(() => {
                      // data.as((d) => {
                      //   return d.map((v) => {
                      //     return {
                      //       ...v,
                      //       age: v.id === 2 ? (v.age || 0) + 1 : v.age,
                      //     };
                      //   });
                      // });
                      // console.log(user.value.age);
                      // const user = data.find((v) => v.id === 2);
                      // if (user) {
                      //   user.set("age", user.value.age + 1);
                      // }
                      // console.log(user.value.age);
                      // }, 5000);
                      visible_.toggle();
                    },
                  },
                  ["Start Age+1"],
                ),
                View(
                  {
                    style: {
                      padding: "6px 12px",
                      background: "#007bff",
                      "border-radius": "4px",
                      cursor: "pointer",
                      "font-size": "14px",
                    },
                    onClick() {
                      // clearInterval(timer);
                      // data.as([]);
                      // release_all();
                      // page.as((p) => ({ ...p, page: p.page + 1 }));
                      const count = 500;
                      var startIndex = 500;
                      data.as(
                        Array.from({ length: count }, (_, i) => {
                          return generate_user(startIndex + i, {});
                        }),
                      );
                    },
                  },
                  ["Page 2"],
                ),
                View(
                  {
                    style: {
                      padding: "6px 12px",
                      background: "#007bff",
                      "border-radius": "4px",
                      cursor: "pointer",
                      "font-size": "14px",
                    },
                    onClick() {
                      const count = 500;
                      const startIndex = 1000;
                      data.as(
                        Array.from({ length: count }, (_, i) => {
                          return generate_user(startIndex + i, {});
                        }),
                      );
                    },
                  },
                  ["Page 3"],
                ),
                View(
                  {
                    style: {
                      padding: "6px 12px",
                      background: "#007bff",
                      "border-radius": "4px",
                      cursor: "pointer",
                      "font-size": "14px",
                    },
                    onClick() {
                      data.as([]);
                    },
                  },
                  ["Clean"],
                ),
                Switch({
                  checked: checked_,
                  loading: switch_loading_,
                  onChange(event) {
                    console.log(event.target.checked);
                    switch_loading_.as(true);
                    setTimeout(() => {
                      checked_.as(event.target.checked);
                      switch_loading_.as(false);
                    }, 3000);
                  },
                }),
                Select({
                  placeholder: "请选择水果",
                  value: fruit_,
                  options: options_,
                  onChange(event) {
                    console.log(event.target.value);
                  },
                }),
              ],
            ),
          ]),

          View({}, [
            computed(data, (t) => `Showing ${t.length} of `),
            computed(page, (t) => t.total),
          ]),
        ],
      ),
      View(
        {
          style: {
            "border-radius": "4px",
            overflow: "hidden",
            "font-size": "13px",
            border: "1px solid #ddd",
            "border-top": "none",
            display: "flex",
            "flex-direction": "column",
            flex: 1,
            "min-height": 0,
          },
        },
        [
          View(
            {
              style: {
                display: "grid",
                "grid-template-columns":
                  "60px 120px 200px 80px 60px 80px 100px 1fr",
                border: "1px solid #ddd",
                "border-left": "none",
                "border-right": "none",
                flexShrink: 0,
              },
            },
            [
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["ID"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["Name"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["Email"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["Role"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["Age"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["Status"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // background: "#f8f9fa",
                    "border-right": "1px solid #ddd",
                  },
                },
                ["Dept"],
              ),
              View(
                {
                  style: {
                    padding: "10px",
                    "font-weight": "600",
                    // "border-right": "1px solid #ddd",
                  },
                },
                ["Loc"],
              ),
            ],
          ),
          Show({
            // when: computed(filteredData, (t) => t.length),
            when: visible_,
            ok() {
              return ListView({
                style: {
                  "max-height": "100%",
                  overflow: "auto",
                  position: "relative",
                },
                key: "id",
                size: 30,
                itemHeight: 31.5,
                // itemHeight: 186.5,
                each: filteredData,
                render(row, idx) {
                  const borderBottom_ = combine(
                    { idx, data: filteredData },
                    (t) => {
                      return t.idx === t.data.length - 1
                        ? "none"
                        : "1px solid #ddd";
                    },
                  );
                  const id_ = computed(row, (t) => t.id);
                  const name_ = computed(row, (t) => t.name);
                  const email_ = computed(row, (t) => t.email);
                  const role_ = computed(row, (t) => {
                    return t.role.text;
                  });
                  const age_ = computed(row, (t) => t.age);
                  const color_ = computed(row, (t) =>
                    t.status === "Active" ? "#28a745" : "#dc3545",
                  );
                  const status_ = computed(row, (t) => t.status);
                  const department_ = computed(row, (t) => t.department);
                  const skills_ = computed(row, (t) => t.skills);

                  return View(
                    {
                      style: {
                        display: "grid",
                        "grid-template-columns":
                          "60px 120px 200px 80px 60px 80px 100px 1fr",
                        width: "100%",
                        "border-bottom": borderBottom_,
                        // "border-right": "1px solid #ddd",
                      },
                      onUnmounted() {
                        // console.log("destroy", id_.value);
                        borderBottom_.destroy();
                        id_.destroy();
                        name_.destroy();
                        email_.destroy();
                        role_.destroy();
                        age_.destroy();
                        color_.destroy();
                        status_.destroy();
                        department_.destroy();
                        skills_.destroy();
                      },
                    },
                    [
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                          },
                        },
                        [id_],
                      ),
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                          },
                        },
                        [name_],
                      ),
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                          },
                        },
                        [email_],
                      ),
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                          },
                        },
                        [role_],
                      ),
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                          },
                        },
                        [age_],
                      ),
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                            color: color_,
                          },
                        },
                        [status_],
                      ),
                      View(
                        {
                          style: {
                            padding: "8px",
                            "border-right": "1px solid #ddd",
                          },
                        },
                        [department_],
                      ),
                      // View(
                      //   {
                      //     style: {
                      //       padding: "8px",
                      //       // "border-right": "1px solid #ddd",
                      //     },
                      //   },
                      //   [
                      //     For({
                      //       key: "id",
                      //       each: skills_,
                      //       render(skill) {
                      //         const skill_name_ = computed(skill, (t) => t.name);
                      //         const histories_ = computed(
                      //           skill,
                      //           (t) => t.histories,
                      //         );

                      //         return View(
                      //           {
                      //             onUnmounted() {
                      //               skill_name_.destroy();
                      //               histories_.destroy();
                      //             },
                      //           },
                      //           [
                      //             View({}, [skill_name_]),
                      //             View({}, [
                      //               For({
                      //                 key: "id",
                      //                 each: histories_,
                      //                 render(history) {
                      //                   const history_text_ = computed(
                      //                     history,
                      //                     (t) => t.text,
                      //                   );
                      //                   const history_time_ = computed(
                      //                     history,
                      //                     (t) => t.time,
                      //                   );
                      //                   const history_value_ = computed(
                      //                     history,
                      //                     (t) => t.value,
                      //                   );
                      //                   return View(
                      //                     {
                      //                       onUnmounted() {
                      //                         history_text_.destroy();
                      //                         history_time_.destroy();
                      //                         history_value_.destroy();
                      //                       },
                      //                     },
                      //                     [
                      //                       View({}, [history_text_]),
                      //                       View({}, [history_time_]),
                      //                       View({}, [history_value_]),
                      //                     ],
                      //                   );
                      //                 },
                      //               }),
                      //             ]),
                      //           ],
                      //         );
                      //       },
                      //     }),
                      //   ],
                      // ),
                    ],
                  );
                },
              });
            },
            // else() {
            //   return View(
            //     {
            //       style: {
            //         display: "flex",
            //         "align-items": "center",
            //         "justify-content": "center",
            //         gap: "8px",
            //         padding: "12px",
            //         "flex-shrink": 0,
            //         height: "100%",
            //       },
            //     },
            //     ["No data available"],
            //   );
            // },
          }),
        ],
      ),
      // Pagination
      View(
        {
          style: {
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            gap: "8px",
            padding: "12px",
            "flex-shrink": 0,
          },
        },
        [
          Button(
            {
              style: {
                padding: "6px 12px",
                background: computed(page, (t) =>
                  t.page <= 1 ? "#ccc" : "#007bff",
                ),
                "border-radius": "4px",
                cursor: computed(page, (t) =>
                  t.page <= 1 ? "not-allowed" : "pointer",
                ),
                "font-size": "14px",
                color: "#fff",
              },
              onClick() {
                if (page.value.page > 1) {
                  page.as((p) => ({ ...p, page: p.page - 1 }));
                  data.as(
                    Array.from({ length: page.value.pageSize }, (_, i) => {
                      return generate_user(
                        (page.value.page - 1) * page.value.pageSize + i,
                        {},
                      );
                    }),
                  );
                }
              },
            },
            ["Previous"],
          ),
          View(
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "4px",
              },
            },
            [
              View(
                {
                  style: {
                    padding: "4px 8px",
                    background: computed(page, (t) =>
                      t.page === 1 ? "#007bff" : "#f0f0f0",
                    ),
                    "border-radius": "4px",
                    cursor: "pointer",
                    "font-size": "14px",
                    color: computed(page, (t) =>
                      t.page === 1 ? "#fff" : "#333",
                    ),
                  },
                  onClick() {
                    if (page.value.page === 1) {
                      return;
                    }
                    page.as((p) => ({ ...p, page: 1 }));
                    data.as(
                      Array.from({ length: page.value.pageSize }, (_, i) => {
                        return generate_user(i, {});
                      }),
                      { reset: false },
                    );
                  },
                },
                ["1"],
              ),
              Show({
                when: computed(page, (t) => {
                  const totalPages = Math.ceil(t.total / t.pageSize);
                  if (t.page > 3) {
                    return true;
                  }
                  return false;
                }),
                ok() {
                  return View(
                    {
                      style: {
                        padding: "4px 8px",
                        "font-size": "14px",
                      },
                    },
                    ["..."],
                  );
                },
              }),
              For({
                each: computed(page, (t) => {
                  const totalPages = Math.ceil(t.total / t.pageSize);
                  const pages = [];
                  const start = Math.max(2, t.page - 1);
                  const end = Math.min(totalPages - 1, t.page + 1);
                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }
                  return pages;
                }),
                render(p) {
                  return View(
                    {
                      style: {
                        padding: "4px 8px",
                        background: computed(page, (t) =>
                          t.page === p ? "#007bff" : "#f0f0f0",
                        ),
                        "border-radius": "4px",
                        cursor: "pointer",
                        "font-size": "14px",
                        color: computed(page, (t) =>
                          t.page === p ? "#fff" : "#333",
                        ),
                      },
                      onClick() {
                        console.log("[]click page", p, page.value.page);
                        if (p === page.value.page) {
                          return;
                        }
                        page.as((pg) => ({ ...pg, page: p }));
                        const startIndex = (p - 1) * page.value.pageSize;
                        const remaining = page.value.total - startIndex;
                        const count = Math.min(page.value.pageSize, remaining);
                        data.as(
                          Array.from({ length: count }, (_, i) => {
                            return generate_user(startIndex + i, {});
                          }),
                          { reset: false },
                        );
                      },
                    },
                    [p],
                  );
                },
              }),
              Show({
                when: computed(page, (t) => {
                  const totalPages = Math.ceil(t.total / t.pageSize);
                  if (t.page < totalPages - 2 && totalPages > 3) {
                    return true;
                  }
                  return false;
                }),
                ok() {
                  return View(
                    {
                      style: {
                        padding: "4px 8px",
                        "font-size": "14px",
                      },
                    },
                    ["..."],
                  );
                },
              }),
              Show({
                when: computed(totalPages, (t) => {
                  return t > 1;
                }),
                ok() {
                  return View(
                    {
                      style: {
                        padding: "4px 8px",
                        background: combine({ page, totalPages }, (t) =>
                          t.page.page === t.totalPages ? "#007bff" : "#f0f0f0",
                        ),
                        "border-radius": "4px",
                        cursor: "pointer",
                        "font-size": "14px",
                        color: combine({ page, totalPages }, (t) =>
                          t.page === t.totalPages ? "#fff" : "#333",
                        ),
                      },
                      onClick() {
                        const totalPages = Math.ceil(
                          page.value.total / page.value.pageSize,
                        );
                        page.as((p) => ({ ...p, page: totalPages }));
                        const startIndex =
                          (totalPages - 1) * page.value.pageSize;
                        const remaining = page.value.total - startIndex;
                        const count = Math.min(page.value.pageSize, remaining);
                        data.as(
                          Array.from({ length: count }, (_, i) => {
                            return generate_user(startIndex + i, {});
                          }),
                        );
                      },
                    },
                    [computed(page, (t) => Math.ceil(t.total / t.pageSize))],
                  );
                },
              }),
            ],
          ),
          Button(
            {
              style: {
                padding: "6px 12px",
                background: computed(page, (t) =>
                  t.page * t.pageSize >= t.total ? "#ccc" : "#007bff",
                ),
                "border-radius": "4px",
                cursor: computed(page, (t) =>
                  t.page * t.pageSize >= t.total ? "not-allowed" : "pointer",
                ),
                "font-size": "14px",
                "font-size": "14px",
                color: "#fff",
              },
              onClick() {
                if (page.value.page * page.value.pageSize < page.value.total) {
                  page.as((p) => ({ ...p, page: p.page + 1 }));
                  const startIndex =
                    (page.value.page - 1) * page.value.pageSize;
                  const remaining = page.value.total - startIndex;
                  const count = Math.min(page.value.pageSize, remaining);
                  data.as(
                    Array.from({ length: count }, (_, i) => {
                      return generate_user(startIndex + i, {});
                    }),
                  );
                }
              },
            },
            ["Next"],
          ),
          View(
            {
              style: {
                display: "flex",
                "align-items": "center",
                gap: "4px",
                "margin-left": "16px",
              },
            },
            [
              View({ style: { "font-size": "14px" } }, ["Go to:"]),
              Input({
                style: {
                  width: "50px",
                  padding: "4px 8px",
                  "border-radius": "4px",
                  border: "1px solid #ddd",
                  "font-size": "14px",
                  "text-align": "center",
                },
                value: ref(""),
                placeholder: "1",
                onKeyDown(event) {
                  if (event.key === "Enter") {
                    const totalPages = Math.ceil(
                      page.value.total / page.value.pageSize,
                    );
                    let targetPage = parseInt(event.target.value, 10);
                    if (isNaN(targetPage) || targetPage < 1) {
                      targetPage = 1;
                    }
                    if (targetPage > totalPages) {
                      targetPage = totalPages;
                    }
                    page.as((p) => ({ ...p, page: targetPage }));
                    const startIndex = (targetPage - 1) * page.value.pageSize;
                    const remaining = page.value.total - startIndex;
                    const count = Math.min(page.value.pageSize, remaining);
                    data.as(
                      Array.from({ length: count }, (_, i) => {
                        return generate_user(startIndex + i, {});
                      }),
                    );
                    event.target.value = "";
                  }
                },
              }),
              View({ style: { "font-size": "14px" } }, [
                " / ",
                computed(page, (t) => Math.ceil(t.total / t.pageSize)),
              ]),
            ],
          ),
          View({}, [`Total: `, computed(page, (t) => t.total)]),
        ],
      ),
    ],
  );
}

function TablePage() {
  const TABLE_ROWS_2 = 1000;
  const searchQuery = ref("");
  const sortField = ref("id");
  const sortAsc = ref(true);
  const data = refarr(generateData(TABLE_ROWS_2));
  const refreshCount = ref(0);
  const ageTimer = ref(null);

  const filteredData = combine(
    { data, searchQuery, sortField, sortAsc },
    (t) => {
      const d = t.data;
      const query = t.searchQuery;
      const field = t.sortField;
      const asc = t.sortAsc;

      let result = d;
      if (query) {
        const q = query.toLowerCase();
        result = result.filter(
          (row) =>
            row.name.toLowerCase().includes(q) ||
            row.email.toLowerCase().includes(q),
        );
      }
      result = [...result].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return asc ? -1 : 1;
        if (aVal > bVal) return asc ? 1 : -1;
        return 0;
      });
      return result;
    },
  );

  const totalScore = computed(filteredData, (rows) => {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((sum, row) => sum + row.score, 0);
  });

  const activeCount = computed(filteredData, (rows) => {
    if (!rows) return 0;
    return rows.filter((row) => row.status === "Active").length;
  });

  return View({ style: { padding: "16px", borderRadius: "8px" } }, [
    View(
      {
        style: {
          display: "flex",
          "align-items": "center",
          gap: "8px",
          "margin-bottom": "12px",
        },
      },
      [
        View({}, ["Search:"]),
        Input({
          value: searchQuery,
          placeholder: "Search name or email...",
          style: {
            padding: "6px 10px",
            border: "1px solid #ddd",
            "border-radius": "4px",
            "font-size": "14px",
          },
          onInput(event) {
            searchQuery.as(event.target.value);
          },
        }),
        View({}, [`Rows: ${TABLE_ROWS_2}`]),
        View(
          {
            onClick() {
              refreshCount.as((c) => c + 1);
              data.as((d) => [...d]);
            },
            style: {
              padding: "6px 12px",
              background: "#28a745",
              "border-radius": "4px",
              cursor: "pointer",
              "font-size": "14px",
            },
          },
          ["Refresh"],
        ),
        View(
          {
            onClick() {
              if (ageTimer.value) {
                clearInterval(ageTimer.value);
                ageTimer.value = null;
              }
            },
            style: {
              padding: "6px 12px",
              background: "#dc3545",
              "border-radius": "4px",
              cursor: "pointer",
              "font-size": "14px",
            },
          },
          ["Stop Age+1"],
        ),
      ],
    ),
    View({ style: { marginBottom: "8px", fontSize: "13px", color: "#666" } }, [
      `Filtered: ${filteredData.length} | Active: ${activeCount.value} | Avg Score: ${totalScore.value / filteredData.length || 0}`,
    ]),
    View(
      {
        style: {
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: "1px",
          // background: "#ddd",
          // border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "hidden",
          fontSize: "13px",
        },
      },
      [
        View({ style: { display: "flex" } }, [
          View(
            {
              style: {
                padding: "10px",
                "font-weight": "600",
              },
            },
            ["ID"],
          ),
          View(
            {
              style: {
                padding: "10px",
                "font-weight": "600",
              },
            },
            ["Name"],
          ),
          View(
            {
              style: {
                padding: "10px",
                "font-weight": "600",
              },
            },
            ["Email"],
          ),
          View(
            {
              style: {
                padding: "10px",
                "font-weight": "600",
              },
            },
            ["Role"],
          ),
          View(
            {
              style: {
                padding: "10px",
                "font-weight": "600",
              },
            },
            ["Status"],
          ),
        ]),
        For({
          each: data,
          render(row) {
            return View(
              {
                style: { display: "flex" },
              },
              [
                View({ style: { padding: "8px" } }, [row.id]),
                View({ style: { padding: "8px" } }, [row.name]),
                View({ style: { padding: "8px" } }, [row.email]),
                View({ style: { padding: "8px" } }, [row.role]),
                View(
                  {
                    style: {
                      padding: "8px",
                      color: row.status === "Active" ? "#28a745" : "#dc3545",
                    },
                  },
                  [row.status],
                ),
              ],
            );
            // return null;
          },
        }),
      ],
    ),
  ]);
}

function FormPage() {
  const name = ref("");
  const email = ref("");
  const role = ref("viewer");
  const enabled = ref(true);

  const isValid = combine({ name, email, role, enabled }, (t) => {
    const n = t.name;
    const e = t.email;
    const r = t.role;
    const en = t.enabled;

    return n.length > 0 && e.includes("@") && e.includes(".") && en;
  });

  const formData = combine({ name, email, role, enabled }, (t) => {
    const n = t.name;
    const e = t.email;
    const r = t.role;
    const en = t.enabled;
    return { name: n, email: e, role: r, enabled: en };
  });

  return View(
    {
      style: {
        padding: "16px",
        borderRadius: "8px",
      },
    },
    [
      View(
        {
          style: {
            fontSize: "18px",
            "font-weight": "600",
            marginBottom: "16px",
          },
        },
        ["User Form"],
      ),
      View({ style: { marginBottom: "12px" } }, [
        View({ style: { marginBottom: "4px", fontSize: "14px" } }, [
          "Name: ",
          Input({
            style: { width: "100%" },
            value: name,
            onInput(event) {
              // console.log("name change", event.target.value);
              name.as(event.target.value);
            },
          }),
        ]),
      ]),
      View({ style: { marginBottom: "12px" } }, [
        View({ style: { marginBottom: "4px", fontSize: "14px" } }, [
          "Email: ",
          Input({
            style: { width: "100%" },
            value: email,
            onInput(event) {
              // console.log("email change", event.target.value);
              email.as(event.target.value);
            },
          }),
        ]),
      ]),
      View({ style: { marginBottom: "12px" } }, [
        View({ style: { marginBottom: "4px", fontSize: "14px" } }, [
          "Role: ",
          Input({
            style: { width: "100%" },
            value: role,
            onChange(event) {
              // console.log("role change", event.target.value);
              role.as(event.target.value);
            },
          }),
        ]),
      ]),
      View({ style: { marginBottom: "16px" } }, [
        "Enabled: ",
        Checkbox({
          checked: enabled,
          onChange(event) {
            // console.log("enabled change", event.target.checked);
            enabled.as(event.target.checked);
          },
        }),
      ]),
      View(
        {
          style: {
            padding: "10px 20px",
            background: computed(isValid, (t) => (t ? "#007bff" : "#ccc")),
            borderRadius: "4px",
            fontSize: "14px",
            textAlign: "center",
          },
        },
        ["Submit"],
      ),
      View(
        {
          style: {
            marginTop: "16px",
            padding: "12px",
            // background: "#f8f9fa",
            borderRadius: "4px",
            fontSize: "13px",
          },
        },
        [
          computed(formData, (t) => {
            return JSON.stringify(t, null, 2);
          }),
        ],
      ),
    ],
  );
}

function DashboardPage() {
  const stats = refarr(
    Array.from({ length: 20 }, (_, i) => ({
      label: `Metric ${i + 1}`,
      value: Math.floor(Math.random() * 1000),
      change: Math.floor(Math.random() * 20) - 10,
    })),
  );

  const totalValue = computed(stats, (s) =>
    s.reduce((sum, item) => sum + item.value, 0),
  );
  const avgChange = computed(
    stats,
    (s) => s.reduce((sum, item) => sum + item.change, 0) / s.length,
  );

  return View({ style: { padding: "16px", borderRadius: "8px" } }, [
    View(
      {
        style: { fontSize: "18px", "font-weight": "600", marginBottom: "16px" },
      },
      ["Dashboard"],
    ),
    View(
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        },
      },
      [
        View(
          {
            style: {
              padding: "16px",
              // background: "#e3f2fd",
              borderRadius: "8px",
            },
          },
          [
            View(
              {
                style: {
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                },
              },
              ["Total"],
            ),
            View({ style: { fontSize: "24px", "font-weight": "600" } }, [
              totalValue.value,
            ]),
          ],
        ),
        View(
          {
            style: {
              padding: "16px",
              // background: "#f3e5f5",
              borderRadius: "8px",
            },
          },
          [
            View(
              {
                style: {
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                },
              },
              ["Avg Change"],
            ),
            View(
              {
                style: {
                  fontSize: "24px",
                  "font-weight": "600",
                  color: avgChange.value >= 0 ? "#4caf50" : "#f44336",
                },
              },
              [avgChange.value >= 0 ? "+" : "", avgChange.value.toFixed(1)],
            ),
          ],
        ),
        View(
          {
            style: {
              padding: "16px",
              // background: "#fff3e0",
              borderRadius: "8px",
            },
          },
          [
            View(
              {
                style: {
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                },
              },
              ["Items"],
            ),
            View({ style: { fontSize: "24px", "font-weight": "600" } }, [
              stats.length,
            ]),
          ],
        ),
        View(
          {
            style: {
              padding: "16px",
              // background: "#e8f5e9",
              borderRadius: "8px",
            },
          },
          [
            View(
              {
                style: {
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                },
              },
              ["Last Update"],
            ),
            View({ style: { fontSize: "24px", "font-weight": "600" } }, [
              new Date().toLocaleTimeString(),
            ]),
          ],
        ),
      ],
    ),
    View(
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
        },
      },
      [
        For({
          each: stats,
          render(item) {
            return View(
              {
                style: {
                  padding: "12px",
                  // background: "#f8f9fa",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              },
              [
                View({}, [item.label]),
                View(
                  {
                    style: {
                      color: item.change >= 0 ? "#4caf50" : "#f44336",
                      "font-weight": "500",
                    },
                  },
                  [item.change >= 0 ? "+" : "", item.change, "%"],
                ),
              ],
            );
          },
        }),
      ],
    ),
  ]);
}

function MultiShowPage() {
  const count = ref(10);

  return View({ style: { padding: "16px", borderRadius: "8px" } }, [
    View(
      {
        style: { fontSize: "18px", "font-weight": "600", marginBottom: "16px" },
      },
      ["Nested Show Test"],
    ),
    View({ style: { marginBottom: "12px" } }, [View({}, ["Count: ", count])]),
    Show({
      when: computed(count, (c) => c > 0),
      ok() {
        return View({}, ["Show > 0"]);
      },
    }),
    Show({
      when: computed(count, (c) => c > 5),
      ok() {
        return View({}, ["Show > 5"]);
      },
    }),
    Show({
      when: computed(count, (c) => c > 8),
      ok() {
        return View({}, ["Show > 8"]);
      },
    }),
    View(
      {
        onClick() {
          count.as((c) => c - 1);
        },
        style: {
          padding: "8px 16px",
          background: "#dc3545",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "8px",
        },
      },
      ["Decrease"],
    ),
    View(
      {
        onClick() {
          count.as((c) => c + 1);
        },
        style: {
          padding: "8px 16px",
          background: "#28a745",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "8px",
        },
      },
      ["Increase"],
    ),
  ]);
}

function ApplicationView() {
  const currentPage = ref("searchtable");
  const pageStats = ref({
    table: 0,
    searchtable: 0,
    form: 0,
    dashboard: 0,
    multishow: 0,
  });

  return View(
    { style: { height: "100%", display: "flex", "flex-direction": "column" } },
    [
      View(
        {
          class: "nav",
          style: {
            display: "flex",
            gap: "8px",
            padding: "12px",
            "flex-wrap": "wrap",
            "flex-shrink": 0,
          },
        },
        [
          // View(
          //   {
          //     onClick() {
          //       currentPage.as("table");
          //       pageStats.as((s) => ({ ...s, table: s.table + 1 }));
          //     },
          //     style: {
          //       background:
          //         currentPage.value === "table" ? "#0056b3" : "#007bff",
          //     },
          //   },
          //   ["Table (1000 rows)"],
          // ),
          View(
            {
              onClick() {
                currentPage.as("searchtable");
                pageStats.as((s) => ({ ...s, searchtable: s.searchtable + 1 }));
              },
              style: {
                background:
                  currentPage.value === "searchtable" ? "#0056b3" : "#007bff",
              },
            },
            ["SearchTable (5000 rows)"],
          ),
          // View(
          //   {
          //     onClick() {
          //       currentPage.as("form");
          //       pageStats.as((s) => ({ ...s, form: s.form + 1 }));
          //     },
          //     style: {
          //       background:
          //         currentPage.value === "form" ? "#0056b3" : "#007bff",
          //     },
          //   },
          //   ["Form"],
          // ),
          // View(
          //   {
          //     onClick() {
          //       currentPage.as("dashboard");
          //       pageStats.as((s) => ({ ...s, dashboard: s.dashboard + 1 }));
          //     },
          //     style: {
          //       background:
          //         currentPage.value === "dashboard" ? "#0056b3" : "#007bff",
          //     },
          //   },
          //   ["Dashboard"],
          // ),
          // View(
          //   {
          //     onClick() {
          //       currentPage.as("multishow");
          //       pageStats.as((s) => ({ ...s, multishow: s.multishow + 1 }));
          //     },
          //     style: {
          //       background:
          //         currentPage.value === "multishow" ? "#0056b3" : "#007bff",
          //     },
          //   },
          //   ["MultiShow"],
          // ),
        ],
      ),
      // View(
      //   {
      //     style: {
      //       padding: "8px",
      //       borderRadius: "4px",
      //       marginBottom: "16px",
      //       fontSize: "12px",
      //       flexShrink: 0,
      //     },
      //   },
      //   ["Page visits: ", JSON.stringify(pageStats.value)],
      // ),
      View(
        {
          style: {
            flex: 1,
            "min-height": 0,
            display: "flex",
            "flex-direction": "column",
          },
        },
        [
          SearchTablePage(),
          // Show({
          //   when: computed(currentPage, (p) => p === "table"),
          //   ok() {
          //     return TablePage();
          //   },
          // }),
          // Show({
          //   when: computed(currentPage, (p) => p === "searchtable"),
          //   ok() {
          //     return SearchTablePage();
          //   },
          // }),
          // Show({
          //   when: computed(currentPage, (p) => p === "form"),
          //   ok() {
          //     return FormPage();
          //   },
          // }),
          // Show({
          //   when: computed(currentPage, (p) => p === "dashboard"),
          //   ok() {
          //     return DashboardPage();
          //   },
          // }),
          // Show({
          //   when: computed(currentPage, (p) => p === "multishow"),
          //   ok() {
          //     return MultiShowPage();
          //   },
          // }),
        ],
      ),
    ],
  );
}

render(ApplicationView(), document.getElementById("root"));
