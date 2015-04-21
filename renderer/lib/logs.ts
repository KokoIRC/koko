import _ = require('underscore');
import configuration = require('./configuration');
import escapeHTML = require('escape-html');
import IrcColorParser = require('./irc-color-parser');

const scrollbackLimit = configuration.get('scrollback-limit');
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
const youtubeRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

export class Log {
  nick: string;
  text: string;
  datetime: Date;
  adjecent: boolean;
  media: MediaLog;
  textEl: string;

  constructor(nick: string, text: string) {
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
    this.adjecent = false;
    this.media = null;
    this.textEl = this.processText(this.text);
  }

  processText(text: string): string {
    text = escapeHTML(text);
    text = this.processNewline(text);
    text = this.processColor(text);
    text = this.processURL(text);
    return text;
  }

  processNewline(text: string): string {
    return text.replace(/\n/g, '<br />');
  }

  processColor(text: string): string {
    let parser = new IrcColorParser(text);
    return parser.process();
  }

  processURL(text: string): string {
    let match;
    let result = text;
    while (match = urlRegex.exec(text)) {
      let url = match[0];
      let newContent = `<a href='${url}' target='_blank'>${url}</a>`;
      if (this.isImageURL(url)) {
        this.media = { type: 'image', url };
      } else if (match = youtubeRegex.exec(url)) {
        let uuid = match[1];
        this.media = { type: 'youtube', uuid };
      }
      result = result.replace(url, newContent);
    }
    return result;
  }

  isImageURL(url: string): boolean {
    const imageExts = ['.jpg', '.jpeg', '.png'];
    let lowerCasedURL = url;
    return _.some(imageExts, function (ext) {
      return lowerCasedURL.substring(lowerCasedURL.length - ext.length) === ext;
    });
  }
}

export class Logs {
  private _logs: Log[];

  constructor() {
    this._logs = [];
  }

  _push(newEl: Log) {
    if (this._logs.length === scrollbackLimit) {
      // pop the oldest log
      this._logs.shift();
    }
    if (this.last() &&
        newEl.nick === this.last().nick &&
        newEl.datetime.getTime() - this.last().datetime.getTime() < 20000) {
      newEl.adjecent = true;
    }
    this._logs.push(newEl);
  }

  last(): Log {
    return this._logs[this._logs.length - 1];
  }

  say(nick: string, text: string) {
    this._push(new Log(nick, text));
  }

  join(nick: string, message: IrcRawMessage) {
    // FIXME
    let text = `The user has joined. (${message.user}@${message.host})`;
    this._push(new Log(nick, text));
  }

  part(nick: string, reason: string, message: IrcRawMessage) {
    // FIXME
    reason = reason ? reason : 'no reason';
    let text = `The user has left. (${reason})`;
    this._push(new Log(nick, text));
  }

  changeNick(oldNick: string, newNick: string) {
    // FIXME
    let text = `${oldNick} has changed the nickname.`;
    this._push(new Log(newNick, text));
  }

  giveMode(mode: string, by: string, to: string) {
    // FIXME
    let m = mode === 'o' ? 'op' : (mode === 'v' ? 'voice' : mode);
    let text = `${by} gives ${m} to ${to}.`;
    this._push(new Log(to, text));
  }

  takeMode(mode: string, by: string, to: string) {
    // FIXME
    let m = mode === 'o' ? 'op' : (mode === 'v' ? 'voice' : mode);
    let text = `${by} removes ${m} from ${to}.`;
    this._push(new Log(to, text));
  }

  whois(info: Dict<string>) {
    // FIXME
    for (let key in info) {
      this._push(new Log(info['nick'], `${key}: ${info[key]}\n`));
    }
  }

  map<T>(func: (log: Log) => T) {
    return this._logs.map<T>(func);
  }
}
