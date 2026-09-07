/// <reference path="../../../packages/types/global.d.ts" />

type ViewComponentProps = {
  app_model: ReturnType<
    typeof import("../src/app.model.js").DouyinApplicationModel
  >;
};
