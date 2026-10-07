import { profile_ } from "@/store/app.js";

function api_error(message, status, payload) {
  const error = new Error(message || "请求失败");
  error.status = status;
  error.payload = payload;
  return error;
}

export async function api_request(
  pathname,
  { method = "GET", query, body, signal } = {},
) {
  const url = new URL(pathname, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = { Accept: "application/json" };
  const token = profile_.value?.token;
  if (token) {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  const content_type = response.headers.get("content-type") || "";
  const payload = content_type.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw api_error(
      payload?.message || payload?.msg || response.statusText,
      response.status,
      payload,
    );
  }
  if (payload && typeof payload === "object") {
    if (payload.error) {
      throw api_error(
        payload.error.message || payload.error || payload.message,
        response.status,
        payload,
      );
    }
    if (
      payload.success === false ||
      (payload.code !== undefined && payload.code !== 0)
    ) {
      throw api_error(payload.message || payload.msg, response.status, payload);
    }
    if (Object.prototype.hasOwnProperty.call(payload, "data")) {
      return payload.data;
    }
  }
  return payload;
}

export const api = {
  paste: {
    list(query, signal) {
      return api_request("/api/paste/list", { query, signal });
    },
    remove(id) {
      return api_request("/api/paste/delete", {
        method: "POST",
        body: { id },
      });
    },
    copy(id) {
      return api_request("/api/paste/write", {
        method: "POST",
        body: { id },
      });
    },
    preview(id) {
      return api_request("/api/paste/preview", {
        method: "POST",
        body: { id },
      });
    },
  },
  auth: {
    login(values) {
      return api_request("/api/auth/web_login", {
        method: "POST",
        body: values,
      });
    },
    register(values) {
      return api_request("/api/auth/web_register", {
        method: "POST",
        body: values,
      });
    },
  },
  settings: {
    read(signal) {
      return api_request("/api/user/settings", { signal });
    },
    update(values) {
      return api_request("/api/user/settings", {
        method: "POST",
        body: values,
      });
    },
    categories(signal) {
      return api_request("/api/category/tree", { signal });
    },
    system(signal) {
      return api_request("/api/system/info", { signal });
    },
    database_dirs(signal) {
      return api_request("/api/sync/db_dirs", { signal });
    },
    ping_webdav(values) {
      return api_request("/api/sync/ping", { query: values });
    },
    sync_to_remote(values) {
      return api_request("/api/sync/to_remote", {
        method: "POST",
        body: values,
      });
    },
    sync_from_remote(values) {
      return api_request("/api/sync/from_remote", {
        method: "POST",
        body: values,
      });
    },
  },
};
