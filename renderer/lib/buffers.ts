import _ = require('underscore');
import generateId = require('./id-generator');
import log = require('./logs');

export class Buf { // Buffer exists as a default class
  id: number;
  name: string;
  logs: log.Logs;
  private _current: boolean;

  constructor(name: string) {
    this.id = generateId('buf');
    this.name = name;
    this.logs = new log.Logs();
    this._current = false;
  }

  current(isCurrent?: boolean): boolean {
    if (!_.isUndefined(isCurrent)) {
      this._current = isCurrent;
    }
    return this._current;
  }
}

export class Buffers {
  private _rootBuf: Buf;
  private _buffers: Buf[];

  constructor(rootBufName: string) {
    this._rootBuf = new Buf(rootBufName);
    this._rootBuf.current(true);
    this._buffers = [this._rootBuf];
  }

  send(to: string, nick: string, text: string) {
    let target = this.target(to);
    target.logs.say(nick, text);
  }

  joinMessage(channel: string, nick: string, message: IrcRawMessage) {
    let target = this.target(channel);
    target.logs.join(nick, message);
  }

  partMessage(channel: string, nick: string, reason: string, message: IrcRawMessage) {
    let target = this.target(channel);
    target.logs.part(nick, reason, message);
  }

  changeNick(channel: string, oldNick: string, newNick: string) {
    let target = this.target(channel);
    target.logs.changeNick(oldNick, newNick);
  }

  giveMode(channel: string, mode: string, by: string, to: string) {
    let target = this.target(channel);
    target.logs.giveMode(mode, by, to);
  }

  takeMode(channel: string, mode: string, by: string, to: string) {
    let target = this.target(channel);
    target.logs.takeMode(mode, by, to);
  }

  whois(channel: string, info: Dict<string>) {
    let target = this.target(channel);
    target.logs.whois(info);
  }

  kick(bufferToShow: string, channel: string, nick: string, by: string, reason: string) {
    let target = this.target(bufferToShow);
    target.logs.kick(channel, nick, by, reason);
  }

  target(name: string): Buf {
    let target = this._buffers.filter(c => (c.name === name))[0];
    if (!target) {
      target = new Buf(name);
      this._buffers.push(target);
    }

    return target;
  }

  add(name: string) {
    this.target(name);
  }

  remove(name: string) {
    if (name === this._rootBuf.name) {
      return;
    }

    let lastBufferName = this._rootBuf.name;
    this._buffers = this._buffers.filter(function (buffer) {
      if (buffer.name === name) {
        return false;
      } else {
        lastBufferName = buffer.name;
        return true;
      }
    });
    this.setCurrent(lastBufferName);
  }

  setCurrent(bufName: string) {
    this._buffers = this._buffers.map(function (buffer) {
      if (buffer.name === bufName) {
        buffer.current(true);
      } else {
        buffer.current(false);
      }
      return buffer;
    });
  }

  current(): Buf {
    return this._buffers.filter(c => c.current())[0];
  }

  next(): Buf {
    let currentIndex = this._buffers.indexOf(this.current());
    let nextIndex = (currentIndex + 1) % this._buffers.length;
    return this._buffers[nextIndex];
  }

  previous(): Buf {
    let currentIndex = this._buffers.indexOf(this.current());
    let previousIndex = (currentIndex - 1) % this._buffers.length;
    if (previousIndex < 0) {
      previousIndex += this._buffers.length;
    }
    return this._buffers[previousIndex];
  }

  map<T>(func: (buf: Buf) => T): T[] {
    return this._buffers.map<T>(func);
  }
}
