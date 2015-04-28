import _ = require('underscore');
import generateId = require('./id-generator');
import Log = require('./log');
import Name = require('./name');
import Topic = require('./topic');

class Channel {
  id: number;
  current: boolean;
  logs: Log[];
  name: string;
  names: Name[];
  topic: Topic;

  constructor(name: string, current: boolean = false) {
    this.id = generateId('channel');
    this.logs = [];
    this.name = name;
    this.names = [];
    this.current = current;
    this.topic = null;
  }

  send(nick: string, text: string) {
    this.logs = Log.append(this.logs, Log.say(nick, text));
  }

  join(nick: string, message: IrcRawMessage) {
    this.logs = Log.append(this.logs, Log.join(nick, message));
  }

  part(nick: string, reason: string, message: IrcRawMessage) {
    this.logs = Log.append(this.logs, Log.part(nick, reason, message));
  }

  whois(info: Dict<string>) {
    this.logs = Log.appendList(this.logs, Log.whois(info));
  }

  kick(channel: string, nick: string, by: string, reason: string) {
    this.logs = Log.append(this.logs, Log.kick(channel, nick, by, reason));
  }

  setNames(names: Name[]) {
    this.names = Name.sort(names);
  }

  addName(nick: string) {
    this.names.push(new Name(nick));
    this.names = Name.sort(this.names);
  }

  removeName(nick: string) {
    this.names = Name.remove(this.names, nick);
  }

  updateName(oldNick: string, newNick: string) {
    this.logs = Log.append(this.logs, Log.updateName(oldNick, newNick));
    this.names = Name.sort(Name.update(this.names, oldNick, newNick));
  }

  giveMode(mode: string, by: string, to: string) {
    this.logs = Log.append(this.logs, Log.giveMode(mode, by, to));
    this.names = Name.sort(Name.giveMode(this.names, to, mode));
  }

  takeMode(mode: string, by: string, from: string) {
    this.logs = Log.append(this.logs, Log.takeMode(mode, by, from));
    this.names = Name.sort(Name.takeMode(this.names, from, mode));
  }

  setTopic(topic: string, by: string) {
    this.topic = new Topic(topic, by);
    this.showTopic();
  }

  showTopic() {
    if (this.topic) {
      this.logs = Log.append(this.logs, Log.topic(this.name, this.topic));
    } else {
      let noTopic = new Topic('no topic');
      this.logs = Log.append(this.logs, Log.topic(this.name, noTopic));
    }
  }

  static current(channels: Channel[]): Channel {
    return _.find(channels, c => c.current);
  }

  static get(channels: Channel[], name: string): Channel {
    return _.find(channels, c => (c.name === name));
  }

  static setCurrent(channels: Channel[], name: string): Channel[] {
    return channels.map(function (channel) {
      if (channel.name === name) {
        channel.current = true;
      } else {
        channel.current = false;
      }
      return channel;
    });
  }

  static next(channels: Channel[]): Channel {
    let currentIndex = channels.indexOf(Channel.current(channels));
    let nextIndex = (currentIndex + 1) % channels.length;
    return channels[nextIndex];
  }

  static previous(channels: Channel[]): Channel {
    let currentIndex = channels.indexOf(Channel.current(channels));
    let previousIndex = (currentIndex - 1) % channels.length;
    if (previousIndex < 0) {
      previousIndex += channels.length;
    }
    return channels[previousIndex];
  }

  static remove(channels: Channel[], name: string): Channel[] {
    return _.reject(channels, c => (c.name === name));
  }
}

export = Channel;
