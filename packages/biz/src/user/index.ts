import { BaseDomain, Result } from "@timeless/inner-base";

export type UserEvents<Profile> = {
  login: Profile;
  token_refresh: Profile;
  logout: void;
  expired: void;
  tip: any;
  need_update: void;
  error: Error;
};

export abstract class User<
  Profile extends Record<string, any> = Record<string, any>,
  Client = any,
> extends BaseDomain<UserEvents<Profile>> {
  token = "";
  nickname = "";
  profile: Profile | null = null;
  client: Client | undefined;

  constructor(profile?: Partial<Profile> | null, client?: Client) {
    super({ unique_id: "User" } as any);
    this.client = client;
    if (profile) {
      this.setProfile(profile);
    }
  }

  get isLogin() {
    return !!this.token;
  }

  setProfile(profile: Partial<Profile> | null) {
    if (!profile) {
      this.profile = null;
      this.token = "";
      this.nickname = "";
      return;
    }
    const next = {
      ...(this.profile || ({} as Profile)),
      ...(profile as any),
    } as Profile;
    this.profile = next;
    if (typeof (next as any).token === "string") {
      this.token = (next as any).token;
    }
    if (typeof (next as any).nickname === "string") {
      this.nickname = (next as any).nickname;
    }
  }

  protected commitLogin(profile: Partial<Profile>) {
    this.setProfile(profile);
    if (this.profile) {
      this.emit("login", this.profile);
    }
  }

  protected commitTokenRefresh(profile: Partial<Profile>) {
    this.setProfile(profile);
    if (this.profile) {
      this.emit("token_refresh", this.profile);
    }
  }

  async authWithToken(token: string) {
    this.commitLogin({ token } as any);
    return Result.Ok(this.profile as any);
  }

  async loginWithWeappCode(_params: { code: string }) {
    return Result.Err("NOT_IMPLEMENTED", "NOT_IMPLEMENTED");
  }

  async loginWithEmailAndPwd(_params: { email: string; pwd: string }) {
    return Result.Err("NOT_IMPLEMENTED", "NOT_IMPLEMENTED");
  }

  async register(_params: { email: string; pwd: string; code?: string }) {
    return Result.Err("NOT_IMPLEMENTED", "NOT_IMPLEMENTED");
  }

  async refreshToken() {
    return Result.Err("NOT_IMPLEMENTED", "NOT_IMPLEMENTED");
  }

  logout() {
    this.setProfile(null);
    this.emit("logout");
  }

  setToken(token: string) {
    this.token = token;
    if (this.profile) {
      (this.profile as any).token = token;
    }
  }

  onLogin(cb: (profile: Profile) => void) {
    this.on("login", cb);
  }

  onTokenRefresh(cb: (profile: Profile) => void) {
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

export class UserCore extends User<any, any> {
  constructor(props?: any, client?: any) {
    super(props, client);
  }

  async loginWithWeappCode(_params: { code: string }) {
    this.commitLogin({ token: "token" });
    return Result.Ok(this.profile);
  }

  async loginWithEmailAndPwd(_params: { email: string; pwd: string }) {
    this.commitLogin({ token: "token" });
    return Result.Ok(this.profile);
  }

  async register(_params: { email: string; pwd: string; code?: string }) {
    this.commitLogin({ token: "token" });
    return Result.Ok(this.profile);
  }

  async refreshToken() {
    this.commitTokenRefresh({ token: "token" });
    return Result.Ok(this.profile);
  }
}
