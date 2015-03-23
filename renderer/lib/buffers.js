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
    let rootBuf = new Buf(rootBufName);
    rootBuf.current(true);
    this._buffers = [rootBuf];
  }

  _bufferOps(target) {
    return {
      send: function (nick, text) {
        target.logs.append(nick, text);
        return this;
      }.bind(this)
    }
  }

  to(name) {
    let target = this._buffers.filter(c => (c.name === name))[0];
    if (!target) {
      target = new Buf(name);
      this._buffers.push(target);
    }

    return this._bufferOps(target);
  }

  setCurrent(bufName) {
    this._buffers = this._buffers.map(function (buffer) {
      if (buffer.name === bufName) {
        buffer.current(true);
      } else {
        buffer.current(false);
      }
    });
  }

  current() {
    return this._buffers.filter(c => c.current())[0];
  }

  map(func) {
    return this._buffers.map(func);
  }
}
