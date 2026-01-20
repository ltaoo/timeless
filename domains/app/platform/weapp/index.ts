import { Application } from "@/domains/app/index";
import { StorageCore } from "@/domains/storage/index";

export function connect<T extends { storage: StorageCore<any> }>(app: Application<T>) {
  // const { router } = app;
  // const ownerDocument = globalThis.document;
  // app.getComputedStyle = (el: HTMLElement) => {
  //   return window.getComputedStyle(el);
  // };
  app.setTitle = (title: string) => {
    wx.setNavigationBarTitle({
      title,
    });
  };
  // window.addEventListener("DOMContentLoaded", () => {
  //   const { innerWidth, innerHeight } = window;
  //   app.setSize({ width: innerWidth, height: innerHeight });
  // });
  // window.addEventListener("load", () => {
  // });
  // window.addEventListener("popstate", (event) => {
  //   const { type } = event;
  //   const { pathname } = window.location;
  //   app.emit(app.Events.PopState, { type, pathname });
  // });
  // window.addEventListener("beforeunload", (event) => {
  // });
  wx.onWindowResize((screen) => {
    const {
      size: { windowWidth, windowHeight },
    } = screen;
    const size = {
      width: windowWidth,
      height: windowHeight,
    };
    if (size.width === app.screen.height && size.height === app.screen.width) {
      app.screen.width = size.height;
      app.screen.height = size.width;
      app.handleScreenOrientationChange(size.width > size.height ? 1 : 0);
    }
    app.handleResize(size);
  });
  // wx.onDeviceMotionChange((r) => {
  //   console.log(r.)
  // });
  // window.addEventListener("blur", () => {
  //   app.emit(app.Events.Blur);
  // });
  // document.addEventListener("visibilitychange", () => {
  //   if (document.visibilityState === "hidden") {
  //     app.emit(app.Events.Hidden);
  //     return;
  //   }
  //   app.emit(app.Events.Show);
  // });

  // const { availHeight, availWidth } = window.screen;
  // if (window.navigator.userAgent.match(/iphone/i)) {
  //   const matched = [
  //     // iphonex iphonexs iphone12mini
  //     "375-812",
  //     // iPhone XS Max iPhone XR
  //     "414-896",
  //     // iPhone pro max iPhone14Plus
  //     "428-926",
  //     // iPhone 12/pro 13/14  753
  //     "390-844",
  //     // iPhone 14Pro
  //     "393-852",
  //     // iPhone 14ProMax
  //     "430-932",
  //   ].includes(`${availWidth}-${availHeight}`);
  //   app.safeArea = !!matched;
  // }
  // ownerDocument.addEventListener("keydown", (event) => {
  //   const { key } = event;
  //   app.keydown({ key });
  // });
  // ownerDocument.addEventListener("click", (event) => {
  //   let target = event.target;
  //   if (target instanceof Document) {
  //     return;
  //   }
  //   if (target === null) {
  //     return;
  //   }
  //   let matched = false;
  //   while (target) {
  //     const t = target as HTMLElement;
  //     if (t.tagName === "A") {
  //       matched = true;
  //       break;
  //     }
  //     target = t.parentNode;
  //   }
  //   if (!matched) {
  //     return;
  //   }
  //   const t = target as HTMLElement;
  //   const href = t.getAttribute("href");
  //   if (!href) {
  //     return;
  //   }
  //   if (!href.startsWith("/")) {
  //     return;
  //   }
  //   if (href.startsWith("http")) {
  //     return;
  //   }
  //   event.preventDefault();
  //   app.emit(app.Events.ClickLink, { href });
  // });
  // router.onBack(() => {
  //   window.history.back();
  // });
  // router.onReload(() => {
  //   window.location.reload();
  // });
  // router.onPushState(({ from, path }) => {
  //   // router.log("[Application ]- onPushState", path);
  //   window.history.pushState(
  //     {
  //       from,
  //     },
  //     "",
  //     path
  //   );
  // });
  // router.onReplaceState(({ from, path, pathname }) => {
  //   // router.log("[Application ]- onReplaceState");
  //   window.history.replaceState(
  //     {
  //       from,
  //     },
  //     "",
  //     path
  //   );
  // });

  // const originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
  // app.disablePointer = () => {
  //   ownerDocument.body.style.pointerEvents = "none";
  // };
  // app.enablePointer = () => {
  //   ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
  // };
}
