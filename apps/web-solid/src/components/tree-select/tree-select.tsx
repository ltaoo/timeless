import { For, Show } from "solid-js";

import { useViewModelStore } from "~/hooks";

import {  TreeSelectModel, TreeSelectNodeModel  } from "@timeless/inner-kit";>
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
