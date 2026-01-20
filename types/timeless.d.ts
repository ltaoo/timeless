declare namespace Timeless {
  class BaseDomain<Events extends Record<string, unknown>> {
    unique_id: string;
    debug: boolean;
    uid(): number;
    on<Key extends keyof Events>(event: Key, handler: (data: Events[Key]) => void): () => void;
    off<Key extends keyof Events>(event: Key, handler: (data: Events[Key]) => void): void;
    emit<Key extends keyof Events>(event: Key, data?: Events[Key]): void;
    destroy(): void;
  }
  class Application<T extends { storage: any }> extends BaseDomain<any> {
    ready: boolean;
    screen: { width: number; height: number };
    env: { wechat: boolean; ios: boolean; android: boolean; pc: boolean; weapp: boolean; prod: string };
    start(size: { width: number; height: number }): Promise<{ error?: Error }>;
    setTheme(theme: string): { error?: string };
  }
  class StorageCore<T extends Record<string, unknown>> extends BaseDomain<any> {
    key: string;
    values: T;
    get<K extends keyof T>(key: K, defaultValue?: T[K]): T[K];
    set<K extends keyof T>(key: K, value: T[K]): void;
    merge<K extends keyof T>(key: K, values: Partial<T[K]>, extra?: { reverse?: boolean; limit?: number }): void;
    clear<K extends keyof T>(key: K): void;
    onStateChange(handler: (state: { values: T }) => void): () => void;
  }
  class UserCore extends BaseDomain<any> {
    id: string;
    nickname: string;
    avatar_url: string;
    token: string;
    isLogin: boolean;
    login(): Promise<{ error?: Error }>;
    logout(): void;
    validate(): Promise<{ error?: Error }>;
  }
  export { BaseDomain, Application, StorageCore, UserCore };
}
export as namespace Timeless;
