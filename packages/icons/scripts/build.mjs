import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { optimize } from "svgo";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SVG_DIR = join(__dirname, "../src/file");
const ASN_DIR = join(__dirname, "../src/asn");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function safeWriteFileSync(filePath, content) {
  if (existsSync(filePath) && readFileSync(filePath, "utf-8") === content) {
    return;
  }
  writeFileSync(filePath, content);
}

function parseSvgToAsn(svgContent) {
  const result = optimize(svgContent, {
    plugins: ["removeDimensions", "removeXMLNS", "convertStyleToAttrs"],
  });

  const svg = result.data;
  const asn = {
    tag: "svg",
    attrs: {},
    children: [],
  };

  const svgMatch = svg.match(/<svg([^>]*)>/);
  if (svgMatch) {
    const attrStr = svgMatch[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      asn.attrs[m[1]] = m[2];
    }
  }

  const contentMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (contentMatch) {
    const innerHtml = contentMatch[1];
    asn.children = parseInnerContent(innerHtml);
  }

  return asn;
}

function parseInnerContent(html) {
  const children = [];

  const pathRegex = /<path\s+([^>]*)>/g;
  let match;
  while ((match = pathRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({ tag: "path", attrs });
  }

  const circleRegex = /<circle\s+([^>]*)>/g;
  while ((match = circleRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({ tag: "circle", attrs });
  }

  const rectRegex = /<rect\s+([^>]*)>/g;
  while ((match = rectRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({ tag: "rect", attrs });
  }

  const lineRegex = /<line\s+([^>]*)>/g;
  while ((match = lineRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({ tag: "line", attrs });
  }

  const polylineRegex = /<polyline\s+([^>]*)>/g;
  while ((match = polylineRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({ tag: "polyline", attrs });
  }

  const polygonRegex = /<polygon\s+([^>]*)>/g;
  while ((match = polygonRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({ tag: "polygon", attrs });
  }

  const gRegex = /<g([^>]*)>([\s\S]*?)<\/g>/g;
  while ((match = gRegex.exec(html)) !== null) {
    const attrs = {};
    const attrStr = match[1];
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*)["']/g;
    let m;
    while ((m = attrRegex.exec(attrStr)) !== null) {
      attrs[m[1]] = m[2];
    }
    children.push({
      tag: "g",
      attrs,
      children: parseInnerContent(match[2]),
    });
  }

  return children;
}

function processIcon(name, svgContent) {
  const optimized = optimize(svgContent, {
    plugins: ["removeDimensions"],
  });

  const svgFile = join(SVG_DIR, `${name}.svg`);
  safeWriteFileSync(svgFile, optimized.data);

  const asn = parseSvgToAsn(svgContent);
  const asnFile = join(ASN_DIR, `${name}.ts`);
  safeWriteFileSync(
    asnFile,
    `export default ${JSON.stringify(asn, null, 2)} as const;`,
  );

  console.log(`Processed: ${name}`);
}

function main() {
  ensureDir(SVG_DIR);
  ensureDir(ASN_DIR);

  const files = readdirSync(SVG_DIR);
  const svgFiles = files.filter((f) => f.endsWith(".svg"));

  for (const file of svgFiles) {
    const filePath = join(SVG_DIR, file);
    const content = readFileSync(filePath, "utf-8");
    const name = file.replace(".svg", "");
    processIcon(name, content);
  }

  const iconNames = svgFiles.map((f) => f.replace(".svg", ""));

  const asnIndexContent = iconNames
    .map(
      (name) => `export { default as ${toPascalCase(name)} } from "./${name}";`,
    )
    .join("\n");
  safeWriteFileSync(join(ASN_DIR, "index.ts"), asnIndexContent);

  const asnRegistryImports = iconNames
    .map((name) => {
      const pascalName = toPascalCase(name);
      const varName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
      return `import ${varName} from "./${name}";`;
    })
    .join("\n");

  const asnRegistryContent = `${asnRegistryImports}

export const iconRegistry = {
${iconNames
  .map((name) => {
    const pascalName = toPascalCase(name);
    const varName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
    const key = name.replace(/-\d+$/, (m) => m.replace("-", ""));
    return `  "${key}": ${varName},`;
  })
  .join("\n")}
};
`;
  safeWriteFileSync(join(ASN_DIR, "registry.ts"), asnRegistryContent);

  const srcRegistryImports = iconNames
    .map((name) => {
      const pascalName = toPascalCase(name);
      const varName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
      return `import ${varName} from "./asn/${name}";`;
    })
    .join("\n");

  const srcIndexContent = `export * from "./asn/index";

${srcRegistryImports}

export const iconRegistry = {
${iconNames
  .map((name) => {
    const pascalName = toPascalCase(name);
    const varName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);
    const key = name.replace(/-\d+$/, (m) => m.replace("-", ""));
    return `  "${key}": ${varName},`;
  })
  .join("\n")}
};
`;
  safeWriteFileSync(join(__dirname, "../src/index.ts"), srcIndexContent);
}

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

main();
