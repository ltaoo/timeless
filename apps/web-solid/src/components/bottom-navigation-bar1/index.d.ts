import { JSX } from "solid-js/jsx-runtime";
import { ViewComponentProps } from "~/store/types";
export declare function BottomNavigationBar1(props: {
    history: ViewComponentProps["history"];
    /** 到首页按钮 */
    home?: boolean;
    /** 隐藏边框线 */
    hide_border?: boolean;
    extra?: JSX.Element;
    back: () => void;
}): JSX.Element;
