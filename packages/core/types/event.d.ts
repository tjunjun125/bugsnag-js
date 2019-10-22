import Breadcrumb from "./breadcrumb";

declare class Event {
  public static getStacktrace(
    error: any,
    errorFramesToSkip?: number,
    generatedFramesToSkip?: number,
  ): IStackframe[];

  public app: IApp;
  public device: IDevice;
  public request: IRequest;

  public errors: IError[];
  public breadcrumbs: Breadcrumb[];

  public severity: "info" | "warning" | "error";

  public readonly originalError: any;

  public apiKey?: string;
  public context?: string;
  public groupingHash?: string;

  // user
  public getUser(): { id?: string, name?: string, email?: string };
  public setUser(id: string, name?: string, email?: string): void;
  public clearUser(): void;

  // metadata
  public addMetadata(section: string, values: { [key: string]: any }): void;
  public addMetadata(section: string, key: string, value: any): void;
  public getMetadata(section: string, key?: string): any;
  public clearMetadata(section: string, key?: string): void;
}

interface IHandledState {
  severity: string;
  unhandled: boolean;
  severityReason: {
    type: string;
    [key: string]: any;
  };
}

interface IStackframe {
  file: string;
  method?: string;
  lineNumber?: number;
  columnNumber?: number;
  code?: object;
  inProject?: boolean;
}

interface IError {
  class: string;
  message: string;
  stacktrace: IStackframe[];
}

interface IDevice {
  runtimeVersions: {
    [key: string]: any;
  };
  [key: string]: any;
}

interface IApp {
  version?: string;
  releaseStage?: string;
  type?: string;
  [key: string]: any;
}

interface IRequest {
  url?: string;
  [key: string]: any;
}

export default Event;
