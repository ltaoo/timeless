const fs = require("fs");
const path = require("path");

class BuildAnalysisModel {
  constructor(root_dir) {
    this.root_dir = root_dir;
    this.root_package = JSON.parse(
      fs.readFileSync(path.join(root_dir, "package.json"), "utf8"),
    );
    this.release_dir = path.join(
      root_dir,
      "dist",
      "timeless",
      this.root_package.version,
    );
  }

  load_release_manifest() {
    const manifest_path = path.join(this.release_dir, "manifest.json");
    return JSON.parse(fs.readFileSync(manifest_path, "utf8"));
  }

  load_bundle_report(package_dir, report_filename = "bundle-analysis.json") {
    const report_path = path.join(
      this.root_dir,
      "packages",
      package_dir,
      "dist",
      report_filename,
    );
    if (!fs.existsSync(report_path)) {
      throw new Error(`Missing bundle analysis: ${report_path}`);
    }
    return JSON.parse(fs.readFileSync(report_path, "utf8"));
  }

  find_opaque_workspace_bundles(bundle_reports) {
    const violations = [];
    for (const report of bundle_reports) {
      for (const dependency of report.dependencies) {
        if (dependency.kind !== "workspace") continue;
        const modules = dependency.modules
          .filter((module) => module.id.includes("/dist/"))
          .map((module) => module.id);
        if (modules.length === 0) continue;
        violations.push({
          artifact: report.artifact,
          dependency: dependency.name,
          modules,
        });
      }
    }
    return violations;
  }

  find_profile_duplicates(profile, bundle_reports) {
    const occurrences = new Map();
    for (const report of bundle_reports) {
      for (const dependency of report.dependencies) {
        const current = occurrences.get(dependency.name) || [];
        current.push({
          artifact: report.artifact,
          kind: dependency.kind,
          rendered_bytes: dependency.rendered_bytes,
        });
        occurrences.set(dependency.name, current);
      }
    }

    return [...occurrences.entries()]
      .filter(([, packages]) => packages.length > 1)
      .map(([dependency, packages]) => ({ dependency, packages, profile }))
      .sort((left, right) => left.dependency.localeCompare(right.dependency));
  }

  find_cross_artifact_duplicates(bundle_reports, load_profiles) {
    const reports_by_artifact = new Map(
      bundle_reports.map((report) => [report.artifact, report]),
    );
    const duplicates = [];
    for (const [profile, artifact_names] of Object.entries(load_profiles)) {
      const profile_reports = artifact_names.map((artifact_name) => {
        const report = reports_by_artifact.get(artifact_name);
        if (!report) {
          throw new Error(
            `Load profile ${profile} references unknown JS artifact: ${artifact_name}`,
          );
        }
        return report;
      });
      duplicates.push(
        ...this.find_profile_duplicates(profile, profile_reports),
      );
    }
    return duplicates;
  }

  run() {
    const manifest = this.load_release_manifest();
    const javascript_artifacts = manifest.files.filter((file) =>
      file.filename.endsWith(".js"),
    );
    const bundle_reports = javascript_artifacts.map((artifact) => {
      const report = this.load_bundle_report(
        artifact.package,
        artifact.analysis,
      );
      return {
        ...report,
        artifact: artifact.filename,
        artifact_bytes: artifact.bytes,
      };
    });
    const load_profiles = manifest.load_profiles || {
      default: javascript_artifacts.map((artifact) => artifact.filename),
    };
    const duplicates = this.find_cross_artifact_duplicates(
      bundle_reports,
      load_profiles,
    );
    const opaque_workspace_bundles =
      this.find_opaque_workspace_bundles(bundle_reports);
    const result = {
      version: this.root_package.version,
      ok: duplicates.length === 0 && opaque_workspace_bundles.length === 0,
      load_profiles,
      bundles: bundle_reports.map((report) => ({
        artifact: report.artifact,
        artifact_bytes: report.artifact_bytes,
        package_name: report.package_name,
        external_imports: report.external_imports,
        dependencies: report.dependencies.map((dependency) => ({
          kind: dependency.kind,
          name: dependency.name,
          module_count: dependency.modules.length,
          rendered_bytes: dependency.rendered_bytes,
        })),
      })),
      duplicates,
      opaque_workspace_bundles,
    };
    fs.writeFileSync(
      path.join(this.release_dir, "bundle-analysis.json"),
      `${JSON.stringify(result, null, 2)}\n`,
    );
    return result;
  }
}

class BuildAnalysisView {
  format_bytes(bytes) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }

  render(result) {
    console.log(`\nBundle dependency analysis (${result.version})`);
    for (const bundle of result.bundles) {
      const embedded = bundle.dependencies
        .filter((dependency) => dependency.name !== bundle.package_name)
        .map((dependency) => dependency.name)
        .join(", ");
      console.log(
        `- ${bundle.artifact}: ${this.format_bytes(bundle.artifact_bytes)}; embedded: ${embedded || "none"}`,
      );
    }

    if (result.duplicates.length > 0) {
      console.error("\nCross-artifact duplicate dependencies:");
      for (const duplicate of result.duplicates) {
        console.error(
          `- [${duplicate.profile}] ${duplicate.dependency}: ${duplicate.packages
            .map((item) => item.artifact)
            .join(", ")}`,
        );
      }
    }

    if (result.opaque_workspace_bundles.length > 0) {
      console.error("\nOpaque prebuilt workspace modules:");
      for (const violation of result.opaque_workspace_bundles) {
        console.error(
          `- ${violation.artifact}: ${violation.dependency} (${violation.modules.length} dist modules)`,
        );
      }
    }

    if (result.ok) {
      console.log(
        "Bundle dependency analysis passed: no duplicate dependencies.",
      );
    } else {
      console.error("Bundle dependency analysis failed.");
    }
  }
}

function main() {
  const model = new BuildAnalysisModel(path.resolve(__dirname, ".."));
  const view = new BuildAnalysisView();
  const result = model.run();
  view.render(result);
  if (!result.ok) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
