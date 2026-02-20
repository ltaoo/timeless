import { Dialog as H } from "../headless/dialog.js";

const t = {
  overlay: ({ enter, exit }) => ({
    style: ["position:fixed;inset:0;z-index:1000;background:var(--weui-OVERLAY);", enter ? "animation:weui-fade-in .3s;" : "", exit ? "animation:weui-fade-out .3s;" : ""].join(""),
  }),
  content: ({ enter, exit }) => ({
    style: ["position:fixed;left:50%;top:50%;z-index:1001;transform:translate(-50%,-50%);width:calc(100% - 64px);max-width:320px;background:var(--weui-BG-2);border-radius:12px;overflow:hidden;text-align:center;", enter ? "animation:weui-slide-up .3s;" : "", exit ? "animation:weui-slide-down .3s;" : ""].join(""),
  }),
  titleWrap: {},
  title: { style: "padding:32px 24px 16px;font-weight:700;font-size:var(--weui-FONT-SIZE);color:var(--weui-FG-0);line-height:1.4;" },
  body: { style: "padding:0 24px 32px;font-size:var(--weui-FONT-SIZE-SM);color:var(--weui-FG-1);line-height:1.6;" },
  closeBtn: { style: "display:none;" },
  footer: { style: "display:flex;border-top:1px solid var(--weui-SEPARATOR-0);" },
  cancelBtn: { style: "flex:1;height:56px;border:none;background:transparent;color:var(--weui-FG-1);font-size:var(--weui-FONT-SIZE);cursor:pointer;border-right:1px solid var(--weui-SEPARATOR-0);" },
  okBtn: { style: "flex:1;height:56px;border:none;background:transparent;color:var(--weui-BRAND);font-size:var(--weui-FONT-SIZE);font-weight:700;cursor:pointer;" },
};

export function Dialog(p, c) { return H({ ...p, theme: t }, c); }
