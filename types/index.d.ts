declare global {
  interface Window {}

  // 如果需要在 Node.js 环境中使用
  //   namespace NodeJS {
  //     interface Global {
  //       MyLib: typeof MyLib;
  //     }
  //   }
}
