/* @refresh reload */
import { render } from "solid-js/web";

import "./style.css";
import { HomeIndexPage } from "./pages/home/index";
import { app, history, client, storage } from "./store/index";

render(
  () => (
    <HomeIndexPage
      app={app as any}
      history={history as any}
      view={{} as any}
      client={client}
      storage={storage}
      pages={{} as any}
    />
  ),
  document.getElementById("root") as HTMLElement
);
