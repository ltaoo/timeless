import {  ApplicationModel as Application  } from "@timeless/domains";);
});
user.onTip((msg) => {
  app.tip(msg);
});
user.onNeedUpdate(() => {
  app.tipUpdate();
});
