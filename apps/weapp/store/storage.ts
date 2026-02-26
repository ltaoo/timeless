import { StorageCore } from "@/domains/storage/index";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    email: "",
    token: "",
    avatar: "",
    expires_at: 0,
  },
  theme: "system",
};
const key = "m_global";
const client = {
  getItem(key: string) {
    return wx.getStorageSync(key);
  },
  setItem(key: string, value: unknown) {
    wx.setStorageSync(key, value);
  },
};
const e = client.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: (() => {
    const prev = JSON.parse(e || "{}");
    return {
      ...prev,
    };
  })(),
  client,
});
