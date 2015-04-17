import _ from 'underscore';
import configuration from './configuration';
import escapeHTML from 'escape-html';
import IrcColorParser from './irc-color-parser';

const scrollbackLimit = configuration.get('scrollback-limit');
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
const youtubeRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

class Log {
  constructor(nick, text) {
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
    this.adjecent = false;
    this.media = null;
    this.textEl = this.processText(this.text);
  }

  processText(text) {
    text = escapeHTML(text);
    text = this.processNewline(text);
    text = this.processColor(text);
    text = this.processURL(text);
    return text;
  }

  processNewline(text) {
    return text.replace(/\n/g, '<br />');
  }

  processColor(text) {
    let parser = new IrcColorParser(text);
    return parser.process();
  }

  processURL(text) {
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

  isImageURL(url) {
    const imageExts = ['.jpg', '.jpeg', '.png'];
    let lowerCasedURL = url;
    return _.some(imageExts, function (ext) {
      return lowerCasedURL.substring(lowerCasedURL.length - ext.length) === ext;
    });
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

  giveMode(mode, by, to) {
    // FIXME
    let m = mode === 'o' ? 'op' : (mode === 'v' ? 'voice' : mode);
    let text = `${by} gives ${m} to ${to}.`;
    this._push(new Log(to, text));
  }

  takeMode(mode, by, to) {
    // FIXME
    let m = mode === 'o' ? 'op' : (mode === 'v' ? 'voice' : mode);
    let text = `${by} removes ${m} from ${to}.`;
    this._push(new Log(to, text));
  }

  map(func) {
    return this._logs.map(func);
  }
}
