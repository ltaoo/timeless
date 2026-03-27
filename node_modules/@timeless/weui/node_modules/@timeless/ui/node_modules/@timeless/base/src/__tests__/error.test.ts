import { describe, it, expect } from "vitest";

import { BizError } from "../error";

describe("BizError", () => {
  describe("构造函数", () => {
    it("应继承 Error", () => {
      const error = new BizError(["test error"]);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BizError);
    });

    it("message 应为 messages 的拼接", () => {
      const error = new BizError(["error 1", "error 2"]);
      expect(error.message).toBe("error 1\nerror 2");
    });

    it("应设置 messages", () => {
      const messages = ["error 1", "error 2"];
      const error = new BizError(messages);
      expect(error.messages).toEqual(messages);
    });

    it("应设置 code", () => {
      const error = new BizError(["test"], "ERR_001");
      expect(error.code).toBe("ERR_001");
    });

    it("code 可以为数字", () => {
      const error = new BizError(["test"], 404);
      expect(error.code).toBe(404);
    });

    it("应设置 data", () => {
      const data = { detail: "some info" };
      const error = new BizError(["test"], undefined, data);
      expect(error.data).toEqual(data);
    });

    it("默认 data 为 null", () => {
      const error = new BizError(["test"]);
      expect(error.data).toBeNull();
    });

    it("默认 code 为 undefined", () => {
      const error = new BizError(["test"]);
      expect(error.code).toBeUndefined();
    });

    it("单个错误消息", () => {
      const error = new BizError(["single error"]);
      expect(error.message).toBe("single error");
      expect(error.messages).toEqual(["single error"]);
    });

    it("空 messages", () => {
      const error = new BizError([]);
      expect(error.message).toBe("");
      expect(error.messages).toEqual([]);
    });
  });
});
