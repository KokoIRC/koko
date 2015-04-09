import _ from 'underscore';

export default class Names {
  constructor() {
    this._channels = {};
  }

  _sort(channelName) {
    if (!this._channels[channelName]) {
      return;
    }
    this._channels[channelName] = this._channels[channelName].sort(function (a, b) {
      let aMode = a.mode === '@' ? 2 : (a.mode === 'v' ? 1 : 0);
      let bMode = b.mode === '@' ? 2 : (b.mode === 'v' ? 1 : 0);
      if (aMode !== bMode) {
        return bMode - aMode;
      }

      return a.name.localeCompare(b.name);
    });
  }

  set(channelName, names) {
    this._channels[channelName] = names;
    this._sort(channelName);
  }

  get(channelName) {
    return this._channels[channelName]
  }

  add(channelName, nameToAdd) {
    let channel = this._channels[channelName];
    if (channel) {
      channel.push({
        name: nameToAdd,
        mode: '',
        isMe: false,
      });
      this._sort(channelName);
    }
  }

  remove(channelName, nameToRemove) {
    let channel = this._channels[channelName];
    if (channel) {
      this._channels[channelName] = _.reject(channel, function (name) {
        return name.name === nameToRemove;
      });
      this._sort(channelName);
    }
  }

  update(channelName, oldName, newName) {
    let channel = this._channels[channelName];
    if (channel) {
      this._channels[channelName] = channel.map(function (name) {
        if (name.name === oldName) {
          console.log(name.name);
          console.log(oldName);
          console.log(newName);
          name.name = newName;
        }
        return name;
      });
      this._sort(channelName);
    }
  }

  delete(channelName) {
    delete this._channels[channelName];
  }
}
