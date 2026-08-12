import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

interface BundleAnalysisOptions {
  package_name: string;
  package_root: string;
  report_filename?: string;
  workspace_root: string;
}

interface WorkspacePackage {
  name: string;
  root: string;
}

interface DependencySummary {
  kind: "workspace" | "third-party";
  modules: Array<{
    id: string;
    original_bytes: number;
    rendered_bytes: number;
  }>;
  name: string;
  original_bytes: number;
  rendered_bytes: number;
}

function normalize_path(file_path: string) {
  return file_path.replaceAll(path.sep, "/");
}

function load_workspace_packages(workspace_root: string) {
  const packages_root = path.join(workspace_root, "packages");
  const packages: WorkspacePackage[] = [];
  for (const entry of fs.readdirSync(packages_root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const package_root = path.join(packages_root, entry.name);
    const package_json_path = path.join(package_root, "package.json");
    if (!fs.existsSync(package_json_path)) continue;
    const pkg = JSON.parse(fs.readFileSync(package_json_path, "utf8"));
    if (typeof pkg.name !== "string") continue;
    packages.push({
      name: pkg.name,
      root: `${normalize_path(package_root)}/`,
    });
  }
  return packages.sort((left, right) => right.root.length - left.root.length);
}

function package_name_from_node_modules(module_id: string) {
  const marker = "/node_modules/";
  let cursor = 0;
  let package_name: string | null = null;
  while (true) {
    const marker_index = module_id.indexOf(marker, cursor);
    if (marker_index === -1) break;
    const remainder = module_id.slice(marker_index + marker.length);
    const segments = remainder.split("/");
    if (segments[0] === ".pnpm") {
      cursor = marker_index + marker.length;
      continue;
    }
    package_name = segments[0]?.startsWith("@")
      ? `${segments[0]}/${segments[1]}`
      : segments[0];
    cursor = marker_index + marker.length;
  }
  return package_name;
}

function relative_module_id(module_id: string, workspace_root: string) {
  const normalized_root = `${normalize_path(workspace_root)}/`;
  if (module_id.startsWith(normalized_root)) {
    return module_id.slice(normalized_root.length);
  }
  return module_id;
}

export function bundle_analysis_plugin(options: BundleAnalysisOptions): Plugin {
  const workspace_packages = load_workspace_packages(options.workspace_root);
  const workspace_names = new Set(workspace_packages.map((pkg) => pkg.name));

  return {
    name: "timeless-bundle-analysis",
    apply: "build",
    generateBundle(output_options, bundle) {
      if (output_options.format !== "umd") return;

      const dependencies = new Map<string, DependencySummary>();
      const external_imports = new Set<string>();
      const output_files: string[] = [];

      for (const output of Object.values(bundle)) {
        if (output.type !== "chunk") continue;
        output_files.push(output.fileName);
        for (const imported of [...output.imports, ...output.dynamicImports]) {
          if (imported === output.fileName) continue;
          if (!imported.startsWith(".") && !imported.startsWith("/")) {
            external_imports.add(imported);
          }
        }

        for (const [raw_module_id, module_info] of Object.entries(
          output.modules,
        )) {
          const module_id = normalize_path(raw_module_id.split("?")[0]);
          const workspace_package = workspace_packages.find((pkg) =>
            module_id.startsWith(pkg.root),
          );
          const node_package_name = package_name_from_node_modules(module_id);
          const dependency_name =
            workspace_package?.name || node_package_name || null;
          if (!dependency_name) continue;

          const kind = workspace_names.has(dependency_name)
            ? "workspace"
            : "third-party";
          const key = `${kind}:${dependency_name}`;
          const summary = dependencies.get(key) || {
            kind,
            modules: [],
            name: dependency_name,
            original_bytes: 0,
            rendered_bytes: 0,
          };
          const original_bytes = module_info.originalLength || 0;
          const rendered_bytes = module_info.renderedLength || 0;
          summary.modules.push({
            id: relative_module_id(module_id, options.workspace_root),
            original_bytes,
            rendered_bytes,
          });
          summary.original_bytes += original_bytes;
          summary.rendered_bytes += rendered_bytes;
          dependencies.set(key, summary);
        }
      }

      const source = `${JSON.stringify(
        {
          package_name: options.package_name,
          package_root: relative_module_id(
            normalize_path(options.package_root),
            options.workspace_root,
          ),
          format: output_options.format,
          output_files: output_files.sort(),
          external_imports: [...external_imports].sort(),
          dependencies: [...dependencies.values()]
            .map((dependency) => ({
              ...dependency,
              modules: dependency.modules.sort((left, right) =>
                left.id.localeCompare(right.id),
              ),
            }))
            .sort((left, right) => left.name.localeCompare(right.name)),
        },
        null,
        2,
      )}\n`;

      this.emitFile({
        type: "asset",
        fileName: options.report_filename || "bundle-analysis.json",
        source,
      });
    },
  };
}
