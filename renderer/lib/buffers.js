import Logs from './logs';

class Buf { // Buffer exists as a default class
  constructor(name) {
    this.name = name;
    this.logs = new Logs();
    this._current = false;
  }

  current(set) {
    if (typeof set === 'undefined') {
      return this._current;
    } else {
      this._current = set;
    }
  }
}

export default class Buffers {
  constructor(rootBufName) {
    this._rootBuf = new Buf(rootBufName);
    this._rootBuf.current(true);
    this._buffers = [this._rootBuf];
  }

  send(to, nick, text) {
    let target = this.target(to);
    target.logs.say(nick, text);
  }

  joinMessage(channel, nick, message, isMe=false) {
    let target = this.target(channel);
    target.logs.join(nick, message);
  }

  partMessage(channel, nick, reason, message) {
    let target = this.target(channel);
    target.logs.part(nick, reason, message);
  }

  changeNick(channel, oldNick, newNick) {
    let target = this.target(channel);
    target.logs.changeNick(oldNick, newNick);
  }

  target(name) {
    let target = this._buffers.filter(c => (c.name === name))[0];
    if (!target) {
      target = new Buf(name);
      this._buffers.push(target);
    }

    return target;
  }

  add(name) {
    this.target(name);
  }

  remove(name) {
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

  setCurrent(bufName) {
    this._buffers = this._buffers.map(function (buffer) {
      if (buffer.name === bufName) {
        buffer.current(true);
      } else {
        buffer.current(false);
      }
      return buffer;
    });
  }

  current() {
    return this._buffers.filter(c => c.current())[0];
  }

  next() {
    let currentIndex = this._buffers.indexOf(this.current());
    let nextIndex = (currentIndex + 1) % this._buffers.length;
    return this._buffers[nextIndex];
  }

  previous() {
    let currentIndex = this._buffers.indexOf(this.current());
    let previousIndex = (currentIndex - 1) % this._buffers.length;
    if (previousIndex < 0) {
      previousIndex += this._buffers.length;
    }
    return this._buffers[previousIndex];
  }

  map(func) {
    return this._buffers.map(func);
  }
}
