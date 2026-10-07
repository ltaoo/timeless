import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = (
  await readFile(new URL("../src/services/api.js", import.meta.url), "utf8")
).replace(
  'import { profile_ } from "@/store/app.js";',
  'const profile_ = { value: { token: "test-token" } };',
);
const { api_request, api } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
globalThis.window = { location: { origin: "http://localhost" } };

test("request serializes query, auth and JSON body", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url.href, "http://localhost/api/test?page=2");
    assert.equal(options.headers.Authorization, "Bearer test-token");
    assert.equal(options.body, '{"id":"clip-1"}');
    return Response.json({ code: 0, data: { ok: true } });
  };
  assert.deepEqual(
    await api_request("/api/test", {
      method: "POST",
      query: { page: 2, empty: "", missing: null },
      body: { id: "clip-1" },
    }),
    { ok: true },
  );
});

test("HTTP and business errors reject with their message", async () => {
  globalThis.fetch = async () =>
    Response.json({ message: "Unauthorized" }, { status: 401 });
  await assert.rejects(api_request("/api/test"), {
    message: "Unauthorized",
    status: 401,
  });
  globalThis.fetch = async () => Response.json({ code: 1, msg: "Rejected" });
  await assert.rejects(api_request("/api/test"), { message: "Rejected" });
});

test("clipboard, authentication and WebDAV retain service endpoints", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push([url.pathname, options.method]);
    return Response.json({ data: {} });
  };
  await api.paste.list({});
  await api.paste.copy("1");
  await api.paste.remove("1");
  await api.paste.preview("1");
  await api.auth.login({});
  await api.auth.register({});
  await api.settings.ping_webdav({});
  await api.settings.sync_to_remote({});
  await api.settings.sync_from_remote({});
  assert.deepEqual(calls, [
    ["/api/paste/list", "GET"],
    ["/api/paste/write", "POST"],
    ["/api/paste/delete", "POST"],
    ["/api/paste/preview", "POST"],
    ["/api/auth/web_login", "POST"],
    ["/api/auth/web_register", "POST"],
    ["/api/sync/ping", "GET"],
    ["/api/sync/to_remote", "POST"],
    ["/api/sync/from_remote", "POST"],
  ]);
});
