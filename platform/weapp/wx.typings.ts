declare namespace wx {
  function checkSession(): Promise<unknown>;
  function login(): Promise<unknown>;
  function navigateTo(route: { url: string }): Promise<unknown>;
  function redirectTo(route: { url: string }): Promise<unknown>;
  function navigateBack(): Promise<unknown>;
  function getStorageSync(key: string): any;
  function setStorageSync(key: string, value: any): void;
}
