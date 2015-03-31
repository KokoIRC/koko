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

  _push(newEl) {
    if (this._logs.length === scrollBackLimit) {
      // pop the oldest log
      this._logs.shift();
    }
    this._logs.push(newEl);
  }

  say(nick, text) {
    this._push(new Log(nick, text));
  }

  join(nick, message) {
    // FIXME
    message = `The user has joined. (${message.user}@${message.host})`
    this._push(new Log(nick, message));
  }

  map(func) {
    return this._logs.map(func);
  }
}
