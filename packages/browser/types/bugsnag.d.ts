import { Client, Breadcrumb, Event, Session, AbstractTypes } from "@bugsnag/core";

// overwrite config interface, adding browser-specific options
declare module "@bugsnag/core" {
  interface Config {
    apiKey: string;
    appVersion?: string;
    appType?: string;
    autoDetectErrors?: boolean;
    autoDetectUnhandledRejections?: boolean;
    onError?: AbstractTypes.OnErrorCallback | AbstractTypes.OnErrorCallback[];
    endpoints?: { notify: string; sessions?: string };
    autoTrackSessions?: boolean;
    enabledReleaseStages?: string[];
    releaseStage?: string;
    maxBreadcrumbs?: number;
    enabledBreadcrumbTypes?: AbstractTypes.BreadcrumbType[];
    user?: { id?: string; name?: string; email?: string } | null;
    metadata?: object | null;
    logger?: AbstractTypes.Logger | null;
    redactedKeys?: Array<string | RegExp>;
    // catch-all for any missing options
    [key: string]: any;
    // options for all bundled browser plugins
    maxEvents?: number;
    collectUserIp?: boolean;
  }
}

declare const Bugsnag: BugsnagStatic;

interface BugsnagStatic {
  init(apiKeyOrOpts: string | AbstractTypes.Config): void;

  createClient(apiKeyOrOpts: string | AbstractTypes.Config): Client;

  // reporting errors
  notify(
    error: AbstractTypes.NotifiableError,
    onError?: AbstractTypes.OnErrorCallback,
    cb?: (err: any, event: Event) => void,
  ): void;

  // breadcrumbs
  leaveBreadcrumb(message: string, metadata?: any, type?: string, timestamp?: string): Client;

  // metadata
  addMetadata(section: string, values: { [key: string]: any }): void;
  addMetadata(section: string, key: string, value: any): void;
  getMetadata(section: string, key?: string): any;
  clearMetadata(section: string, key?: string): void;

  // context
  getContext(): string | undefined;
  setContext(c: string): void;

  // user
  getUser(): { id?: string; name?: string; email?: string };
  setUser(id: string, name?: string, email?: string): void;
  clearUser(): void;

  // reporting sesions
  startSession(): Client;
  pauseSession(): void;
  resumeSession(): boolean;

  // callbacks
  addOnError(fn: AbstractTypes.OnErrorCallback): void;
  removeOnError(fn: AbstractTypes.OnErrorCallback): void;

  addOnSession(fn: AbstractTypes.OnSessionCallback): void;
  removeOnSession(fn: AbstractTypes.OnSessionCallback): void;

  addOnBreadcrumb(fn: AbstractTypes.OnBreadcrumbCallback): void;
  removeOnBreadcrumb(fn: AbstractTypes.OnBreadcrumbCallback): void;

  // plugins
  use(plugin: AbstractTypes.Plugin, ...args: any[]): Client;
  getPlugin(name: string): any;
}

export default Bugsnag;
export { Client, Breadcrumb, Event, Session, AbstractTypes };
