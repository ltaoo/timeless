import { Application } from "@/domains/app/index";
import { ListCore } from "@/domains/list/index";
import { NavigatorCore } from "@/domains/navigator/index";
import { RouteViewCore } from "@/domains/route_view/index";
import { HistoryCore } from "@/domains/history/index";
import { Result } from "@/domains/result/index";
import { RequestCore, onRequestCreated } from "@/domains/request/index";
import {
  onCreateGetPayload,
  onCreatePostPayload,
} from "@/domains/request/utils";
import { ImageCore } from "@/domains/ui/image/index";
import { query_stringify, wxResultify } from "@/utils/index";

import { client } from "./http_client";
import { user } from "./user";
import { storage } from "./storage";
import { PageKeys, RouteConfig, routes } from "./routes";
import { pages } from "./views";

export { client, storage };

NavigatorCore.prefix = "/";
ImageCore.setPrefix("https://media.funzm.com");

function media_response_format<T>(
  r: Result<{ code: number | string; msg: string; data: T }>
) {
  if (r.error) {
    return Result.Err(r.error.message);
  }
  const { code, msg, data } = r.data;
  if (code !== 0) {
    return Result.Err(msg, code, data);
  }
  return Result.Ok(data);
}
onCreatePostPayload((payload) => {
  payload.process = media_response_format;
});
onCreateGetPayload((payload) => {
  payload.process = media_response_format;
});
onRequestCreated((ins) => {
  ins.onFailed((e) => {
    app.tip({
      text: [e.message],
    });
  });
});

const router = new NavigatorCore();
const view = new RouteViewCore({
  name: "root" as PageKeys,
  pathname: "/",
  title: "ROOT",
  visible: true,
  parent: null,
  views: [],
});
view.isRoot = true;
export const history = new HistoryCore<PageKeys, RouteConfig>({
  view,
  router,
  routes,
  views: {
    root: view,
  } as Record<PageKeys, RouteViewCore>,
});
history.push = (
  name: PageKeys,
  query: Record<string, string> = {},
  options: Partial<{ ignore: boolean }> = {}
) => {
  const path = pages[name];
  if (!path) {
    app.tip({
      text: ["异常操作"],
    });
    return;
  }
  const url = [path, query ? query_stringify(query) : ""]
    .filter(Boolean)
    .join("?");
  wx.navigateTo({
    url,
  });
  return null;
};
history.replace = (
  name: PageKeys,
  query: Record<string, string> = {},
  options: Partial<{ ignore: boolean }> = {}
) => {
  const path = pages[name];
  if (!path) {
    app.tip({
      text: ["异常操作"],
    });
    return;
  }
  const url = [path, query ? query_stringify(query) : ""]
    .filter(Boolean)
    .join("?");
  wx.redirectTo({
    url,
  });
  return null;
};
history.back = () => {
  wx.navigateBack();
};
// class ExtendsApplication<T extends { storage: StorageCore<any> }> extends Application<T> {
//   hostname = "https://media.funzm.com";
// }
export const app = new Application({
  user,
  storage,
  async beforeReady() {
    // if (app.env.prod === "develop") {
    //   app.hostname = "https://media-t.frp.funzm.com";
    //   client.hostname = app.hostname;
    //   ImageCore.setPrefix(app.hostname);
    // }
    if (user.isLogin) {
      const r0 = await wxResultify(wx.checkSession)();
      console.log(r0);
      // if (r0.error) {
      //   app.tip({
      //     text: ["登录失败，请退出小程序重试"],
      //   });
      //   return Result.Err(r0.error.message);
      // }
      // const { code } = r0.data;
    }
    const r1 = await wxResultify(wx.login)();
    if (r1.error) {
      app.tip({
        text: ["登录失败，请退出小程序重试"],
      });
      return Result.Err(r1.error.message);
    }
    const { code } = r1.data;
    const r2 = await user.loginWithWeappCode({ code });
    if (r2.error) {
      app.tip({
        text: ["登录失败，请退出小程序重试"],
      });
      return Result.Err(r2.error.message);
    }
    client.appendHeaders({
      Authorization: r2.data.token,
    });
    return Result.Ok(null);
  },
});
user.onLogin((profile) => {
  client.appendHeaders({
    Authorization: user.token,
  });
  storage.set("user", profile);
});
user.onLogout(() => {
  storage.clear("user");
  history.push("root.login");
});
user.onExpired(() => {
  storage.clear("user");
  app.tip({
    text: ["token 已过期，请重新登录"],
  });
  history.push("root.login");
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onNeedUpdate(() => {
  app.tipUpdate();
});
