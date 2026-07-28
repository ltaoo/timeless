// import { useEffect, useRef, useState } from "react";
import { Match, Switch, createSignal, onMount } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { effect } from "solid-js/web";
import { Image, ImageOff } from "lucide-solid";

import {  ImageCore, ImageStep  } from "@timeless/inner-kit";: state().fit }}
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
