import { Toast as H } from "@timeless/timeless";

const t = {
  mask: { style: "position:fixed;inset:0;z-index:998;background:transparent;" },
  wrapper: { style: "position:fixed;left:50%;top:50%;z-index:999;transform:translate(-50%,-50%);" },
  body: ({ enter, exit }) => ({
    style: ["display:flex;flex-direction:column;align-items:center;gap:8px;padding:24px;min-width:120px;background:var(--weui-BG-4);border-radius:12px;color:#fff;", enter ? "animation:weui-fade-in .2s;" : "", exit ? "animation:weui-fade-out .2s;" : ""].join(""),
  }),
  spinner: { style: "width:36px;height:36px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:weui-spin 1s linear infinite;" },
  text: { style: "font-size:var(--weui-FONT-SIZE-SM);text-align:center;" },
};

export function Toast(p: Parameters<typeof H>[0]) { return H({ ...p, theme: t }); }
