// import { useEffect, useRef, useState } from "react";
import { Match, Switch, createSignal, onMount } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { effect } from "solid-js/web";
import { Image, ImageOff } from "lucide-solid";

import * as ui from '@timeless/inner-vm';
// @ts-ignore
// import { connect } from "@timeless/kit/ui/image/connect.web";

export function LazyImage(props: { store: ui.ImageCore; alt?: string } & JSX.HTMLAttributes<HTMLImageElement>) {
  const { store } = props;

  let $img: HTMLImageElement | undefined = undefined;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => {
    // console.log("[COMPONENT]ui/image - store.onStateChange", v);
    setState(v);
  });
  onMount(() => {
    if (!$img) {
      return;
    }
    // connect($img, store);
  });
  // effect(() => {
  //   if (!props.src) {
  //     return;
  //   }
  //   store.updateSrc(props.src);
  // });

  return (
    <div
      ref={$img}
      classList={{
        [props.class as string]: true,
        "flex items-center justify-center": true,
        "bg-slate-200": ![ui.ImageStep.Loading, ui.ImageStep.Loaded].includes(state().step),
      }}
    >
      <Switch>
        <Match when={state().step === ui.ImageStep.Failed}>
          <ImageOff class="w-8 h-8 text-slate-500" />
        </Match>
        <Match when={state().step === ui.ImageStep.Pending}>
          <Image class="w-8 h-8 text-slate-500" />
        </Match>
        <Match when={[ui.ImageStep.Loading, ui.ImageStep.Loaded].includes(state().step)}>
          <img
            class={props.class}
            style={{ "object-fit": state().fit }}
            src={state().src}
            alt={state().alt}
            onError={() => {
              store.handleError();
            }}
          />
        </Match>
      </Switch>
    </div>
  );
}
