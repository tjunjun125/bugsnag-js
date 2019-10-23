import { ErrorHandler, Injectable } from "@angular/core";
import { Client, Event, AbstractTypes } from "@bugsnag/js";

@Injectable()
export class BugsnagErrorHandler extends ErrorHandler {
  public bugsnagClient: Client;
  constructor(bugsnagClient: Client) {
    super();
    this.bugsnagClient = bugsnagClient;
  }

  public handleError(error: any): void {
    const handledState = {
      severity: "error",
      severityReason: { type: "unhandledException" },
      unhandled: true,
    };

    const event: Event = new (this.bugsnagClient.Event as any)(
      error.name,
      error.message,
      this.bugsnagClient.Event.getStacktrace(error),
      error,
      handledState,
    );

    (this.bugsnagClient as any)._notify(event, (event: Event) => {
      if (error.ngDebugContext) {
        event.addMetadata("angular", {
          component: error.ngDebugContext.component,
          context: error.ngDebugContext.context,
        });
      }
    });

    ErrorHandler.prototype.handleError.call(this, error);
  }
}

const plugin: AbstractTypes.Plugin = {
  init: (client: Client): ErrorHandler => {
    return new BugsnagErrorHandler(client);
  },
  name: "Angular",
};

export default plugin;
