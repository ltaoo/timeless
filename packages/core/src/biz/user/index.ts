import { BaseDomain } from "@/domains/base";
import { Result } from "@/domains/result";

export class UserCore extends BaseDomain<any> {
  token: string = "";
  nickname: string = "";

  constructor(props?: any, client?: any) {
    super();
  }

  get isLogin() {
    return !!this.token;
  }

  async loginWithWeappCode(params: { code: string }) {
    return Result.Ok({ token: "token" });
  }

  async loginWithEmailAndPwd(params: { email: string; pwd: string }) {
    return Result.Ok({ token: "token" });
  }

  async register(params: { email: string; pwd: string; code?: string }) {
    return Result.Ok({ token: "token" });
  }

  async refreshToken() {
    return Result.Ok({ token: "token" });
  }

  logout() {
    this.token = "";
    this.emit("logout");
  }

  setToken(token: string) {
    this.token = token;
  }

  onLogin(cb: (profile: any) => void) {
    this.on("login", cb);
  }

  onTokenRefresh(cb: (token: string) => void) {
    this.on("token_refresh", cb);
  }

  onError(cb: (err: Error) => void) {
    this.on("error", cb);
  }

  onLogout(cb: () => void) {
    this.on("logout", cb);
  }

  onExpired(cb: () => void) {
    this.on("expired", cb);
  }

  onTip(cb: (msg: any) => void) {
    this.on("tip", cb);
  }

  onNeedUpdate(cb: () => void) {
    this.on("need_update", cb);
  }
}
