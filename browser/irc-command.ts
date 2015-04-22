import _ = require('underscore');

const commands: Dict<string[]> = {
  'join': ['channel'],
  'part': ['?channel', '?message'],
  'ctcp': ['target', 'type', 'text'],
  'action': ['target', 'message'],
  'whois': ['nick'],
  'list': [],
  'nick': ['nick'],
  'mode': ['?channel', 'mode', 'nick'],
};

class CommandError implements Error {
  message: string;
  constructor(message: string) {
    this.message = message;
    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.defineProperty(this, 'stack', { value: (new Error()).stack });
    }
  }

  get name() {
    return (<any>this.constructor).name;
  }
}

const IrcCommand = {
  parse(raw: string, context: CommandContext): IrcCommand {
    let tokens = raw.split(' ');
    let name = tokens[0];
    let args = tokens.splice(1);
    let command = commands[name];

    if (!command) {
      throw new Error('Invalid command name');
    }

    args = this.parseArgs(name, _.clone(command), args, context);
    return {name, args};
  },
  parseArgs(name: string, argList: string[], args: string[], context: CommandContext): string[] {
    function getNeededArgsLength(args) {
      return args.filter(s => s.charAt(0) !== '?').length;
    }

    let parsedArgs = [];
    while (true) {
      let argNeeded = argList.shift();
      if (_.isUndefined(argNeeded)) {
        break;
      }
      if (argNeeded[0] !== '?') {
        let arg = args.shift();
        if (_.isUndefined(arg)) {
          throw new CommandError(`Invalid command arguments: [${argNeeded}]`);
        } else {
          parsedArgs.push(arg);
        }
      } else {
        if (getNeededArgsLength(argList) < args.length) {
          parsedArgs.push(args.shift());
        } else if (getNeededArgsLength(argList) === args.length) {
          parsedArgs.push(undefined);
        } else {
          throw new CommandError(`Invalid command arguments: [${argNeeded}]`);
        }
      }
    }
    return parsedArgs.map<string>((arg, idx) => {
      return this.processArg(name, arg, idx, context);
    });
  },
  processArg(name: string, value: string, idx: number, context: CommandContext): string {
    switch (name) {
    case 'join':
      if (idx === 0) {
        if (value[0] !== '#') {
          value = '#' + value;
        }
      }
      break;
    case 'part':
      if (idx === 0) {
        if (_.isUndefined(value)) {
          value = context.target;
        } else if (value[0] !== '#') {
          value = '#' + value;
        }
      }
      break;
    case 'mode':
      if (idx === 0) {
        if (_.isUndefined(value)) {
          value = context.target;
        } else if (value[0] !== '#') {
          value = '#' + value;
        }
      } else if (idx === 1) {
        if (!(value[0] === '+' || value[0] === '0')) {
          value = '+' + value;
        }
      }
    }
    return value;
  },
};

export = IrcCommand;
