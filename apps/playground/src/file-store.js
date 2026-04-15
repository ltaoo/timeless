const DEFAULT_FILES = {
  "app.js": `import { greeting } from '/__playground__/utils.js';

export default View({ class: "p-4 text-lg" }, [greeting]);`,
  "utils.js": `export const greeting = "hello";`,
};

export function FileStore() {
  const files_ = ref(new Map(Object.entries(DEFAULT_FILES)));
  const activeFile_ = ref("app.js");

  const fileList_ = computed(files_, (m) => [...m.keys()]);

  function getCode(name) {
    return files_.value.get(name) ?? "";
  }

  function setCode(name, code) {
    const next = new Map(files_.value);
    next.set(name, code);
    files_.as(next);
  }

  function addFile(name) {
    if (files_.value.has(name)) return false;
    const next = new Map(files_.value);
    next.set(name, "");
    files_.as(next);
    activeFile_.as(name);
    return true;
  }

  function deleteFile(name) {
    if (name === "app.js") return false;
    if (!files_.value.has(name)) return false;
    const next = new Map(files_.value);
    next.delete(name);
    files_.as(next);
    if (activeFile_.value === name) {
      activeFile_.as("app.js");
    }
    return true;
  }

  function getFilesObject() {
    return Object.fromEntries(files_.value);
  }

  return {
    files_,
    activeFile_,
    fileList_,
    getCode,
    setCode,
    addFile,
    deleteFile,
    getFilesObject,
  };
}
