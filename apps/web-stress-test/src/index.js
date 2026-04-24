const { ref, View, Input, Show, For, computed, combine, refarr } =
  window.Timeless;
const { render } = window.Timeless.DOM;

const TABLE_ROWS = 1000;
const COLS = 5;

function generateData(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
    status: i % 4 === 0 ? "Inactive" : "Active",
    score: Math.floor(Math.random() * 100),
  }));
}

function SearchTablePage() {
  const TABLE_ROWS = 50;
  const searchInput = ref("");
  const searchQuery = ref("");
  const data = refarr(
    Array.from({ length: TABLE_ROWS }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
      status: i % 4 === 0 ? "Inactive" : "Active",
      score: Math.floor(Math.random() * 100),
      department: ["Sales", "Engineering", "Marketing", "HR", "Finance"][i % 5],
      location: ["NY", "LA", "SF", "Chicago", "Boston"][i % 5],
    })),
  );

  const filteredData = combine({ data, searchInput }, (t) => {
    const d = t.data;
    const query = t.searchInput;
    if (!query) return d;
    const q = query.toLowerCase();
    const r = d
      .filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.department.toLowerCase().includes(q) ||
          row.location.toLowerCase().includes(q),
      )
      .sort((a, b) => a.id - b.id);
    console.log("before return filtered data", r);
    return r;
  });

  const totalScore = computed(filteredData, (rows) => {
    if (!rows || rows.length === 0) return 0;
    return rows.reduce((sum, row) => sum + row.score, 0);
  });

  return View({ style: { padding: "16px", borderRadius: "8px" } }, [
    View(
      {
        style: {
          marginBottom: "12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        },
      },
      [
        View({}, ["Search (5000 rows, 300ms debounce):"]),
        Input({
          value: searchInput,
          placeholder: "Search name, email, department, location...",
          style: {
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            width: "300px",
          },
          onInput(event) {
            searchInput.as(event.target.value);
          },
        }),
        View({}, [`Showing ${filteredData.length} of ${TABLE_ROWS}`]),
      ],
    ),
    View(
      {
        style: {
          "border-radius": "4px",
          overflow: "hidden",
          "font-size": "13px",
        },
      },
      [
        View(
          {
            style: {
              display: "grid",
              "grid-template-columns": "repeat(7, 1fr)",
              gap: "1px",
            },
          },
          [
            View({ style: { padding: "10px", fontWeight: "600" } }, ["ID"]),
            View({ style: { padding: "10px", fontWeight: "600" } }, ["Name"]),
            View({ style: { padding: "10px", fontWeight: "600" } }, ["Email"]),
            View({ style: { padding: "10px", fontWeight: "600" } }, ["Role"]),
            View({ style: { padding: "10px", fontWeight: "600" } }, ["Status"]),
            View({ style: { padding: "10px", fontWeight: "600" } }, ["Dept"]),
            View({ style: { padding: "10px", fontWeight: "600" } }, ["Loc"]),
          ],
        ),
        For({
          key: "id",
          each: filteredData,
          render(row) {
            return View(
              {
                style: {
                  display: "grid",
                  "grid-template-columns": "repeat(7, 1fr)",
                  gap: "1px",
                },
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
                View({ style: { padding: "8px" } }, [row.department]),
                View({ style: { padding: "8px" } }, [row.location]),
              ],
            );
          },
        }),
      ],
    ),
  ]);
}

function TablePage() {
  const TABLE_ROWS_2 = 1000;
  const searchQuery = ref("");
  const sortField = ref("id");
  const sortAsc = ref(true);
  const data = refarr(generateData(TABLE_ROWS_2));
  const refreshCount = ref(0);

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
          marginBottom: "12px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
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
            borderRadius: "4px",
            fontSize: "14px",
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
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            },
          },
          ["Refresh"],
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
                fontWeight: "600",
              },
            },
            ["ID"],
          ),
          View(
            {
              style: {
                padding: "10px",
                fontWeight: "600",
              },
            },
            ["Name"],
          ),
          View(
            {
              style: {
                padding: "10px",
                fontWeight: "600",
              },
            },
            ["Email"],
          ),
          View(
            {
              style: {
                padding: "10px",
                fontWeight: "600",
              },
            },
            ["Role"],
          ),
          View(
            {
              style: {
                padding: "10px",
                fontWeight: "600",
              },
            },
            ["Status"],
          ),
        ]),
        For({
          each: filteredData,
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
        maxWidth: "500px",
      },
    },
    [
      View(
        {
          style: { fontSize: "18px", fontWeight: "600", marginBottom: "16px" },
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
              console.log("name change", event.target.value);
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
              console.log("email change", event.target.value);
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
              console.log("role change", event.target.value);
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
            console.log("enabled change", event.target.checked);
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
        style: { fontSize: "18px", fontWeight: "600", marginBottom: "16px" },
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
            View({ style: { fontSize: "24px", fontWeight: "600" } }, [
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
                  fontWeight: "600",
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
            View({ style: { fontSize: "24px", fontWeight: "600" } }, [
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
            View({ style: { fontSize: "24px", fontWeight: "600" } }, [
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
                      fontWeight: "500",
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
        style: { fontSize: "18px", fontWeight: "600", marginBottom: "16px" },
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
  const currentPage = ref("table");
  const pageStats = ref({
    table: 0,
    searchtable: 0,
    form: 0,
    dashboard: 0,
    multishow: 0,
  });

  return View({}, [
    View(
      {
        class: "nav",
        style: {
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        },
      },
      [
        View(
          {
            onClick() {
              currentPage.as("table");
              pageStats.as((s) => ({ ...s, table: s.table + 1 }));
            },
            style: {
              background: currentPage.value === "table" ? "#0056b3" : "#007bff",
            },
          },
          ["Table (1000 rows)"],
        ),
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
        View(
          {
            onClick() {
              currentPage.as("form");
              pageStats.as((s) => ({ ...s, form: s.form + 1 }));
            },
            style: {
              background: currentPage.value === "form" ? "#0056b3" : "#007bff",
            },
          },
          ["Form"],
        ),
        View(
          {
            onClick() {
              currentPage.as("dashboard");
              pageStats.as((s) => ({ ...s, dashboard: s.dashboard + 1 }));
            },
            style: {
              background:
                currentPage.value === "dashboard" ? "#0056b3" : "#007bff",
            },
          },
          ["Dashboard"],
        ),
        View(
          {
            onClick() {
              currentPage.as("multishow");
              pageStats.as((s) => ({ ...s, multishow: s.multishow + 1 }));
            },
            style: {
              background:
                currentPage.value === "multishow" ? "#0056b3" : "#007bff",
            },
          },
          ["MultiShow"],
        ),
      ],
    ),
    View(
      {
        style: {
          padding: "8px",
          borderRadius: "4px",
          marginBottom: "16px",
          fontSize: "12px",
        },
      },
      ["Page visits: ", JSON.stringify(pageStats.value)],
    ),
    Show({
      when: computed(currentPage, (p) => p === "table"),
      ok() {
        return TablePage();
      },
    }),
    Show({
      when: computed(currentPage, (p) => p === "searchtable"),
      ok() {
        return SearchTablePage();
      },
    }),
    Show({
      when: computed(currentPage, (p) => p === "form"),
      ok() {
        return FormPage();
      },
    }),
    Show({
      when: computed(currentPage, (p) => p === "dashboard"),
      ok() {
        return DashboardPage();
      },
    }),
    Show({
      when: computed(currentPage, (p) => p === "multishow"),
      ok() {
        return MultiShowPage();
      },
    }),
  ]);
}

render(ApplicationView(), document.getElementById("root"));
