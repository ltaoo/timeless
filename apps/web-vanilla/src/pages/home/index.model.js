import { request } from "@/biz/request.js";

function fetchUserList(body) {
  return request.post("/api/user/list", body);
}

export const HomePageViewModel = defineModel((props) => {
  const loading = ref(false);
  const response = ref(null);

  const request = {
    list: new Timeless.kit.RequestCore(fetchUserList, {
      client: props.client,
    }),
  };
  const state = {
    loading,
  };
  const methods = {
    async fetchUserList() {
      loading.as(true);
      const r = await request.list.run({});
      loading.as(false);
      if (r.error) {
        return;
      }
      response.as(r.data);
    },
  };

  return {
    state,
    methods,
  };
});
