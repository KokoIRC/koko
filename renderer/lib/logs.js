// FIXME: should be setting
const scrollBackLimit = 1000;

class Log {
  constructor(nick, text) {
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
    this.adjecent = false;
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

  last() {
    return this._logs[this._logs.length - 1];
  }

  say(nick, text) {
    let log = new Log(nick, text);
    if (this.last() &&
        log.nick === this.last().nick &&
        log.datetime.getTime() - this.last().datetime.getTime() < 20000) {
      log.adjecent = true;
    }
    this._push(log);
  }

  join(nick, message) {
    // FIXME
    let text = `The user has joined. (${message.user}@${message.host})`;
    this._push(new Log(nick, text));
  }

  part(nick, reason, _) {
    // FIXME
    reason = reason ? reason : 'no reason';
    let text = `The user has left. (${reason})`;
    this._push(new Log(nick, text));
  }

  changeNick(oldNick, newNick) {
    // FIXME
    let text = `${oldNick} has changed the nickname.`;
    this._push(new Log(newNick, text));
  }

  map(func) {
    return this._logs.map(func);
  }
}
