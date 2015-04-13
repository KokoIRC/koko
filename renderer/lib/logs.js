import configuration from './configuration';
import escapeHTML from 'escape-html';
import IrcColorParser from './irc-color-parser';

const scrollbackLimit = configuration.get('scrollback-limit');

class Log {
  constructor(nick, text) {
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
    this.adjecent = false;
    this.textEl = this.processText(this.text);
  }

  processText(text) {
    text = escapeHTML(text);
    text = this.processNewline(text);
    text = this.processColor(text);
    return text;
  }

  processNewline(text) {
    return text.replace(/\n/g, '<br />');
  }

  processColor(text) {
    let parser = new IrcColorParser(text);
    return parser.process();
  }
}

export default class Logs {
  constructor() {
    this._logs = [];
  }

  _push(newEl) {
    if (this._logs.length === scrollbackLimit) {
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
