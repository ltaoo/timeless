(function start_download_task_list(global) {
  "use strict";

  Object.assign(global, global.Timeless);
  Object.assign(global, global.Timeless.shadcn);

  const root = document.querySelector("#app");
  const config = global.DownloadTaskListModel.resolve_config(global.location);
  const model = new global.DownloadTaskListModel(config);
  const view = new global.DownloadTaskListView(root, model);

  global.download_task_model = model;
  global.download_task_view = view;
  global.__DOWNLOAD_TASK_APP_READY__ = model.start();

  global.addEventListener(
    "beforeunload",
    () => {
      view.destroy();
      model.destroy();
    },
    { once: true },
  );
})(window);
