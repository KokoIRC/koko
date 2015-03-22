export default class Channels {
  constructor(rootChannelName) {
    this._channels = [{name: rootChannelName, current: true}];
  }

  map(func) {
    return this._channels.map(func);
  }

  _channelOperations(target) {
    return {
      send: function (nick, text) {
        // FIXME
        console.log(target.name, nick, text);
        return this;
      }.bind(this)
    }
  }

  to(name) {
    var target = this._channels.filter(c => (c.name === name))[0];
    if (!target) {
      target = {
        name,
        current: false,
      };
      this._channels.push(target);
    }

    return this._channelOperations(target);
  }
}
