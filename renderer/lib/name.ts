import _ = require('underscore');
import generateId = require('./id-generator');

class Name {
  id: number;
  nick: string;
  mode: string;
  isMe: boolean;

  constructor(nick: string, mode: string = '', isMe: boolean = false) {
    this.id = generateId('name');
    this.nick = nick;
    this.mode = mode;
    this.isMe = isMe;
  }

  static sort(names: Name[]): Name[] {
    return names.sort(function (a, b) {
      let aMode = a.mode === '@' ? 2 : (a.mode === '+' ? 1 : 0);
      let bMode = b.mode === '@' ? 2 : (b.mode === '+' ? 1 : 0);
      if (aMode !== bMode) {
        return bMode - aMode;
      }

      return a.nick.localeCompare(b.nick);
    });
  }

  static remove(names: Name[], nick: string): Name[] {
    return _.reject(names, function (name: Name) {
      return name.nick === nick;
    });
  }

  static update(names: Name[], oldNick: string, newNick: string): Name[] {
    return names.map(name => {
      if (name.nick === oldNick) {
        name.nick = newNick;
      }
      return name;
    });
  }

  static giveMode(names: Name[], nick: string, mode: string): Name[] {
    return names.map(function (name) {
      if (name.nick === nick) {
        name.mode = mode === 'o' ? '@' : (mode === 'v' ? '+' : name.mode);
      }
      return name;
    });
  }

  static takeMode(names: Name[], nick: string, mode: string): Name[] {
    if (mode === 'o' || mode === 'v') {
      return names.map(function (name) {
        if (name.nick === nick) {
          name.mode = '';
        }
        return name;
      });
    } else {
      return names;
    }
  }
}

export = Name;
