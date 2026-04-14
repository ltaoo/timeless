import { request } from "@/biz/request.js";

function fetchUserList(body) {
  return request.post("/api/user/list", body);
}

export function HomePageViewModel(props) {
  const loading = ref(false);
  const response = ref(null);

  const services = {
    list: new Timeless.RequestCore(fetchUserList, {
      client: props.client,
    }),
  };
  const state = {
    loading,
    response,
  };
  const methods = {
    async fetchUserList() {
      loading.as(true);
      const r = await services.list.run({});
      loading.as(false);
      if (r.error) {
        return;
      }
      response.as(r.data);
    },
  };

  return defineModel({
    state,
    methods,
    services,
  });
}
