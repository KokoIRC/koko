import _ from 'underscore';
import configuration from './configuration';
import keyConfig from '../../config/keys';

const specialKeyIdentifiers = {
  'U+001B': 'escape',
  'U+0020': 'space',
  'U+0008': 'backspace',
  'U+007F': 'delete',
};

const keyAlias = {
  'esc': 'escape',
  'ctrl': 'control',
  'cmd': 'meta',
};

const waiterClearTimeout = configuration.get('shortcut-serial-input-timeout');

class KeyWaiter {
  constructor(eventName, keys) {
    this.eventName = eventName;
    this._waitingKeys = keys;
  }

  static matches(configInput, key, modifierState) {
    return configInput.key === key &&
           (!configInput.modifier || modifierState[configInput.modifier]);
  }

  isWaiting(key, modifierState) {
    return KeyWaiter.matches(this._waitingKeys[0], key, modifierState);
  }

  consumeOne() {
    this._waitingKeys.shift();
  }

  consume(key, modifierState) {
    if (this.isWaiting(key, modifierState)) {
      this.consumeOne();
    }
  }

  isDone() {
    return this._waitingKeys.length === 0;
  }
}

class ShortcutManager {
  constructor(rawConfig) {
    this.config = this.parseRawConfig(rawConfig);
    this._handlers = {};
    this._waiters = [];
    this._waiterClearTimer = null;
  }

  parseRawConfig(rawConfig) {
    return _.pairs(rawConfig).map(function (pair) {
      let action = pair[0];
      let shortcuts = pair[1].map(function (keyStr) {
        let keys = keyStr.indexOf('>') >= 0 ? keyStr.split('>') : [keyStr];
        return keys.map(function (keyString) {
          let pair = keyString.split('+');
          let key, modifier;
          if (pair.length === 2) {
            modifier = pair[0].toLowerCase();
            key = pair[1];
          } else {
            key = pair[0];
            if (/^[A-Z]$/.exec(key)) {
              modifier = 'shift';
            }
          }
          key = key.toLowerCase();

          modifier = keyAlias[modifier] ? keyAlias[modifier] : modifier;
          key = keyAlias[key] ? keyAlias[key] : key;
          return {key, modifier};
        });
      });
      return {action, shortcuts};
    });
  }

  initialize() {
    window.addEventListener('keydown', function (e) {
      let key = e.keyIdentifier;
      if (key.indexOf('U+') === 0) {
        key = specialKeyIdentifiers[key]
          ? specialKeyIdentifiers[key]
          : String.fromCodePoint(parseInt(key.substring(2), 16));
      }

      if (typeof key === 'string') {
        this.keyEventHandler(key.toLowerCase(), this.modifierState(e));
      }
    }.bind(this));
  }

  modifierState(e) {
    return ['Alt', 'Control', 'Meta', 'Shift'].reduce((result, key) =>
      _.extend(result, {[key.toLowerCase()]: e.getModifierState(key)}), {});
  }

  keyEventHandler(key, modifierState) {
    if (this._waiters.length > 0) {
      for (let waiter of this._waiters) {
        waiter.consume(key, modifierState);
        if (waiter.isDone()) {
          this.happen(waiter.eventName);
          this.clearWaiters();
          return;
        }
        this.resetWaiterClearTimer();
      }
    } else {
      for (let config of this.config) {
        for (let inputs of config.shortcuts) {
          if (KeyWaiter.matches(inputs[0], key, modifierState)) {
            if (inputs.length === 1) {
              this.happen(config.action);
              return;
            } else {
              this._waiters.push(new KeyWaiter(config.action,
                                               _.tail(inputs)));
              this.resetWaiterClearTimer();
            }
          }
        }
      }
    }
  }

  resetWaiterClearTimer() {
    clearTimeout(this._waiterClearTimer);
    this._waiterClearTimer = setTimeout(this.clearWaiters.bind(this),
                                        waiterClearTimeout);
  }

  clearWaiters() {
    clearTimeout(this._waiterClearTimer);
    this._waiterClearTimer = null;
    this._waiters = [];
  }

  on(eventName, handler) {
    let eventList = this._handlers[eventName];
    if (_.isUndefined(eventList)) {
      this._handlers[eventName] = [];
      eventList = this._handlers[eventName];
    }
    eventList.push(handler);
  }

  happen(eventName) {
    let eventList = this._handlers[eventName];
    if (eventList) {
      eventList.forEach(eventHandler =>
        setTimeout(eventHandler, 0));
    }
  }

  off(eventName) {
    delete this._handlers[eventName];
  }
}

export default new ShortcutManager(keyConfig);
