const client$ = new Timeless.HttpClientCore({});
// @ts-ignore
client$.fetch = async (options) => {
  await new Promise((r) => setTimeout(r, 400));
  // @ts-ignore
  const url = new URL(options.url, "http://localhost");
  const keyword = (url.searchParams.get("keyword") || "").toLowerCase();
  const all = [
    { value: "apple", label: "苹果" },
    { value: "banana", label: "香蕉" },
    { value: "orange", label: "橙子" },
    { value: "grape", label: "葡萄" },
    { value: "watermelon", label: "西瓜" },
    { value: "peach", label: "桃子" },
    { value: "pear", label: "梨" },
    { value: "strawberry", label: "草莓" },
  ];
  const matched = (() => {
    if (keyword) {
      return all.filter((o) => {
        const v = String(o.value).toLowerCase();
        const l = String(o.label).toLowerCase();
        return v.includes(keyword) || l.includes(keyword);
      });
    }
    return [];
  })();
  return {
    data: {
      options: matched.slice(0, 8),
    },
  };
};

const request = Timeless.request_factory({
  headers: { "Content-Type": "application/json" },
});
const searchSelectOptionsReq = new Timeless.RequestCore(
  (params) => request.get("/api/mock/select/search", params),
  {
    client: client$,
    process(r) {
      if (r.error) return r.error;
      const options = r.data?.options || [];
      return Timeless.Result.Ok(options);
    },
  },
);

export async function fetchSearchSelectOptions(keyword) {
  const r = await searchSelectOptionsReq.run({ keyword });
  if (r.error) {
    return [];
  }
  return r.data;
}
