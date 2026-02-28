/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    children: {
      home_layout: {
        title: "首页",
        pathname: "/home",
        children: {
          index: {
            title: "组件库",
            pathname: "/home/index",
            children: {
              general: {
                title: "通用组件",
                pathname: "/home/index/general",
              },
              form: {
                title: "表单组件",
                pathname: "/home/index/form",
              },
              data: {
                title: "数据展示组件",
                pathname: "/home/index/data",
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
            },
          },
          settings: {
            title: "设置",
            pathname: "/settings",
          },
        },
        options: {
          require: [],
        },
      },
      login: {
        title: "登录",
        pathname: "/login",
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
      },
    },
  },
};
const result = Timeless.build(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;
export const defaultRouteName = "root.home_layout.index.general";
