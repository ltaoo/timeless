const { refobj, computed } = Timeless;

// Simple toaster using SonnerCore
export function initToaster() {
  const { SonnerCore } = Timeless.vm;
  const sonner = SonnerCore();

  sonner.subscribe((toasts) => {
    let container = document.getElementById("sonner-toaster");
    if (!container) {
      container = document.createElement("ol");
      container.id = "sonner-toaster";
      container.className = "fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none";
      document.body.appendChild(container);
    }

    container.innerHTML = "";
    toasts.forEach((t) => {
      const li = document.createElement("li");
      li.className = "pointer-events-auto bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg px-4 py-3 text-sm min-w-[280px] animate-in slide-in-from-right-2 fade-in duration-200";
      const colors = {
        success: "border-l-4 border-l-green-500",
        error: "border-l-4 border-l-red-500",
        warning: "border-l-4 border-l-yellow-500",
        info: "border-l-4 border-l-blue-500",
        loading: "border-l-4 border-l-zinc-400",
        normal: "",
      };
      li.className += " " + (colors[t.type] || "");
      li.innerHTML = t.content || t.message || "";
      if (t.dismissible !== false) {
        const btn = document.createElement("button");
        btn.className = "ml-3 text-muted-foreground hover:text-foreground float-right";
        btn.textContent = "x";
        btn.onclick = () => sonner.dismiss(t.id);
        li.appendChild(btn);
      }
      container.appendChild(li);
    });
  });

  return sonner;
}
