
import { Result } from "@timeless/domains";

export function wxResultify<T = any>(fn: (opt: any) => any) {
  return (args: any = {}) => {
    return new Promise<Result<T>>((resolve) => {
      fn({
        ...args,
        success: (res: T) => {
          resolve(Result.Ok(res));
        },
        fail: (err: any) => {
          resolve(Result.Err(err.errMsg || err.message || "未知错误"));
        },
      });
    });
  };
}
