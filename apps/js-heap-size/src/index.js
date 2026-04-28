const root = document.getElementById("root");
let container = null;

function show() {
  container = document.createElement("div");
  container.style.padding = "8px";
  container.textContent = "Hello World";
  root.appendChild(container);
}

function hide() {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  container = null;
}

// 纯 vanilla DOM，不使用任何框架
const btn = document.createElement("button");
btn.textContent = "Toggle";
btn.onclick = () => {
  if (container) { hide(); } else { show(); }
};
root.appendChild(btn);
show();
