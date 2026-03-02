import * as ui from '@timeless/ui';
import { createContext, onCleanup, useContext } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

const CollectionContext = createContext<ui.CollectionCore>();
const CollectionProvider = (props: { store: ui.CollectionCore; children: JSX.Element }) => {
  const { store } = props;
  return <CollectionContext.Provider value={store}>{props.children}</CollectionContext.Provider>;
};
const CollectionSlot = (props: { children: JSX.Element }) => {
  const store = useContext(CollectionContext);
  const wrap = {};
  if (store) {
    store.setWrap(wrap);
  }

  return props.children;
};
const CollectionItemSlot = (props: { children: JSX.Element }) => {
  const store = useContext(CollectionContext);

  if (store) {
    const node = {
      id: store.uid(),
    };
    store.add(node, node);
    // store.remove(node);
  }

  return props.children;
};

const Provider = CollectionProvider;
const Slot = CollectionSlot;
const Item = CollectionItemSlot;

export { Provider, Slot, Item };
