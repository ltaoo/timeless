/**
 * @file 应用实例，也可以看作启动入口，优先会执行这里的代码
 * 应该在这里进行一些初始化操作、全局状态或变量的声明
 */
import {  ImageCore  } from "@timeless/inner-kit";);
});
user.onError((e) => {
  app.tip({
    text: [e.message],
  });
});
