import { CountdownViewModel } from "~/biz/countdown";
export declare function Countdown(props: {
    store: CountdownViewModel;
    onStart?: () => void;
    onCompleted?: () => void;
}): import("solid-js").JSX.Element;
