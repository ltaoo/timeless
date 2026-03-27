import { describe, it, expect } from "vitest";

import { Result } from "../result";
import { BizError } from "../error";

describe("Result", () => {
  describe("Result.Ok", () => {
    it("应返回成功结果", () => {
      const result = Result.Ok({ id: 1, name: "test" });
      expect(result.data).toEqual({ id: 1, name: "test" });
      expect(result.error).toBeNull();
    });

    it("data 可以为 null", () => {
      const result = Result.Ok(null);
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });

    it("data 可以为基本类型", () => {
      const result = Result.Ok("hello");
      expect(result.data).toBe("hello");
      expect(result.error).toBeNull();
    });

    it("data 可以为数字", () => {
      const result = Result.Ok(42);
      expect(result.data).toBe(42);
      expect(result.error).toBeNull();
    });

    it("data 可以为数组", () => {
      const result = Result.Ok([1, 2, 3]);
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.error).toBeNull();
    });

    it("data 可以为布尔值", () => {
      const result = Result.Ok(true);
      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe("Result.Err", () => {
    it("字符串消息应返回 BizError", () => {
      const result = Result.Err("something went wrong");
      expect(result.data).toBeNull();
      expect(result.error).toBeInstanceOf(BizError);
      expect(result.error?.message).toBe("something went wrong");
    });

    it("字符串数组应返回 BizError", () => {
      const result = Result.Err(["error 1", "error 2"]);
      expect(result.error).toBeInstanceOf(BizError);
      expect(result.error?.messages).toEqual(["error 1", "error 2"]);
      expect(result.error?.message).toBe("error 1\nerror 2");
    });

    it("BizError 应直接返回", () => {
      const bizError = new BizError(["custom error"], "CUSTOM_CODE");
      const result = Result.Err(bizError);
      expect(result.error).toBe(bizError);
    });

    it("Error 应转换为 BizError", () => {
      const error = new Error("standard error");
      const result = Result.Err(error);
      expect(result.error).toBeInstanceOf(BizError);
      expect(result.error?.message).toBe("standard error");
    });

    it("应设置 code", () => {
      const result = Result.Err("error", "ERR_001");
      expect(result.error?.code).toBe("ERR_001");
    });

    it("code 可以为数字", () => {
      const result = Result.Err("error", 404);
      expect(result.error?.code).toBe(404);
    });

    it("应设置 data", () => {
      const data = { detail: "info" };
      const result = Result.Err("error", undefined, data);
      expect(result.error?.data).toEqual(data);
    });

    it("默认 data 为 null", () => {
      const result = Result.Err("error");
      expect(result.data).toBeNull();
    });

    it("空字符串应返回 BizError", () => {
      const result = Result.Err("");
      expect(result.error).toBeInstanceOf(BizError);
      expect(result.error?.message).toBe("");
    });

    it("空数组应返回 BizError", () => {
      const result = Result.Err([]);
      expect(result.error).toBeInstanceOf(BizError);
      expect(result.error?.messages).toEqual([]);
    });
  });

  describe("类型检查", () => {
    it("Ok 结果 data 不为 null", () => {
      const result = Result.Ok({ value: 1 });
      if (result.error === null) {
        expect(result.data).toEqual({ value: 1 });
      }
    });

    it("Err 结果 error 不为 null", () => {
      const result = Result.Err("error");
      if (result.data === null) {
        expect(result.error).toBeInstanceOf(BizError);
      }
    });
  });
});
