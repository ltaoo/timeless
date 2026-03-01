import {  ApplicationModel as Application  } from "@timeless/kit";);
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onNeedUpdate(() => {
  app.tipUpdate();
});
