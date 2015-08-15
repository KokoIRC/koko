import _ = require('underscore');
import configuration = require('./configuration');
import generateId = require('./id-generator');
import LogContent = require('../log-content');
import React = require('react');
import Topic = require('./topic');

const scrollbackLimit = configuration.get('app', 'scrollback-limit');

class Log {
  id: number;
  nick: string;
  text: string;
  datetime: Date;
  adjacent: boolean;
  textContent: string;
  htmlContent: string;
  sentByMe: boolean;
  includesUserNick: boolean;

  constructor(nick: string, text: string) {
    this.id = generateId('log');
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
    this.adjacent = false;
    let content = this.render(<LogContent userNick={Log.userNick} log={this} />);
    this.htmlContent = content.innerHTML;
    this.textContent = content.querySelector('.text').textContent;
    this.sentByMe = this.nick === Log.userNick;
    this.includesUserNick = this.textContent.includes(Log.userNick);
  }

  render(element: React.ReactElement<any>): HTMLDivElement {
    let tag = document.createElement('div');
    tag.innerHTML = React.renderToStaticMarkup(element);
    return tag.children[0] as HTMLDivElement;
  }

  static userNick: string;

  static setCurrentNick(nick: string) {
    Log.userNick = nick;
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
      newLog.adjacent = true;
    }
    return logs.concat(newLog);
  }

  static say(nick: string, text: string): Log {
    return new Log(nick, text);
  }

  static join(nick: string, message: IIrcRawMessage): Log {
    // FIXME
    let text = `The user has joined. (${message.user}@${message.host})`;
    return new Log(nick, text);
  }

  static part(nick: string, reason: string, message: IIrcRawMessage): Log {
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

  static whois(info: IDict<string>): Log {
    return new Log(info['nick'], _.keys(info).reduce((result, key) => {
      return result + `${key}: ${info[key]}\n`;
    }, ''));
  }

  static kick(channel: string, nick: string, by: string, reason: string): Log {
    // FIXME
    let text = `${nick} has been kicked from ${channel} by ${by}. (${reason})`;
    return new Log(nick, text);
  }

  static topic(channel: string, topic: Topic): Log {
    let text = `Topic: ${topic.fullText}`;
    return new Log(channel, text);
  }
}

export = Log;
