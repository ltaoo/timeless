import { JSX } from "solid-js/jsx-runtime";

import { useViewModelStore } from "@/hooks";

import * as ui from '@timeless/inner-vm';

export function InputTextView(props: { store: ui.InputCore<any> } & JSX.HTMLAttributes<HTMLDivElement>) {
  const [state, vm] = useViewModelStore(props.store);

  return <div>{state().value}</div>;
}
