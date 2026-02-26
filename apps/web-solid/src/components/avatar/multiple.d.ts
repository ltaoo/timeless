interface MultipleAvatarProps {
    value: {
        id: number;
        nickname: string;
        avatar_url?: string;
        is_self?: boolean;
    }[];
    max?: number;
}
export declare function MultipleAvatar(props: MultipleAvatarProps): import("solid-js").JSX.Element;
export {};
