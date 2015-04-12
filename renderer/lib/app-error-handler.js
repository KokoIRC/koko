export default class AppErrorHandler {
  constructor() {
    this._handlers = {};
  }

  on(type, handler) {
    this._handlers[type] = handler;
  }

  emit(type, data) {
    let handler = this._handlers[type];
    if (handler) {
      setTimeout(handler.bind(null, data), 0);
    }
  }

  handle(data) {
    // FIXME
    console.error(JSON.stringify(data.error));
    this.emit(data.type, data.error);
  }
}
