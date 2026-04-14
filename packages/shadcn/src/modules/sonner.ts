import { View } from "@timeless/timeless";
// import { useEffect, useState } from "react"
// import {
//   CircleCheckIcon,
//   InfoIcon,
//   Loader2Icon,
//   OctagonXIcon,
//   TriangleAlertIcon,
// } from "lucide-react"
// import { Toaster as Sonner, type ToasterProps } from "sonner"

// const sonner = SonnerCore.getInstance()

// function Toaster({ ...props }: ToasterProps) {
//   const [theme, setTheme] = useState<"light" | "dark">("light")

//   useEffect(() => {
//     const isDark =
//       window.matchMedia &&
//       window.matchMedia("(prefers-color-scheme: dark)").matches
//     setTheme(isDark ? "dark" : "light")

//     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
//     const handleChange = (e: MediaQueryListEvent) => {
//       setTheme(e.matches ? "dark" : "light")
//     }

//     mediaQuery.addEventListener("change", handleChange)
//     return () => mediaQuery.removeEventListener("change", handleChange)
//   }, [])

//   return (
//     <Sonner
//       theme={theme as ToasterProps["theme"]}
//       className="toaster group"
//       visibleToasts={3}
//       gap={14}
//       icons={{
//         success: <CircleCheckIcon className="size-4" />,
//         info: <InfoIcon className="size-4" />,
//         warning: <TriangleAlertIcon className="size-4" />,
//         error: <OctagonXIcon className="size-4" />,
//         loading: <Loader2Icon className="size-4 animate-spin" />,
//       }}
//       style={
//         {
//           "--normal-bg": "var(--popover)",
//           "--normal-text": "var(--popover-foreground)",
//           "--normal-border": "var(--border)",
//           "--border-radius": "var(--radius)",
//           "--width": "356px",
//           "--gap": "14px",
//         } as React.CSSProperties
//       }
//       toastOptions={{
//         classNames: {
//           toast: "cn-toast",
//         },
//       }}
//       {...props}
//     />
//   )
// }

// function toast(message: unknown, data?: ExternalToast) {
//   return sonner.toast(message, data)
// }

// function success(message: unknown, data?: ExternalToast) {
//   return sonner.success(message, data)
// }

// function error(message: unknown, data?: ExternalToast) {
//   return sonner.error(message, data)
// }

// function info(message: unknown, data?: ExternalToast) {
//   return sonner.info(message, data)
// }

// function warning(message: unknown, data?: ExternalToast) {
//   return sonner.warning(message, data)
// }

// function loading(message: unknown, data?: ExternalToast) {
//   return sonner.loading(message, data)
// }

// function dismiss(id?: number | string) {
//   return sonner.dismiss(id)
// }

// export { Toaster, toast, success, error, info, warning, loading, dismiss }
export function Toaster() {
  return View({}, []);
}

// export
