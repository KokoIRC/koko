export default class Channels {
  constructor(rootChannelName) {
    this._channels = [{name: rootChannelName, current: true}];
  }

  map(func) {
    return this._channels.map(func);
  }
}
