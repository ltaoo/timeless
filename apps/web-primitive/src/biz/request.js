// Simple HTTP request helpers
export const request = {
  get(url) {
    return fetch(url, {
      headers: { "Content-Type": "application/json" },
    }).then((r) => r.json());
  },
  post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
  },
};

export function searchFruits(keyword) {
  const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape", "Honeydew"];
  const filtered = keyword
    ? fruits.filter((f) => f.toLowerCase().includes(keyword.toLowerCase()))
    : fruits;
  return Promise.resolve(
    filtered.map((name, i) => ({ value: name.toLowerCase(), label: name, id: i + 1 })),
  );
}

export function fetchDownloadList(params = {}) {
  return Promise.resolve({
    items: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `file-${i + 1}.zip`,
      size: Math.floor(Math.random() * 10000000),
      progress: Math.floor(Math.random() * 100),
      status: ["downloading", "paused", "completed"][i % 3],
      speed: Math.floor(Math.random() * 5000000),
    })),
    total: 20,
  });
}
