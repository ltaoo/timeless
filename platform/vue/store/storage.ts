import { StorageCore } from "@/domains/storage";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    email: "",
    avatar: "",
    token: "",
  },
};
const key = "m_global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: (() => {
    const prev = JSON.parse(e || "{}");
    return {
      ...prev,
    };
  })(),
  client: globalThis.localStorage,
});
