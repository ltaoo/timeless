import { StorageCore } from "@/domains/storage/index";
export declare const storage: StorageCore<{
    user: {
        id: string;
        username: string;
        email: string;
        token: string;
        avatar: string;
        expires_at: number;
    };
    theme: string;
}>;
