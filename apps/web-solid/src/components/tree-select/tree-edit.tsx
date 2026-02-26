import { For, JSX, Show } from "solid-js";

import { useViewModelStore } from "~/hooks";

import {  TreeSelectModel, TreeSelectNodeModel  } from "@timeless/domains";>
          <TreeEdit store={vm.ui.$children} renderNode={props.renderNode} />
        </div>
        {/* <For each={props.children}>
		{(child) => {
		  return <CategoryNodeView {...child} onChange={props.onChange} />;
		}}
	      </For> */}
      </div>
    </div>
  );
}
