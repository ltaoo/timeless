export declare function useViewModel<T extends {
    state: any;
    ready: () => void;
    onStateChange: (handler: any) => void;
}>(builder: () => T): [T["state"], T];
/**
 * 初始化时
 */
export declare function useInitialize(fn: Function): void;
export declare function onUnmount(fn: Function): void;
export declare function onMount(fn: Function): void;
export declare function useLatestValue(v: unknown): import("react").MutableRefObject<unknown>;
type Factory = () => unknown;
export declare function useInstance<T extends Factory>(fn: T): ReturnType<T>;
export declare function useDomainState<T extends {
    state: any;
    onStateChange: (handler: (nextState: any) => void) => void;
}>(domain: T): any;
export {};
