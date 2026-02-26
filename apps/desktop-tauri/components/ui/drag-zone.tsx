import { Component, JSX } from "solid-js";

export const DropArea: Component<{ store: any; children: JSX.Element }> = (props) => {
  return <div>{props.children}</div>;
};
