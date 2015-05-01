import _ = require('underscore');
import configuration = require('./configuration');
import generateId = require('./id-generator');
import LogContent = require('../log-content');
import React = require('react');
import Topic = require('./topic');

const scrollbackLimit = configuration.get('scrollback-limit');

class Log {
  id: number;
  nick: string;
  text: string;
  datetime: Date;
  adjecent: boolean;
  content: React.ReactElement<any>;

  constructor(nick: string, text: string) {
    this.id = generateId('log');
    this.nick = nick;
    this.text = text;
    this.datetime = new Date();
    this.adjecent = false;
    this.content = LogContent({text});
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

  static topic(channel: string, topic: Topic): Log {
    let text = `Topic: ${topic.fullText}`;
    return new Log(channel, text);
  }
}

export = Log;
