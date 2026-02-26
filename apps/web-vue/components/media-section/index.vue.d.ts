import { ViewComponentProps } from "../../store/types";
import { MediaTypes } from "@/constants/index";
type __VLS_Props = {
    title: string;
    showExtra?: boolean;
    type?: MediaTypes;
    params: Record<string, string | number>;
} & Pick<ViewComponentProps, "app" | "client" | "storage" | "history">;
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
