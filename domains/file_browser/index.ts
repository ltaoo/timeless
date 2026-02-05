/**
 * @todo 如果删除当前选中的文件夹，子文件夹在视图上也要同步移除
 */
import { base, BaseDomain, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { RequestPayload } from "@/domains/request/utils";
import { ScrollViewCore } from "@/domains/ui";
import { BizError } from "@/domains/error";

export type BizFile = {
  id: string;
  filepath: string;
  filename: string;
  type: BizFileType;
};
export enum BizFileType {
  File = 1,
  Folder = 2,
}
export type BizFileFetchService = (...args: any[]) => RequestPayload<BizFile[]>;
type FileColumn = {
  list: ListCore<RequestCore<BizFileFetchService, any>>;
  view: ScrollViewCore;
};

export function FileBrowserModel(props: {
  paths?: BizFile[];
  service: BizFileFetchService;
  /** 调用接口时的额外参数 */
  extra?: Record<string, unknown>;
  onError?: (err: BizError) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ...state });
    },
    createColumn(folder: BizFile) {
      const list$ = new ListCore(
        new RequestCore(props.service, {
          onFailed: (error) => {
            bus.emit(Events.Error, new BizError([error.message]));
          },
        }),
        {
          pageSize: 50,
          search: {
            ...(props.extra || {}),
            id: folder.id,
          },
        },
      );
      list$.onStateChange((response) => {
        if (response.error) {
          //   this.emit(Events.Error, new BizError(response.error.message));
          bus.emit(Events.Error, new BizError([response.error.message]));
          return;
        }
        if (response.initial === false) {
          _initialized = true;
          methods.refresh();
        }
        bus.emit(Events.FoldersChange, [..._folderColumns]);
      });
      list$.onLoadingChange((loading) => {
        _loading = loading;
        bus.emit(Events.LoadingChange, loading);
      });
      const scrollView = new ScrollViewCore({
        async onReachBottom() {
          await list$.loadMore();
          scrollView.finishLoadingMore();
        },
      });
      list$.init();
      const column = {
        list: list$,
        view: scrollView,
      } as FileColumn;
      return column;
    },
    appendColumn(folder: BizFile) {
      _folderColumns.push(methods.createColumn(folder));
      bus.emit(Events.FoldersChange, [..._folderColumns]);
    },
    replaceColumn(folder: BizFile, index: number) {
      _folderColumns = [
        ..._folderColumns.slice(0, index + 1),
        methods.createColumn(folder),
      ];
      bus.emit(Events.FoldersChange, [..._folderColumns]);
    },
    clearFolderColumns() {
      _folderColumns = [];
      bus.emit(Events.FoldersChange, [..._folderColumns]);
    },
    /** 选中文件/文件夹 */
    select(folder: BizFile, index: [number, number]) {
      _selectedFolder = folder;
      bus.emit(Events.SelectFolder, [folder, index]);
      const [x, y] = index;
      const column = _folderColumns[x];
      column.list.modifyItem((f) => {
        return {
          ...f,
          selected: f.id === folder.id,
          hover: false,
        };
      });
      const selectedFolder = column.list.response.dataSource[y];
      if (folder.type === BizFileType.File) {
        // @todo 获取文件详情
        return;
      }
      (() => {
        if (x < this.folderColumns.length - 1) {
          methods.replaceColumn(folder, x);
          return;
        }
        methods.appendColumn(selectedFolder);
      })();
      this.paths = (() => {
        if (this.paths[x + 1]) {
          const clone = this.paths.slice(0, x + 2);
          clone[x + 1] = folder;
          return clone;
        }
        return this.paths.concat(selectedFolder);
      })();
      this.emit(Events.PathsChange, [...this.paths]);
    },
    virtualSelect(folder: BizFile, position: [number, number]) {
      this.virtualSelectedFolder = [folder, position];
      bus.emit(Events.SelectFolder, [folder, position]);
      const [x, y] = position;
      const column = _folderColumns[x];
      this.tmpSelectedColumn = column;
      column.list.modifyItem((f) => {
        return {
          ...f,
          hover: f.id === folder.id,
        };
      });
    },
    clear() {
      _selectedFolder = null;
    },
    clearVirtualSelected() {
      _virtualSelectedFolder = null;
      if (!_tmpSelectedColumn) {
        return;
      }
      const column = _tmpSelectedColumn;
      _tmpSelectedColumn = null;
      column.list.modifyItem((f) => {
        return {
          ...f,
          hover: false,
        };
      });
    },
  };

  let _loading = false;
  let _initialized = false;
  let _selectedFolder: BizFile | null = null;
  let _virtualSelectedFolder: [BizFile, [number, number]] | null = null;
  let _tmpSelectedColumn: FileColumn | null = null;
  let _paths: BizFile[] = props.paths || [
    {
      id: "root",
      type: BizFileType.Folder,
      filename: "文件",
      filepath: "/",
    },
  ];
  /** 文件夹列表 */
  let _folderColumns: FileColumn[] = [];

  const state = {
    get loading() {
      return _loading;
    },
    get initialized() {
      return _initialized;
    },
    get curFolder() {
      return _selectedFolder;
    },
    get paths() {
      return _paths;
    },
    //   tmpHoverFile: [F, [number, number]] | null;
  };

  enum Events {
    Initialized,
    FoldersChange,
    PathsChange,
    SelectFolder,
    LoadingChange,
    StateChange,
    Error,
  }
  type TheTypesOfEvents = {
    [Events.Initialized]: void;
    [Events.FoldersChange]: FileColumn[];
    [Events.PathsChange]: { file_id: string; name: string }[];
    [Events.SelectFolder]: [BizFile, [number, number]];
    [Events.LoadingChange]: boolean;
    [Events.StateChange]: typeof state;
    [Events.Error]: BizError;
  };

  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    onFolderColumnChange(
      handler: Handler<TheTypesOfEvents[Events.FoldersChange]>,
    ) {
      return bus.on(Events.FoldersChange, handler);
    },
    onPathsChange(handler: Handler<TheTypesOfEvents[Events.PathsChange]>) {
      return bus.on(Events.PathsChange, handler);
    },
    onSelectFolder(handler: Handler<TheTypesOfEvents[Events.SelectFolder]>) {
      return bus.on(Events.SelectFolder, handler);
    },
    onLoadingChange(handler: Handler<TheTypesOfEvents[Events.LoadingChange]>) {
      return bus.on(Events.LoadingChange, handler);
    },
    onError(handler: Handler<TheTypesOfEvents[Events.Error]>) {
      return bus.on(Events.Error, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
