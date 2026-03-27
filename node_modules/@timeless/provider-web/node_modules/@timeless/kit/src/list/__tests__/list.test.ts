import { describe, it, expect, vi, beforeEach } from "vitest";

import { ListCore } from "../index";
import { RequestCore } from "@/request/index";
import { HttpClientCore } from "@/http_client/index";
import { request } from "@/request/utils";

describe("ListCore", () => {
  let mockClient: HttpClientCore;
  let mockRequest: RequestCore<any>;
  let list: ListCore<typeof mockRequest>;

  beforeEach(() => {
    mockClient = new HttpClientCore();
    mockClient.fetch = vi.fn().mockResolvedValue({
      data: { list: [], page: 1, pageSize: 10, total: 0 },
    });
    mockClient.get = vi.fn().mockResolvedValue({
      data: { list: [], page: 1, pageSize: 10, total: 0 },
    });
    mockClient.post = vi.fn().mockResolvedValue({
      data: { list: [], page: 1, pageSize: 10, total: 0 },
    });

    const service = () => request.get("/api/list");
    mockRequest = new RequestCore(service, { client: mockClient });
    list = new ListCore(mockRequest);
  });

  describe("构造函数", () => {
    it("初始状态", () => {
      expect(list.response.dataSource).toEqual([]);
      expect(list.response.page).toBe(1);
      expect(list.response.pageSize).toBe(10);
      expect(list.response.total).toBe(0);
      expect(list.response.loading).toBe(false);
      expect(list.response.initial).toBe(true);
      expect(list.response.noMore).toBe(false);
      expect(list.response.empty).toBe(false);
      expect(list.response.error).toBeNull();
    });

    it("传入选项", () => {
      const customList = new ListCore(mockRequest, {
        rowKey: "customId",
        search: { keyword: "test" },
        page: 2,
        pageSize: 20,
      });
      expect(customList.rowKey).toBe("customId");
      expect(customList.params.page).toBe(2);
      expect(customList.params.pageSize).toBe(20);
    });

    it("fetch 不是 RequestCore 实例时应抛出错误", () => {
      expect(() => new ListCore({} as any)).toThrow(
        "fetch must be a instance of RequestCore",
      );
    });
  });

  describe("setParams", () => {
    it("应更新 params", () => {
      list.setParams({ page: 2 } as any);
      expect(list.params.page).toBe(2);
    });

    it("应更新 params", () => {
      list.setParams({ page: 2 } as any);
      expect(list.params.page).toBe(2);
    });
  });

  describe("setDataSource", () => {
    it("应更新 dataSource", () => {
      const data = [{ id: 1 }, { id: 2 }];
      list.setDataSource(data);
      expect(list.response.dataSource).toEqual(data);
    });
  });

  describe("clear", () => {
    it("应重置为默认状态", () => {
      list.response.dataSource = [{ id: 1 }];
      list.response.page = 2;
      list.clear();
      expect(list.response.dataSource).toEqual([]);
      expect(list.response.page).toBe(1);
      expect(list.params.page).toBe(1);
    });
  });

  describe("deleteItem", () => {
    it("应删除符合条件的项目", () => {
      list.response.dataSource = [{ id: 1 }, { id: 2 }, { id: 3 }];
      list.deleteItem((item: any) => item.id === 2);
      expect(list.response.dataSource).toEqual([{ id: 1 }, { id: 3 }]);
      expect(list.response.total).toBe(2);
    });
  });

  describe("deleteItems", () => {
    it("应删除指定的多项", () => {
      const item1 = { id: 1 };
      const item2 = { id: 2 };
      const item3 = { id: 3 };
      list.response.dataSource = [item1, item2, item3];
      list.deleteItems([item1, item3]);
      expect(list.response.dataSource).toEqual([item2]);
    });
  });

  describe("modifyItem", () => {
    it("应修改项目", () => {
      list.response.dataSource = [{ id: 1, name: "old" }];
      list.modifyItem((item: any) => ({ ...item, name: "new" }));
      expect((list.response.dataSource[0] as any).name).toBe("new");
    });
  });

  describe("modifyDataSource", () => {
    it("应修改所有项目", () => {
      list.response.dataSource = [{ id: 1 }, { id: 2 }];
      list.modifyDataSource((item: any) => ({ ...item, added: true }));
      expect((list.response.dataSource[0] as any).added).toBe(true);
      expect((list.response.dataSource[1] as any).added).toBe(true);
    });
  });

  describe("modifyResponse", () => {
    it("应修改 response", () => {
      list.modifyResponse((resp) => ({ ...resp, custom: "value" }));
      expect((list.response as any).custom).toBe("value");
    });
  });

  describe("modifyParams", () => {
    it("应修改 params", () => {
      list.modifyParams((params) => ({ ...params, custom: "value" }));
      expect((list.params as any).custom).toBe("value");
    });
  });

  describe("modifySearch", () => {
    it("应修改 search 而保留 page 和 pageSize", () => {
      list.params = { page: 3, pageSize: 20, next_marker: "" };
      list.modifySearch((params) => ({ ...params, keyword: "test" }));
      expect(list.params.page).toBe(3);
      expect(list.params.pageSize).toBe(20);
      expect((list.params as any).keyword).toBe("test");
    });
  });

  describe("事件监听", () => {
    it("onStateChange 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = list.onStateChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onDataSourceChange 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = list.onDataSourceChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onLoadingChange 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = list.onLoadingChange(handler);
      expect(typeof unlisten).toBe("function");
    });

    it("onError 应注册监听器", () => {
      const handler = vi.fn();
      const unlisten = list.onError(handler);
      expect(typeof unlisten).toBe("function");
    });
  });
});
