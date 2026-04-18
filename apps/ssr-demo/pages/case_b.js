export default function Page({ data }) {
  const visible_ = ref(true);
  const isLogin = ref(true);
  const category_ = refarr([
    {
      label: "计算机",
      selected: true,
    },
    {
      label: "数学",
      selected: false,
    },
  ]);
  const books = refarr([
    {
      category: "计算机",
      label: "《时间less》",
      selected: true,
    },
    {
      category: "计算机",
      label: "《React》",
      selected: false,
    },
    {
      category: "数学",
      label: "《高等数学》",
      selected: false,
    },
  ]);

  return Fragment({}, [
    View(
      {
        onClick() {
          console.log("anchor1");
          category_.push({
            label: "其他",
            selected: false,
          });
          books.push({
            category: "计算机",
            label: "《Vue》",
            selected: false,
          });
        },
      },
      "Anchor1",
    ),
    For({
      each: category_,
      render(item) {
        const item$ = refobj(item);
        return Fragment({}, [
          View(
            {
              style: {
                color: computed(item$, (t) => (t.selected ? "red" : "black")),
              },
              onClick() {
                item$.as((prev) => {
                  return {
                    ...prev,
                    selected: !prev.selected,
                  };
                });
              },
            },
            [View({}, item.label)],
          ),
        ]);
      },
    }),
    Show({
      when: visible_,
      ok() {
        return Fragment({}, [
          Portal({}, [View({}, "Content In Body")]),
          For({
            each: combine({ category: category_, books }, (t) => {
              const selected = t.category.find((v) => v.selected);
              if (!selected) {
                return t.books;
              }
              return t.books.filter((v) => v.category === selected.label);
            }),
            render(book) {
              const book$ = refobj(book);
              return Fragment({}, [
                View(
                  {
                    style: {
                      "margin-left": "12px",
                      "font-size": "12px",
                      color: computed(book$, (t) => {
                        return t.selected ? "red" : "black";
                      }),
                    },
                    onClick() {
                      console.log(book);
                      book$.as((prev) => {
                        return {
                          ...prev,
                          selected: !prev.selected,
                        };
                      });
                    },
                  },
                  book.label,
                ),
              ]);
            },
          }),
          Button(
            {
              onClick() {
                isLogin.as((prev) => !prev);
                visible_.as((prev) => !prev);
              },
            },
            [
              computed(isLogin, (t) => {
                return t ? "切换账号" : "去登录";
              }),
            ],
          ),
        ]);
      },
      else() {
        return View({}, "Else Content");
      },
    }),
    View({}, ["Content In last"]),
  ]);
}
