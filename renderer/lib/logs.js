// FIXME: should be setting
const scrollBackLimit = 1000;

class Log {
  constructor(nick, text) {
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
  }
}

export default class Logs {
  constructor() {
    this._logs = [];
  }

  append(nick, text) {
    if (this._logs.length === scrollBackLimit) {
      // pop the oldest log
      this._logs.shift();
    }
    this._logs.push(new Log(nick, text));
  }

  map(func) {
    return this._logs.map(func);
  }
}
