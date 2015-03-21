var Channels = function (rootChannelName) {
  this._channels = [{name: rootChannelName, current: true}];
};

Channels.prototype.map = function (func) {
  return this._channels.map(func);
};

module.exports = Channels;
