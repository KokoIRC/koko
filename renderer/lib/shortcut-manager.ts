import _ = require('underscore');
import configuration = require('./configuration');

export const specialKeys: IDict<string> = {
  'U+001B': 'escape',
  'U+0020': 'space',
  'U+0008': 'backspace',
  'U+007F': 'delete',
  'U+0009': 'tab',
};

const keyAlias: IDict<string> = {
  'esc': 'escape',
  'ctrl': 'control',
  'cmd': 'meta',
};

const waiterClearTimeout = configuration.get('app', 'shortcut-serial-input-timeout');

class KeyWaiter {
  eventName: string;
  private _waitingKeys: IShortcutKeyInput[];

  constructor(eventName: string, keys) {
    this.eventName = eventName;
    this._waitingKeys = keys;
  }

  static matches(configInput: IShortcutKeyInput, key: string, modifierState: IModifierState) {
    return configInput.key === key &&
           (!configInput.modifier || modifierState[configInput.modifier]);
  }

  isWaiting(key: string, modifierState: IModifierState) {
    return KeyWaiter.matches(this._waitingKeys[0], key, modifierState);
  }

  consumeOne() {
    this._waitingKeys.shift();
  }

  consume(key: string, modifierState: IModifierState) {
    if (this.isWaiting(key, modifierState)) {
      this.consumeOne();
    }
  }

  isDone(): boolean {
    return this._waitingKeys.length === 0;
  }
}

class ShortcutManager {
  private config: IShortcutKeyConfig[];
  private _handlers: {[eventName: string]: IShortcutCallback[]};
  private _waiters: KeyWaiter[];
  private _waiterClearTimer: number;

  constructor(rawConfig: any) {
    this.config = this.parseRawConfig(rawConfig);
    this._handlers = {};
    this._waiters = [];
    this._waiterClearTimer = null;
  }

  parseRawConfig(rawConfig: any): IShortcutKeyConfig[] {
    return _.pairs(rawConfig).map(function (pair) {
      let action = pair[0];
      let shortcuts = pair[1].map(function (keyStr) {
        let keys = keyStr.includes('>') ? keyStr.split('>') : [keyStr];
        return keys.map(function (keyString) {
          let pair = keyString.split('+');
          let key, modifier;
          if (pair.length === 2) {
            modifier = pair[0].toLowerCase();
            key = pair[1].toLowerCase();
          } else {
            key = pair[0];
          }

          modifier = keyAlias[modifier] ? keyAlias[modifier] : modifier;
          key = keyAlias[key] ? keyAlias[key] : key;
          return {key, modifier};
        });
      });
      return {action, shortcuts};
    });
  }

  initialize() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      let key = e.keyIdentifier;
      if (key.startsWith('U+')) {
        key = specialKeys[key]
          ? specialKeys[key]
          : (<any>String).fromCodePoint(parseInt(key.substring(2), 16));
      }

      if (typeof key === 'string') {
        let modifierState = this.modifierState(e);
        key = (/^[a-zA-Z]$/.exec(key) && modifierState.shift) ? key.toUpperCase() : key.toLowerCase();
        this.keyEventHandler(key, modifierState);
      }
    });
  }

  modifierState(e: KeyboardEvent): IModifierState {
    return ['Alt', 'Control', 'Meta', 'Shift'].reduce((result, key) =>
      _.extend(result, {[key.toLowerCase()]: e.getModifierState(key)}), {} as IModifierState);
  }

  keyEventHandler(key: string, modifierState: IModifierState) {
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
    this._waiterClearTimer = setTimeout(() => this.clearWaiters(),
                                        waiterClearTimeout);
  }

  clearWaiters() {
    clearTimeout(this._waiterClearTimer);
    this._waiterClearTimer = null;
    this._waiters = [];
  }

  on(eventName: string, handler: IShortcutCallback) {
    let eventList = this._handlers[eventName];
    if (_.isUndefined(eventList)) {
      this._handlers[eventName] = [];
      eventList = this._handlers[eventName];
    }
    eventList.push(handler);
  }

  happen(eventName: string) {
    let eventList = this._handlers[eventName];
    if (eventList) {
      eventList.forEach(eventHandler =>
        setTimeout(eventHandler, 0));
    }
  }

  off(eventName: string) {
    delete this._handlers[eventName];
  }
}

export let Manager = new ShortcutManager(configuration.getConfig('keys'));
