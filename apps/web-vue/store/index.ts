import {  Application  } from "@timeless/inner-kit";);
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onNeedUpdate(() => {
  app.tipUpdate();
});
