import { StorageCore } from "@/domains/storage";
export declare const storage: StorageCore<{
    user: {
        id: string;
        username: string;
        avatar: string;
        token: string;
        expires_at: number;
    };
    theme: string;
    dialog_flags: Record<string, {
        show_at: number;
    }>;
}>;
export declare const dialogs: Record<string, Partial<{
    /**
     * 弹窗间隔
     * "always" 忽略间隔，每次都弹
     * "weekly" 自然周，每周只能弹一次
     * "daily"  自然天，每天只能弹一次
     * number   指定间隔小时，如 24，即当天 12 点弹过，只有到了明天 12 点之后，才能再次弹
     */
    interval: "always" | "weekly" | "daily" | "hourly" | number;
    /** 优先级 */
    priority: number;
}>>;
export declare function check_can_show_dialog(name: keyof typeof dialogs): boolean;
export declare function mark_dialog_has_show(name: keyof typeof dialogs): void;
export declare const qiniu_storage: StorageCore<any>;
