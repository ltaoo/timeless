interface HLJSApi {
  highlightElement(element: HTMLElement, language?: string, ignoreIllegals?: boolean): void;
  getLanguage(name: string): { name: string } | undefined;
  highlight(code: string, language: string, ignoreIllegals?: boolean): { value: string };
}

interface Window {
  hljs: HLJSApi;
}
