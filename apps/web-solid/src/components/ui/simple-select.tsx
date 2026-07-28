import {  SimpleSelectCore  } from "@timeless/inner-kit";

export const SimpleSelect = (props: { store: SimpleSelectCore }) => {
  const { store } = props;

  const [state, setState] = createSignal(store.state);

  store.onStateChange((v) => {
    setState(v);
  });

  return (
    <select
      value={String(state().value)}
      onChange={(v) => {
        store.select(Number(v.target.value));
      }}
    >
      <For each={state().options}>
        {(opt) => {
          return <option value={String(opt.value)}>{opt.label}</option>;
        }}
      </For>
    </select>
  );
};
