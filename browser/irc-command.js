import _ from 'underscore';

const commands = {
  'join': {args: ['channel']},
  'part': {args: ['?channel', '?message']},
  'ctcp': {args: ['target', 'type', 'text']},
  'action': {args: ['target', 'message']},
  'whois': {args: ['nick']},
  'list': {args: []},
  'nick': {args: ['nick']},
  'mode': {args: ['?channel', 'mode', 'nick']},
};

class CommandError extends Error {
  constructor(message) {
    super(message);
    if (Error.hasOwnProperty('captureStackTrace')) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.defineProperty(this, 'stack', { value: (new Error()).stack });
    }
    Object.defineProperty(this, 'message', { value: message });
  }

  get name() {
    return this.constructor.name;
  }
}

export const CommandParser = {
  parse(raw, context) {
    let tokens = raw.split(' ');
    let name = tokens[0];
    let args = tokens.splice(1);
    let command = commands[name];

    if (!command) {
      throw new Error('Invalid command name');
    }

    args = this.parseArgs(name, _.clone(command.args), args, context);
    return {name, args};
  },
  parseArgs(name, argList, args, context) {
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
    return parsedArgs.map(function (arg, idx) {
      return this.processArg(name, arg, idx, context);
    }.bind(this));
  },
  processArg(name, value, idx, context) {
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
