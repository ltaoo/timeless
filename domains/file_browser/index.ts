/**
 * @todo 如果删除当前选中的文件夹，子文件夹在视图上也要同步移除
 */
import { base, BaseDomain, Handler } from "@/domains/base";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { RequestPayload } from "@/domains/request/utils";
import { ScrollViewCore } from "@/domains/ui";
import { BizError } from "@/domains/error";
import { HttpClientCore } from "@/domains/http_client";

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
  client: HttpClientCore;
  onError?: (err: BizError) => void;
}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ...state });
    },
    createColumn(folder: BizFile) {
      const list$ = new ListCore(
        new RequestCore(props.service, {
          client: props.client,
          onFailed: (error) => {
            bus.emit(Events.Error, new BizError([error.message]));
          },
        }),
        {
          pageSize: 50,
          search: {
            ...(props.extra || {}),
            ...folder,
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
        }
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
      _columns.push(methods.createColumn(folder));
      bus.emit(Events.FoldersChange, [..._columns]);
    },
    replaceColumn(folder: BizFile, index: number) {
      _columns = [
        ..._columns.slice(0, index + 1),
        methods.createColumn(folder),
      ];
      bus.emit(Events.FoldersChange, [..._columns]);
    },
    clearFolderColumns() {
      _columns = [];
      bus.emit(Events.FoldersChange, [..._columns]);
    },
    /** 选中文件/文件夹 */
    select(folder: BizFile, index: [number, number]) {
      _selectedFolder = folder;
      bus.emit(Events.SelectFolder, [folder, index]);
      const [x, y] = index;
      const column = _columns[x];
      // column.list.modifyItem((f) => {
      //   if (f.id !== folder.id) {
      //     return f;
      //   }
      //   return {
      //     ...f,
      //     selected: true,
      //     hover: false,
      //   };
      // });
      const selectedFolder = column.list.response.dataSource[y];
      if (folder.type === BizFileType.File) {
        // @todo 获取文件详情
        return;
      }
      (() => {
        if (x < _columns.length - 1) {
          methods.replaceColumn(folder, x);
          return;
        }
        methods.appendColumn(selectedFolder);
      })();
      _paths = (() => {
        if (_paths[x + 1]) {
          const clone = _paths.slice(0, x + 2);
          clone[x + 1] = folder;
          return clone;
        }
        return _paths.concat(selectedFolder);
      })();
      bus.emit(Events.PathsChange, [..._paths]);
    },
    virtualSelect(folder: BizFile, position: [number, number]) {
      _virtualSelectedFolder = [folder, position];
      bus.emit(Events.SelectFolder, [folder, position]);
      const [x, y] = position;
      const column = _columns[x];
      _tmpSelectedColumn = column;
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
  let _columns: FileColumn[] = [];

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
    get columns() {
      return _columns;
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
    [Events.PathsChange]: BizFile[];
    [Events.SelectFolder]: [BizFile, [number, number]];
    [Events.LoadingChange]: boolean;
    [Events.StateChange]: typeof state;
    [Events.Error]: BizError;
  };

  const bus = base<TheTypesOfEvents>();

  return {
    methods,
    state,
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

export type FileBrowserModel = ReturnType<typeof FileBrowserModel>;
