import Breadcrumb from "./breadcrumb";
import Client from "./client";
import Event from "./event";
import Session from "./session";

export interface IConfig {
  apiKey: string;
  onError?: OnErrorCallback | OnErrorCallback[];
  autoDetectErrors?: boolean;
  autoDetectUnhandledRejections?: boolean;
  appVersion?: string;
  appType?: string;
  endpoints?: { notify: string, sessions?: string };
  autoTrackSessions?: boolean;
  enabledReleaseStages?: string[];
  releaseStage?: string;
  maxBreadcrumbs?: number;
  user?: { id?: string, name?: string, email?: string } | null;
  metadata?: object | null;
  logger?: ILogger | null;
  redactedKeys?: Array<string | RegExp>;
  [key: string]: any;
}

export type OnErrorCallback = (event: Event, cb?: (err: null | Error) => void) => void | Promise<void> | boolean;
export type OnSessionCallback = (session: Session) => void | boolean;
export type OnBreadcrumbCallback = (breadcrumb: Breadcrumb) => void | boolean;

export interface IPlugin {
  name?: string;
  init: (client: Client) => any;
  configSchema?: IConfigSchema;
  destroy?(): void;
}

export interface IConfigSchemaEntry {
  message: string;
  validate: (val: any) => boolean;
  defaultValue: () => any;
}

export interface IConfigSchema {
  [key: string]: IConfigSchemaEntry;
}

export interface ILogger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export type NotifiableError = Error
  | { errorClass: string; errorMessage: string; }
  | { name: string; message: string; }
  | any;
