import { describe, expect, it, vi } from "vitest";
import { ref } from "@timeless/inner-reactive";

import { Match } from "@/reactive/match";

describe("Match", () => {
  it("uses the matching case before else", () => {
    const render_else = vi.fn((value: string) => `else:${value}`);
    const match = Match({
      when: "ready",
      cases: {
        ready: () => "matched",
        else: render_else,
      },
    });

    expect(match.children).toHaveLength(1);
    expect(match.children[0]?.state.value).toBe("matched");
    expect(render_else).not.toHaveBeenCalled();
  });

  it("passes the actual when value to else", () => {
    const render_else = vi.fn((value: number) => `unknown:${value}`);
    const fallback = vi.fn(() => "fallback");
    const match = Match({
      when: 42,
      cases: {
        1: () => "one",
        else: render_else,
      },
      fallback,
    });

    expect(render_else).toHaveBeenCalledOnce();
    expect(render_else).toHaveBeenCalledWith(42);
    expect(fallback).not.toHaveBeenCalled();
    expect(match.children[0]?.state.value).toBe("unknown:42");
  });

  it("uses else for each unmatched reactive value", () => {
    const value_ = ref("known");
    const render_else = vi.fn((value: string) => `unknown:${value}`);
    const match = Match({
      when: value_,
      cases: {
        known: () => "known",
        else: render_else,
      },
    });
    const insert_children = vi.fn();
    match.$elm = {
      removeChildren: vi.fn(),
      insertChildren: insert_children,
    } as any;

    value_.as("first");
    value_.as("second");

    expect(render_else.mock.calls).toEqual([["first"], ["second"]]);
    expect(insert_children.mock.calls[0][0][0].state.value).toBe(
      "unknown:first",
    );
    expect(insert_children.mock.calls[1][0][0].state.value).toBe(
      "unknown:second",
    );
  });

  it("keeps fallback support when cases has no else", () => {
    const match = Match({
      when: "missing",
      cases: {
        known: () => "known",
      },
      fallback: () => "fallback",
    });

    expect(match.children[0]?.state.value).toBe("fallback");
  });
});
