export const highlightJsUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
export const highlightCssUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css";

let highlightJsLoaded = false;

export async function loadHighlightJs() {
  if (highlightJsLoaded) return;
  
  const script = document.createElement("script");
  script.src = highlightJsUrl;
  script.async = true;
  
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = highlightCssUrl;
  
  document.head.appendChild(link);
  
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  
  highlightJsLoaded = true;
}

export function highlightCodeBlock(codeElement, language = "") {
  if (!codeElement || !window.hljs) return;
  
  if (language && window.hljs.getLanguage(language)) {
    window.hljs.highlightElement(codeElement);
  } else {
    window.hljs.highlightElement(codeElement);
  }
}

export function highlightAllCodeBlocks(container) {
  if (!window.hljs) return;
  
  const codeBlocks = container.querySelectorAll("code.hljs");
  codeBlocks.forEach((block) => {
    highlightCodeBlock(block);
  });
}

export function getLanguageFromClass(className) {
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : "";
}

export const supportedLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "html",
  "css",
  "scss",
  "json",
  "xml",
  "yaml",
  "markdown",
  "bash",
  "shell",
  "sql",
  "mysql",
  "postgresql",
  "dockerfile",
  "nginx",
  "plaintext",
];
