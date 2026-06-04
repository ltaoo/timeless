package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

var storageDir = "registry-data"

func main() {
	port := ":4873"
	if p := os.Getenv("PORT"); p != "" {
		port = ":" + p
	}
	if d := os.Getenv("STORAGE_DIR"); d != "" {
		storageDir = d
	}

	http.HandleFunc("/", route)

	log.Printf("npm registry listening on %s (storage: %s)", port, storageDir)
	log.Fatal(http.ListenAndServe(port, nil))
}

func route(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	switch r.Method {
	case http.MethodGet:
		// GET /@scope%2Fname/-/filename.tgz  → download tarball
		// GET /@scope%2Fname                  → get metadata
		// GET /name/-/filename.tgz            → download tarball (unscoped)
		// GET /name                           → get metadata (unscoped)
		if pkg, filename, ok := parseTarballPath(path); ok {
			handleDownloadTarball(w, r, pkg, filename)
		} else if pkg, ok := parsePackagePath(path); ok {
			handleGetMetadata(w, r, pkg)
		} else {
			http.NotFound(w, r)
		}

	case http.MethodPut:
		// PUT /@scope%2Fname → publish
		if pkg, ok := parsePackagePath(path); ok {
			handlePublish(w, r, pkg)
		} else {
			http.NotFound(w, r)
		}

	default:
		http.NotFound(w, r)
	}
}

// parsePackagePath extracts a package name from paths like "/@scope%2Fname" or "/name".
func parsePackagePath(path string) (string, bool) {
	decoded, err := url.PathUnescape(path)
	if err != nil {
		return "", false
	}
	decoded = strings.TrimPrefix(decoded, "/")
	if decoded == "" {
		return "", false
	}
	// Scoped: @scope/name (exactly one slash after @)
	if strings.HasPrefix(decoded, "@") {
		parts := strings.SplitN(decoded, "/", 3)
		if len(parts) == 2 {
			return decoded, true
		}
		return "", false
	}
	// Unscoped: just a name with no slashes
	if !strings.Contains(decoded, "/") {
		return decoded, true
	}
	return "", false
}

// parseTarballPath extracts package name and filename from paths like "/@scope%2Fname/-/file.tgz".
func parseTarballPath(path string) (string, string, bool) {
	decoded, err := url.PathUnescape(path)
	if err != nil {
		return "", "", false
	}
	decoded = strings.TrimPrefix(decoded, "/")

	// Find the "/-/" separator
	idx := strings.Index(decoded, "/-/")
	if idx < 0 {
		return "", "", false
	}
	pkg := decoded[:idx]
	filename := decoded[idx+3:]
	if pkg == "" || filename == "" {
		return "", "", false
	}
	return pkg, filename, true
}

// pkgStorageDir returns the filesystem directory for a package.
// e.g. "@timeless/types" → "<storageDir>/@timeless/types/"
func pkgStorageDir(pkg string) string {
	return filepath.Join(storageDir, pkg)
}

// handlePublish handles PUT /<package> from npm publish.
func handlePublish(w http.ResponseWriter, r *http.Request, pkg string) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}

	var payload struct {
		Name     string                            `json:"name"`
		Versions map[string]json.RawMessage        `json:"versions"`
		Attachments map[string]struct {
			Data string `json:"data"`
		} `json:"_attachments"`
		DistTags map[string]string `json:"dist-tags"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		http.Error(w, "invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if payload.Name != pkg {
		http.Error(w, fmt.Sprintf("package name mismatch: URL=%q body=%q", pkg, payload.Name), http.StatusBadRequest)
		return
	}

	dir := pkgStorageDir(pkg)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		http.Error(w, "failed to create storage dir", http.StatusInternalServerError)
		return
	}

	// Save tarball attachments
	for filename, att := range payload.Attachments {
		data, err := base64.StdEncoding.DecodeString(att.Data)
		if err != nil {
			http.Error(w, "failed to decode attachment: "+err.Error(), http.StatusBadRequest)
			return
		}
		tarballPath := filepath.Join(dir, filepath.Base(filename))
		if err := os.WriteFile(tarballPath, data, 0o644); err != nil {
			http.Error(w, "failed to write tarball", http.StatusInternalServerError)
			return
		}
		log.Printf("saved tarball: %s (%d bytes)", tarballPath, len(data))
	}

	// Merge version metadata into metadata.json
	metaPath := filepath.Join(dir, "metadata.json")
	existing := loadMetadata(metaPath)

	if existing["versions"] == nil {
		existing["versions"] = map[string]interface{}{}
	}
	versions := existing["versions"].(map[string]interface{})

	// Determine the registry URL base for tarball URLs
	host := r.Host
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	if fh := r.Header.Get("X-Forwarded-Proto"); fh != "" {
		scheme = fh
	}
	baseURL := fmt.Sprintf("%s://%s", scheme, host)

	for ver, raw := range payload.Versions {
		var versionMeta map[string]interface{}
		if err := json.Unmarshal(raw, &versionMeta); err != nil {
			continue
		}
		// Ensure dist.tarball points to our registry
		shortName := pkg
		if i := strings.LastIndex(pkg, "/"); i >= 0 {
			shortName = pkg[i+1:]
		}
		tarballFilename := fmt.Sprintf("%s-%s.tgz", shortName, ver)
		tarballURL := fmt.Sprintf("%s/%s/-/%s", baseURL, pkg, tarballFilename)

		dist, ok := versionMeta["dist"].(map[string]interface{})
		if !ok {
			dist = map[string]interface{}{}
		}
		dist["tarball"] = tarballURL
		versionMeta["dist"] = dist

		versions[ver] = versionMeta
	}

	existing["name"] = pkg
	existing["versions"] = versions

	// Merge dist-tags
	if existing["dist-tags"] == nil {
		existing["dist-tags"] = map[string]interface{}{}
	}
	distTags := existing["dist-tags"].(map[string]interface{})
	for tag, ver := range payload.DistTags {
		distTags[tag] = ver
	}
	existing["dist-tags"] = distTags

	if err := saveMetadata(metaPath, existing); err != nil {
		http.Error(w, "failed to save metadata", http.StatusInternalServerError)
		return
	}

	log.Printf("published %s (versions: %v)", pkg, keys(payload.Versions))
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"ok": "package published"})
}

// handleGetMetadata handles GET /<package> for npm install.
func handleGetMetadata(w http.ResponseWriter, r *http.Request, pkg string) {
	metaPath := filepath.Join(pkgStorageDir(pkg), "metadata.json")
	data, err := os.ReadFile(metaPath)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// handleDownloadTarball handles GET /<package>/-/<filename> for npm install.
func handleDownloadTarball(w http.ResponseWriter, r *http.Request, pkg, filename string) {
	tarballPath := filepath.Join(pkgStorageDir(pkg), filepath.Base(filename))
	data, err := os.ReadFile(tarballPath)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Write(data)
}

func loadMetadata(path string) map[string]interface{} {
	data, err := os.ReadFile(path)
	if err != nil {
		return map[string]interface{}{}
	}
	var meta map[string]interface{}
	if err := json.Unmarshal(data, &meta); err != nil {
		return map[string]interface{}{}
	}
	return meta
}

func saveMetadata(path string, meta map[string]interface{}) error {
	data, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0o644)
}

func keys[K comparable, V any](m map[K]V) []K {
	result := make([]K, 0, len(m))
	for k := range m {
		result = append(result, k)
	}
	return result
}
