import _ = require('underscore');
import configuration = require('./configuration');
import escapeHTML = require('escape-html');
import generateId = require('./id-generator');
import IrcColorParser = require('./irc-color-parser');

const scrollbackLimit = configuration.get('scrollback-limit');
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
const youtubeRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/g;

class Log {
  id: number;
  nick: string;
  text: string;
  datetime: Date;
  adjecent: boolean;
  media: MediaLog;
  textEl: string;

  constructor(nick: string, text: string) {
    this.id = generateId('log');
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

  static append(logs: Log[], newLog: Log): Log[] {
    if (logs.length === scrollbackLimit) {
      // remove the oldest log
      logs = _.tail(logs);
    }
    let lastLog = _.last(logs);
    if (lastLog &&
        lastLog.nick === newLog.nick &&
        newLog.datetime.getTime() - lastLog.datetime.getTime() < 20000) {
      newLog.adjecent = true;
    }
    return logs.concat(newLog);
  }

  static appendList(logs: Log[], newLogs: Log[]): Log[] {
    return newLogs.reduce(Log.append, logs);
  }

  static say(nick: string, text: string): Log {
    return new Log(nick, text);
  }

  static join(nick: string, message: IrcRawMessage): Log {
    // FIXME
    let text = `The user has joined. (${message.user}@${message.host})`;
    return new Log(nick, text);
  }

  static part(nick: string, reason: string, message: IrcRawMessage): Log {
    // FIXME
    reason = reason ? reason : 'no reason';
    let text = `The user has left. (${reason})`;
    return new Log(nick, text);
  }

  static updateName(oldNick: string, newNick: string): Log {
    // FIXME
    let text = `${oldNick} has changed the nickname.`;
    return new Log(newNick, text);
  }

  static giveMode(mode: string, by: string, to: string): Log {
    // FIXME
    let m = mode === 'o' ? 'op' : (mode === 'v' ? 'voice' : mode);
    let text = `${by} gives ${m} to ${to}.`;
    return new Log(to, text);
  }

  static takeMode(mode: string, by: string, to: string): Log {
    // FIXME
    let m = mode === 'o' ? 'op' : (mode === 'v' ? 'voice' : mode);
    let text = `${by} removes ${m} from ${to}.`;
    return new Log(to, text);
  }

  static whois(info: Dict<string>): Log[] {
    return _.keys(info).map(key => {
      return new Log(info['nick'], `${key}: ${info[key]}\n`);
    });
  }

  static kick(channel: string, nick: string, by: string, reason: string): Log {
    // FIXME
    let text = `${nick} has been kicked from ${channel} by ${by}. (${reason})`;
    return new Log(nick, text);
  }
}

export = Log;
