import { expect, it, describe } from "vitest";

import { buildRoutes } from "../utils";

const configuration = {
  home_layout: {
    title: "首页",
    pathname: "/home",
    children: {
      index: {
        title: "组件库",
        pathname: "/home/index",
        children: {
          general: {
            // @ts-ignore
            default: true,
            title: "通用组件",
            pathname: "/home/index/general",
          },
          form: {
            title: "表单组件",
            pathname: "/home/index/form",
          },
          validate: {
            title: "表单组件",
            pathname: "/home/index/validate",
          },
          llm: {
            title: "LLM",
            pathname: "/home/index/llm",
          },
          data: {
            title: "数据展示组件",
            pathname: "/home/index/data",
          },
          scroll: {
            title: "滚动容器",
            pathname: "/home/index/scroll",
          },
          feedback: {
            title: "反馈组件",
            pathname: "/home/index/feedback",
          },
          nav: {
            title: "导航组件",
            pathname: "/home/index/nav",
          },
          overlay: {
            title: "浮层组件",
            pathname: "/home/index/overlay",
          },
          debug: {
            title: "调试",
            pathname: "/home/index/debug",
          },
          lifecycle: {
            title: "生命周期",
            pathname: "/home/index/lifecycle",
          },
          command: {
            title: "命令面板",
            pathname: "/home/index/command",
          },
          download_task: {
            title: "下载任务",
            pathname: "/home/index/download_task",
          },
        },
      },
      settings: {
        title: "设置",
        pathname: "/settings",
      },
      article: {
        title: "博客",
        pathname: "/article",
        children: {
          category: {
            title: "博客",
            pathname: "/article/category",
            children: {
              content: {
                title: "博客详情",
                pathname: "/article/category/detail",
              },
            },
          },
        },
      },
      project: {
        title: "项目",
        pathname: "/home/project",
        children: {
          workspace: {
            title: "项目工作台",
            pathname: "/home/project/workspace",
          },
          history: {
            title: "项目历史",
            pathname: "/home/project/history",
          },
        },
      },
    },
    options: {
      require: /** @type {string[]} */ [],
    },
  },
  admin_layout: {
    title: "管理后台",
    pathname: "/admin",
    children: {
      dashboard: {
        title: "仪表盘",
        pathname: "/admin/dashboard",
      },
      users: {
        title: "用户管理",
        pathname: "/admin/users",
      },
      user_detail: {
        title: "用户详情",
        pathname: "/admin/users/detail",
      },
      roles: {
        title: "角色权限",
        pathname: "/admin/roles",
      },
      logs: {
        title: "操作日志",
        pathname: "/admin/logs",
      },
      system: {
        title: "系统设置",
        pathname: "/admin/system",
      },
    },
  },
  login: {
    title: "登录",
    pathname: "/login",
  },
  notfound: {
    title: "404",
    pathname: "/notfound",
    // @ts-ignore
    notfound: true,
  },
};

describe("真实世界路由生成", () => {
  it("1、生成路由", () => {
    const r = buildRoutes(configuration);
    const views = r.views;
    console.log(r);
    expect(Object.keys(views).length).toBe(0);
  });
});
