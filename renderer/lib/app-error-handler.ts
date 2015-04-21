interface AppErrorCallback {
  (error: Error): void;
}

interface AppErrorCallbacks {
  [type: string]: AppErrorCallback;
}

class AppErrorHandler {
  private _handlers: AppErrorCallbacks;

  constructor() {
    this._handlers = {};
  }

  on(type: string, handler: AppErrorCallback) {
    this._handlers[type] = handler;
  }

  emit(type: string, data: Error) {
    let handler = this._handlers[type];
    if (handler) {
      setTimeout(handler.bind(null, data), 0);
    }
  }

  handle(data: {type: string, error: Error}) {
    // FIXME
    console.error(JSON.stringify(data.error));
    this.emit(data.type, data.error);
  }
}

export = AppErrorHandler;
