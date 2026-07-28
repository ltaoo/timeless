import { createSignal, JSX, Show } from "solid-js";

import {  DragZoneCore  } from "@timeless/inner-kit";
            onChange={(event) => {
              store.handleDrop(Array.from(event.currentTarget.files || []));
            }}
          />
        </div>
      </div>
    </div>
  );
}
