import { describe, expect, it } from "vitest";

import { Analytics, type AnalyticsPayload } from "./index";

describe("Analytics", () => {
  it("records a session, navigation chain and request in one batch", async () => {
    const payloads: AnalyticsPayload[] = [];
    const analytics = new Analytics({
      app_id: "test",
      storage: false,
      batch_size: 20,
      transport: (payload) => payloads.push(payload),
    });

    analytics.capture_page("https://example.com/a?secret=1", "load");
    analytics.capture_page("https://example.com/b", "push_state");
    analytics.capture_request({
      method: "GET",
      url: "https://example.com/api/users?token=secret",
      status: 200,
      duration: 12,
      transport: "fetch",
    });
    await analytics.flush();

    const events = payloads[0].events;
    expect(events.map((event) => event.event)).toEqual([
      "session_start",
      "page_view",
      "page_view",
      "request",
    ]);
    expect(events[2].properties).toMatchObject({
      from: "https://example.com/a",
      to: "https://example.com/b",
    });
    expect(events[3].properties).toMatchObject({
      url: "https://example.com/api/users",
      status: 200,
      success: true,
    });
  });
});
