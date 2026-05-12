/**
 * Pipeline 完整数据模型 - 面向数据库存储与执行
 * 包含节点编排、执行配置、运行时状态
 */

/**
 * ========== 1. Pipeline 顶层结构 ==========
 */
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  version: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;

  // 触发器配置
  trigger: TriggerConfig;

  // 节点定义
  nodes: PipelineNode[];

  // 边/连接定义
  edges: PipelineEdge[];

  // 环境变量
  env?: Record<string, string>;

  // 执行配置
  execution?: ExecutionConfig;
}

/**
 * ========== 2. 触发器配置 ==========
 */
export type TriggerType = "manual" | "schedule" | "webhook" | "event";

export interface TriggerConfig {
  type: TriggerType;
  enabled?: boolean;

  // manual: 手动触发，无额外配置
  // schedule: 定时触发
  // webhook: Webhook 触发
  // event: 事件触发

  config?: Record<string, any>;
}

/**
 * ========== 3. PipelineNode 节点定义 ==========
 */
export interface PipelineNode {
  // 基础信息
  id: string;

  // 节点类型（对应具体的处理器）
  type: string;

  // 节点名称（用于显示）
  name: string;

  // 节点描述
  description?: string;

  // 位置（仅用于编辑器展示，可选）
  position?: { x: number; y: number };

  // 执行配置（类型定义）
  config: NodeConfig;

  // 输入定义（数据 schema）
  input: IOSchema;

  // 输出定义（数据 schema）
  output: IOSchema;

  // 执行选项
  options?: NodeOptions;

  // 错误处理策略
  errorHandling?: ErrorHandling;
}

export interface NodeConfig {
  // 处理器类型，用于查找对应的执行逻辑
  handler: string;

  // 处理器参数
  params: Record<string, any>;

  // 默认值
  defaults?: Record<string, any>;

  // 敏感字段（运行时解密）
  secrets?: string[];
}

/**
 * 输入/输出 schema 定义
 */
export interface IOSchema {
  // Schema 类型
  type: "object" | "array" | "string" | "number" | "boolean" | "any";

  // 字段定义
  properties?: Record<string, FieldSchema>;

  // 是否必须
  required?: string[];

  // 描述
  description?: string;
}

export interface FieldSchema {
  type: string;
  description?: string;
  default?: any;
  source?: string;
  enum?: any[];
  format?: string;
  items?: FieldSchema;
  properties?: Record<string, FieldSchema>;
}

/**
 * 节点执行选项
 */
export interface NodeOptions {
  // 超时时间（毫秒）
  timeout?: number;

  // 重试次数
  retries?: number;

  // 重试间隔
  retryDelay?: number;

  // 并行执行
  parallel?: boolean;
}

/**
 * 错误处理策略
 */
export interface ErrorHandling {
  // 错误时继续执行
  continueOnError?: boolean;

  // 错误时跳过后续节点
  skipOnError?: boolean;

  // 错误时执行替代节点
  fallbackNodeId?: string;

  // 错误通知
  notify?: {
    enabled: boolean;
    channels?: string[];
  };
}

/**
 * ========== 4. PipelineEdge 边/连接定义 ==========
 */
export interface PipelineEdge {
  id: string;

  // 源节点
  source: string;

  // 源 Handle
  sourceHandle?: string;

  // 目标节点
  target: string;

  // 目标 Handle
  targetHandle?: string;

  // 数据映射规则
  dataMapping?: DataMapping[];

  // 条件判断（用于条件分支）
  condition?: EdgeCondition;

  // 边的优先级
  priority?: number;
}

export interface DataMapping {
  // 源字段
  sourceField: string;

  // 目标字段
  targetField: string;

  // 转换函数（可选）
  transform?: string;
}

export interface EdgeCondition {
  // 条件类型
  type: "expression" | "status" | "value";

  // 条件表达式
  expression?: string;

  // 状态码判断
  status?: {
    operator: "eq" | "neq" | "in" | "gt" | "lt" | "gte" | "lte";
    value: any;
  };

  // 字段值判断
  field?: {
    path: string;
    operator: "eq" | "neq" | "in" | "gt" | "lt" | "exists" | "matches";
    value: any;
  };
}

/**
 * ========== 5. 执行配置 ==========
 */
export interface ExecutionConfig {
  // 最大并发数
  maxConcurrency?: number;

  // 全局超时
  globalTimeout?: number;

  // 日志级别
  logLevel?: "debug" | "info" | "warn" | "error";

  // 缓存策略
  cache?: {
    enabled: boolean;
    ttl?: number;
  };
}

/**
 * ========== 6. 运行时数据结构（执行时使用） ==========
 */
export interface PipelineExecution {
  id: string;

  pipelineId: string;
  pipelineVersion: number;

  // 触发信息
  trigger: {
    type: TriggerType;
    triggerTime: Date;
    triggerBy?: string;
    payload?: any;
  };

  // 执行状态
  status: "pending" | "running" | "completed" | "failed" | "cancelled";

  // 节点执行状态
  nodeResults: NodeExecution[];

  // 执行统计
  stats: {
    startTime: Date;
    endTime?: Date;
    duration?: number;
    totalNodes: number;
    completedNodes: number;
    failedNodes: number;
  };

  // 全局上下文（运行时数据）
  context: Record<string, any>;
}

export interface NodeExecution {
  nodeId: string;

  status: "pending" | "running" | "completed" | "failed" | "skipped";

  // 输入数据（经过映射后的）
  input: any;

  // 输出数据
  output?: any;

  // 错误信息
  error?: {
    message: string;
    stack?: string;
    retries?: number;
  };

  // 执行时间
  timing: {
    startTime?: Date;
    endTime?: Date;
    duration?: number;
  };

  // 重试记录
  retries: {
    attempt: number;
    history: Array<{
      timestamp: Date;
      error: string;
    }>;
  };
}

/**
 * ========== 7. 数据映射器 ==========
 */

/**
 * 从上下文提取数据，支持 {{nodeId.field}} 语法
 */
export function resolveDataPath(
  context: Record<string, any>,
  path: string,
): any {
  const match = path.match(/^\{\{([^}]+)\}\}$/);
  if (!match) return path;

  const [nodeId, ...fieldParts] = match[1].split(".");
  const nodeOutput = context[nodeId];
  if (!nodeOutput) return undefined;

  return fieldParts.reduce((obj, key) => obj?.[key], nodeOutput);
}

/**
 * 应用数据映射规则
 */
export function applyDataMapping(
  sourceData: any,
  mappings: DataMapping[],
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const mapping of mappings) {
    const value = mapping.transform
      ? resolveDataPath(sourceData, mapping.transform)
      : resolveDataPath(sourceData, mapping.sourceField);

    setNestedValue(result, mapping.targetField, value);
  }

  return result;
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split(".");
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * ========== 8. 节点执行器（示例） ==========
 */
export interface NodeHandler {
  type: string;
  execute(input: any, config: NodeConfig, context: any): Promise<any>;
  validate?(config: NodeConfig): boolean;
}

/**
 * 执行引擎接口
 */
export interface ExecutionEngine {
  // 执行 Pipeline
  execute(pipeline: Pipeline, trigger?: any): Promise<PipelineExecution>;

  // 停止执行
  stop(executionId: string): void;

  // 获取执行状态
  getExecution(executionId: string): PipelineExecution | null;
}

/**
 * ========== 9. 示例 Pipeline 定义 ==========
 */
export const examplePipeline: Pipeline = {
  id: "pipeline_page_crawler",
  name: "页面采集 Pipeline",
  description: "采集网页内容并提取资源",
  version: 1,
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),

  trigger: {
    type: "manual",
    enabled: true,
  },

  nodes: [
    {
      id: "trigger",
      type: "trigger.manual",
      name: "手动触发",
      description: "手动执行触发器",
      position: { x: 0, y: 200 },
      config: {
        handler: "trigger.manual",
        params: {},
      },
      input: { type: "any" },
      output: {
        type: "object",
        properties: {
          triggerTime: { type: "string", format: "datetime" },
          triggerBy: { type: "string", description: "触发人" },
        },
      },
    },
    {
      id: "input",
      type: "input.url",
      name: "输入 URL",
      description: "输入要采集的页面 URL",
      position: { x: 200, y: 200 },
      config: {
        handler: "input.url",
        params: {},
        defaults: { url: "" },
      },
      input: {
        type: "object",
        properties: {
          url: { type: "string", format: "url" },
        },
        required: ["url"],
      },
      output: {
        type: "object",
        properties: {
          url: { type: "string", format: "url" },
        },
      },
    },
    {
      id: "request",
      type: "http.request",
      name: "页面请求",
      description: "发送 HTTP 请求获取页面内容",
      position: { x: 400, y: 200 },
      config: {
        handler: "http.request",
        params: {
          method: "GET",
          timeout: 30000,
          headers: {
            "User-Agent": "Mozilla/5.0",
          },
        },
      },
      input: {
        type: "object",
        properties: {
          url: { type: "string", source: "{{input.url}}" },
        },
        required: ["url"],
      },
      output: {
        type: "object",
        properties: {
          status: { type: "number" },
          headers: { type: "object" },
          body: { type: "string" },
          responseTime: { type: "number" },
        },
      },
      errorHandling: {
        continueOnError: false,
        skipOnError: false,
        notify: {
          enabled: true,
          channels: ["error"],
        },
      },
    },
    {
      id: "parse",
      type: "html.parse",
      name: "响应解析",
      description: "解析 HTML 提取资源链接",
      position: { x: 620, y: 200 },
      config: {
        handler: "html.parse",
        params: {
          selectors: {
            images: "img[src]",
            stylesheets: 'link[rel="stylesheet"][href]',
            scripts: "script[src]",
          },
        },
      },
      input: {
        type: "object",
        properties: {
          html: { type: "string", source: "{{request.body}}" },
        },
        required: ["html"],
      },
      output: {
        type: "object",
        properties: {
          images: { type: "array", description: "图片 URL 列表" },
          stylesheets: { type: "array", description: "CSS URL 列表" },
          scripts: { type: "array", description: "JS URL 列表" },
        },
      },
    },
    {
      id: "img-extract",
      type: "parse.extract",
      name: "图片提取",
      description: "提取并处理图片 URL",
      position: { x: 840, y: 100 },
      config: {
        handler: "parse.extract",
        params: {
          field: "images",
          baseUrl: "{{input.url}}",
        },
      },
      input: {
        type: "object",
        properties: {
          images: { type: "array", source: "{{parse.images}}" },
        },
      },
      output: {
        type: "object",
        properties: {
          urls: { type: "array" },
          count: { type: "number" },
        },
      },
    },
    {
      id: "css-extract",
      type: "parse.extract",
      name: "CSS 提取",
      description: "提取并处理 CSS URL",
      position: { x: 840, y: 300 },
      config: {
        handler: "parse.extract",
        params: {
          field: "stylesheets",
          baseUrl: "{{input.url}}",
        },
      },
      input: {
        type: "object",
        properties: {
          stylesheets: { type: "array", source: "{{parse.stylesheets}}" },
        },
      },
      output: {
        type: "object",
        properties: {
          urls: { type: "array" },
          count: { type: "number" },
        },
      },
    },
    {
      id: "img-request",
      type: "http.batch",
      name: "图片请求",
      description: "批量请求下载图片",
      position: { x: 1060, y: 100 },
      config: {
        handler: "http.batch",
        params: {
          concurrency: 5,
          timeout: 10000,
          encoding: "base64",
        },
      },
      input: {
        type: "object",
        properties: {
          urls: { type: "array", source: "{{img-extract.urls}}" },
        },
        required: ["urls"],
      },
      output: {
        type: "object",
        properties: {
          results: {
            type: "array",
            properties: {
              originalUrl: { type: "string" },
              base64: { type: "string" },
              contentType: { type: "string" },
            },
          },
        },
      },
      options: {
        timeout: 60000,
        retries: 2,
      },
    },
    {
      id: "css-request",
      type: "http.batch",
      name: "CSS 请求",
      description: "批量请求下载 CSS",
      position: { x: 1060, y: 300 },
      config: {
        handler: "http.batch",
        params: {
          concurrency: 3,
          timeout: 10000,
        },
      },
      input: {
        type: "object",
        properties: {
          urls: { type: "array", source: "{{css-extract.urls}}" },
        },
        required: ["urls"],
      },
      output: {
        type: "object",
        properties: {
          results: {
            type: "array",
            properties: {
              originalUrl: { type: "string" },
              content: { type: "string" },
              contentType: { type: "string" },
            },
          },
        },
      },
    },
    {
      id: "merge",
      type: "transform.merge",
      name: "合并替换",
      description: "替换 HTML 中的资源为 base64",
      position: { x: 1280, y: 200 },
      config: {
        handler: "transform.merge",
        params: {
          strategies: {
            images: "base64",
            stylesheets: "inline",
          },
        },
      },
      input: {
        type: "object",
        properties: {
          html: { type: "string", source: "{{request.body}}" },
          images: { type: "array", source: "{{img-request.results}}" },
          stylesheets: { type: "array", source: "{{css-request.results}}" },
        },
        required: ["html"],
      },
      output: {
        type: "object",
        properties: {
          html: { type: "string", description: "处理后的 HTML" },
          stats: {
            type: "object",
            properties: {
              imagesReplaced: { type: "number" },
              stylesheetsInlined: { type: "number" },
            },
          },
        },
      },
    },
    {
      id: "save",
      type: "storage.save",
      name: "保存",
      description: "保存处理结果",
      position: { x: 1500, y: 200 },
      config: {
        handler: "storage.save",
        params: {
          target: "file",
          path: "/outputs/{{pipeline.id}}/{{timestamp}}.html",
        },
      },
      input: {
        type: "object",
        properties: {
          content: { type: "string", source: "{{merge.html}}" },
          filename: { type: "string" },
        },
        required: ["content"],
      },
      output: {
        type: "object",
        properties: {
          path: { type: "string" },
          size: { type: "number" },
          url: { type: "string" },
        },
      },
    },
  ],

  edges: [
    {
      id: "e-trigger-input",
      source: "trigger",
      target: "input",
    },
    {
      id: "e-input-request",
      source: "input",
      target: "request",
      dataMapping: [{ sourceField: "{{input.url}}", targetField: "url" }],
    },
    {
      id: "e-request-parse",
      source: "request",
      target: "parse",
      condition: {
        type: "status",
        status: { operator: "eq", value: 200 },
      },
    },
    {
      id: "e-parse-img",
      source: "parse",
      target: "img-extract",
    },
    {
      id: "e-parse-css",
      source: "parse",
      target: "css-extract",
    },
    {
      id: "e-img-extract-req",
      source: "img-extract",
      target: "img-request",
    },
    {
      id: "e-css-extract-req",
      source: "css-extract",
      target: "css-request",
    },
    {
      id: "e-img-req-merge",
      source: "img-request",
      target: "merge",
    },
    {
      id: "e-css-req-merge",
      source: "css-request",
      target: "merge",
    },
    {
      id: "e-merge-save",
      source: "merge",
      target: "save",
    },
  ],

  env: {
    USER_AGENT: "Mozilla/5.0 (compatible; Bot/1.0)",
  },

  execution: {
    maxConcurrency: 3,
    globalTimeout: 120000,
    logLevel: "info",
    cache: {
      enabled: true,
      ttl: 3600,
    },
  },
};
