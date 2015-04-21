import _ = require('underscore');

class Names {
  private _channels: {[name: string]: IrcName[]};

  constructor() {
    this._channels = {};
  }

  _sort(channelName: string) {
    if (!this._channels[channelName]) {
      return;
    }
    this._channels[channelName] = this._channels[channelName].sort(function (a, b) {
      let aMode = a.mode === '@' ? 2 : (a.mode === '+' ? 1 : 0);
      let bMode = b.mode === '@' ? 2 : (b.mode === '+' ? 1 : 0);
      if (aMode !== bMode) {
        return bMode - aMode;
      }

      return a.nick.localeCompare(b.nick);
    });
  }

  set(channelName: string, names: IrcName[]) {
    this._channels[channelName] = names;
    this._sort(channelName);
  }

  get(channelName: string): IrcName[] {
    return this._channels[channelName]
  }

  add(channelName: string, nickToAdd: string) {
    let channel = this._channels[channelName];
    if (channel) {
      channel.push({
        nick: nickToAdd,
        mode: '',
        isMe: false,
      });
      this._sort(channelName);
    }
  }

  remove(channelName: string, nickToRemove: string) {
    let channel = this._channels[channelName];
    if (channel) {
      this._channels[channelName] = _.reject(channel, function (name) {
        return name.nick === nickToRemove;
      });
      this._sort(channelName);
    }
  }

  update(channelName: string, oldNick: string, newNick: string) {
    let channel = this._channels[channelName];
    if (channel) {
      this._channels[channelName] = channel.map(function (name) {
        if (name.nick === oldNick) {
          name.nick = newNick;
        }
        return name;
      });
      this._sort(channelName);
    }
  }

  delete(channelName: string) {
    delete this._channels[channelName];
  }
}

export = Names;
