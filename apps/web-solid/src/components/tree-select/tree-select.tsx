import { For, Show } from "solid-js";

import { useViewModelStore } from "~/hooks";

import {  TreeSelectModel, TreeSelectNodeModel  } from "@timeless/domains";>
        <TreeSelect store={vm.ui.$children} />
        {/* <For each={props.children}>
		{(child) => {
		  return <CategoryNodeView {...child} onChange={props.onChange} />;
		}}
	      </For> */}
      </div>
    </div>
  );
}
